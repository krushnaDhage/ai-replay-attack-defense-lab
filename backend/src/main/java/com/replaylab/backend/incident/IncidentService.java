package com.replaylab.backend.incident;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.replaylab.backend.entity.SecurityEvent;
import com.replaylab.backend.entity.SecurityIncident;
import com.replaylab.backend.entity.Transaction;
import com.replaylab.backend.ml.MlPredictionResult;
import com.replaylab.backend.repository.SecurityEventRepository;
import com.replaylab.backend.repository.SecurityIncidentRepository;
import com.replaylab.backend.repository.TransactionRepository;
import com.replaylab.backend.risk.RiskSeverity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentService {

    private final SecurityIncidentRepository incidentRepository;
    private final SecurityEventRepository eventRepository;
    private final TransactionRepository transactionRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public SecurityIncident createIncident(Transaction tx,
                                            MlPredictionResult mlResult,
                                            RiskSeverity severity,
                                            List<String> evidence,
                                            List<String> actions,
                                            String explanation) {
        String incidentId = generateIncidentId();

        Map<String, Object> evidenceMap = new LinkedHashMap<>();
        evidenceMap.put("transactionId", tx.getTransactionId());
        evidenceMap.put("nonce", tx.getNonce());
        evidenceMap.put("mlPrediction", mlResult.prediction());
        evidenceMap.put("confidence", mlResult.confidence());
        evidenceMap.put("riskScore", mlResult.riskScore());
        evidenceMap.put("importantFeatures", mlResult.importantFeatures());
        evidenceMap.put("featureImportance", mlResult.featureImportance());
        evidenceMap.put("evidence", evidence);
        evidenceMap.put("actionsApplied", actions);
        evidenceMap.put("detectedAt", Instant.now().toString());

        String evidenceJson = toJson(evidenceMap);

        SecurityIncident incident = SecurityIncident.builder()
                .incidentId(incidentId)
                .attackType(mlResult.prediction())
                .severity(severity.name())
                .confidence(mlResult.confidence())
                .riskScore(mlResult.riskScore())
                .userId(tx.getUserId())
                .transactionId(tx.getTransactionId())
                .sourceIp(tx.getSourceIp())
                .detectedAt(Instant.now())
                .actionTaken(String.join(", ", actions))
                .status("MITIGATED")
                .explanation(explanation)
                .evidenceJson(evidenceJson)
                .build();

        incident = incidentRepository.save(incident);
        log.info("Incident created: {} for TX: {}", incidentId, tx.getTransactionId());

        // Log security event
        logEvent("INCIDENT_CREATED", "CRITICAL", tx.getTransactionId(),
                tx.getUserId(), tx.getSourceIp(),
                "Security incident " + incidentId + " created for " + mlResult.prediction(), null);

        return incident;
    }

    @Transactional
    public void logEvent(String eventType, String severity, String transactionId,
                          Long userId, String sourceIp, String description, Map<String, Object> metadata) {
        SecurityEvent event = SecurityEvent.builder()
                .eventType(eventType)
                .severity(severity)
                .transactionId(transactionId)
                .userId(userId)
                .sourceIp(sourceIp != null ? sourceIp : "127.0.0.1")
                .description(description)
                .metadataJson(metadata != null ? toJson(metadata) : null)
                .build();
        eventRepository.save(event);
    }

    public List<SecurityIncident> getAllIncidents() {
        return incidentRepository.findAllByOrderByDetectedAtDesc();
    }

    public List<SecurityEvent> getAllEvents() {
        return eventRepository.findAllByOrderByOccurredAtDesc();
    }

    public List<SecurityEvent> getRecentEvents(int minutes) {
        Instant since = Instant.now().minusSeconds(minutes * 60L);
        return eventRepository.findByOccurredAtAfterOrderByOccurredAtDesc(since);
    }

    public Map<String, Object> getDashboardMetrics() {
        long totalRequests = transactionRepository.count();
        long replayAttacks = transactionRepository.countReplays();
        long blocked = transactionRepository.countBlocked();
        long suspicious = transactionRepository.countSuspicious();
        long openIncidents = incidentRepository.countByStatus("OPEN");
        long mitigatedIncidents = incidentRepository.countByStatus("MITIGATED");
        long totalIncidents = incidentRepository.count();

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalRequests", totalRequests);
        metrics.put("requestsAnalyzed", totalRequests);
        metrics.put("suspiciousRequests", suspicious);
        metrics.put("replayAttacksDetected", replayAttacks);
        metrics.put("attacksBlocked", blocked);
        metrics.put("activeIncidents", openIncidents);
        metrics.put("totalIncidents", totalIncidents);
        metrics.put("mitigatedIncidents", mitigatedIncidents);
        metrics.put("detectionRate", totalRequests > 0 ? (double) replayAttacks / totalRequests * 100 : 0);
        metrics.put("blockRate", replayAttacks > 0 ? (double) blocked / replayAttacks * 100 : 0);
        return metrics;
    }

    private String generateIncidentId() {
        int year = Year.now().getValue();
        long count = incidentRepository.count() + 1;
        return String.format("INC-%d-%04d", year, count);
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
