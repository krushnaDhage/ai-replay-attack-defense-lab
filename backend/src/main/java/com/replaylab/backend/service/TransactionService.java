package com.replaylab.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.replaylab.backend.dto.TransactionRequest;
import com.replaylab.backend.dto.TransactionResponse;
import com.replaylab.backend.entity.NonceRecord;
import com.replaylab.backend.entity.Transaction;
import com.replaylab.backend.entity.User;
import com.replaylab.backend.incident.IncidentService;
import com.replaylab.backend.ml.FeatureExtractor;
import com.replaylab.backend.ml.MlFeatures;
import com.replaylab.backend.ml.MlPredictionResult;
import com.replaylab.backend.ml.MlServiceClient;
import com.replaylab.backend.repository.NonceRepository;
import com.replaylab.backend.repository.TransactionRepository;
import com.replaylab.backend.repository.UserRepository;
import com.replaylab.backend.response.ResponsePolicyEngine;
import com.replaylab.backend.response.ResponseResult;
import com.replaylab.backend.risk.RiskSeverity;
import com.replaylab.backend.service.ReplayProtectionService.ReplayCheckResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final NonceRepository nonceRepository;
    private final UserRepository userRepository;
    private final ReplayProtectionService replayProtectionService;
    private final MlServiceClient mlServiceClient;
    private final FeatureExtractor featureExtractor;
    private final ResponsePolicyEngine responsePolicyEngine;
    private final ExplanationService explanationService;
    private final IncidentService incidentService;
    private final ObjectMapper objectMapper;

    @Transactional
    public TransactionResponse processTransaction(TransactionRequest request,
                                                   String username,
                                                   String sourceIp,
                                                   String sessionId) {
        log.info("Processing transaction: {} from user: {}", request.getTransactionId(), username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Instant requestTimestamp = Instant.now();

        // ── STEP 1: Traditional Replay Protection ─────────────────────────
        ReplayCheckResult replayCheck = replayProtectionService.checkForReplay(request, requestTimestamp);
        List<String> allEvidence = new ArrayList<>(replayCheck.evidence());

        // ── STEP 2: Feature Extraction ────────────────────────────────────
        MlFeatures features = featureExtractor.extract(
            request, user.getId(), sourceIp, sessionId,
            replayCheck.isReplay() && replayCheck.evidence().stream().anyMatch(e -> e.contains("Transaction ID")),
            replayCheck.isReplay() && replayCheck.evidence().stream().anyMatch(e -> e.contains("Nonce")),
            replayCheck.timestampAgeSecs(),
            replayCheck.isReplay() && replayCheck.evidence().stream().anyMatch(e -> e.contains("fingerprint"))
        );

        // ── STEP 3: ML Prediction ─────────────────────────────────────────
        MlPredictionResult mlResult = mlServiceClient.predict(features);
        log.info("ML result: {} (risk: {:.1f})", mlResult.prediction(), mlResult.riskScore());

        // Merge traditional evidence with ML important features
        for (String feat : mlResult.importantFeatures()) {
            allEvidence.add("ML flagged feature: " + feat);
        }

        // ── STEP 4: Risk Assessment ───────────────────────────────────────
        // Boost risk if traditional checks already flagged it
        double finalRiskScore = mlResult.riskScore();
        if (replayCheck.isReplay() && finalRiskScore < 80) finalRiskScore = Math.max(finalRiskScore, 85.0);

        RiskSeverity severity = RiskSeverity.from(finalRiskScore);
        String finalPrediction = replayCheck.isReplay() && "NORMAL".equals(mlResult.prediction())
                ? "REPLAY_ATTACK" : mlResult.prediction();

        // ── STEP 5: AI Explanation ────────────────────────────────────────
        String explanation = explanationService.generateExplanation(
            finalPrediction, mlResult.confidence(), finalRiskScore, allEvidence);

        // ── STEP 6: Response Policy ───────────────────────────────────────
        ResponseResult response = responsePolicyEngine.determineResponse(severity, finalPrediction);

        // ── STEP 7: Persist Transaction ───────────────────────────────────
        String mlJson = toJson(Map.of(
            "prediction", mlResult.prediction(),
            "confidence", mlResult.confidence(),
            "riskScore", mlResult.riskScore(),
            "importantFeatures", mlResult.importantFeatures(),
            "featureImportance", mlResult.featureImportance(),
            "fromMlService", mlResult.fromMlService()
        ));

        Transaction tx = Transaction.builder()
                .transactionId(request.getTransactionId())
                .senderAccount(request.getSenderAccount())
                .receiverAccount(request.getReceiverAccount())
                .amount(request.getAmount())
                .nonce(request.getNonce())
                .requestTimestamp(requestTimestamp)
                .requestFingerprint(replayCheck.fingerprint())
                .status(response.transactionStatus())
                .securityStatus(finalPrediction)
                .userId(user.getId())
                .sourceIp(sourceIp)
                .sessionId(sessionId)
                .riskScore(finalRiskScore)
                .severity(severity.name())
                .explanation(explanation)
                .mlResponseJson(mlJson)
                .evidenceJson(toJson(allEvidence))
                .isReplay(replayCheck.isReplay())
                .build();

        tx = transactionRepository.save(tx);

        // ── STEP 8: Store nonce (only if not already known) ───────────────
        if (!nonceRepository.existsByNonceValue(request.getNonce())) {
            nonceRepository.save(NonceRecord.builder()
                    .nonceValue(request.getNonce())
                    .transactionId(request.getTransactionId())
                    .userId(user.getId())
                    .sourceIp(sourceIp)
                    .build());
        }

        // ── STEP 9: Create Incident if needed ─────────────────────────────
        String incidentId = null;
        if (response.incidentRequired()) {
            var incident = incidentService.createIncident(
                tx, mlResult, severity, allEvidence, response.actionsApplied(), explanation);
            incidentId = incident.getIncidentId();
        }

        // ── STEP 10: Log Security Event ───────────────────────────────────
        String eventType = replayCheck.isReplay() ? "REPLAY_DETECTED" : "TRANSACTION_PROCESSED";
        incidentService.logEvent(eventType, severity.name(),
            request.getTransactionId(), user.getId(), sourceIp,
            finalPrediction + " | Risk: " + String.format("%.1f", finalRiskScore), null);

        log.info("Transaction {} → status: {}, severity: {}, replay: {}",
            request.getTransactionId(), response.transactionStatus(), severity, replayCheck.isReplay());

        return TransactionResponse.builder()
                .id(tx.getId())
                .transactionId(tx.getTransactionId())
                .senderAccount(tx.getSenderAccount())
                .receiverAccount(tx.getReceiverAccount())
                .amount(tx.getAmount())
                .nonce(tx.getNonce())
                .status(response.transactionStatus())
                .securityStatus(finalPrediction)
                .severity(severity.name())
                .riskScore(finalRiskScore)
                .confidence(mlResult.confidence())
                .explanation(explanation)
                .evidence(allEvidence)
                .actionsApplied(response.actionsApplied())
                .mlPrediction(mlResult.prediction())
                .timestamp(requestTimestamp)
                .isReplay(replayCheck.isReplay())
                .incidentId(incidentId)
                .build();
    }

    public List<Transaction> getUserTransactions(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc();
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { return "{}"; }
    }
}
