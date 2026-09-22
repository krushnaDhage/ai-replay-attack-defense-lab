package com.replaylab.backend.service;

import com.replaylab.backend.dto.TransactionRequest;
import com.replaylab.backend.repository.NonceRepository;
import com.replaylab.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReplayProtectionService {

    private final TransactionRepository transactionRepository;
    private final NonceRepository nonceRepository;

    @Value("${app.replay.freshness-window-seconds:300}")
    private long freshnessWindowSeconds;

    /**
     * Performs all traditional replay protection checks.
     * Returns a ReplayCheckResult with evidence of detected issues.
     */
    public ReplayCheckResult checkForReplay(TransactionRequest request, Instant requestTimestamp) {
        List<String> evidence = new ArrayList<>();
        boolean isReplay = false;

        // CHECK 1: Transaction ID reuse
        if (transactionRepository.existsByTransactionId(request.getTransactionId())) {
            evidence.add("Transaction ID '" + request.getTransactionId() + "' was previously processed");
            isReplay = true;
            log.warn("REPLAY CHECK: Transaction ID reuse detected: {}", request.getTransactionId());
        }

        // CHECK 2: Nonce reuse
        if (nonceRepository.existsByNonceValue(request.getNonce())) {
            evidence.add("Nonce '" + request.getNonce() + "' has already been used");
            isReplay = true;
            log.warn("REPLAY CHECK: Nonce reuse detected: {}", request.getNonce());
        }

        // CHECK 3: Timestamp freshness
        Instant clientTimestamp = (request.getTimestamp() != null) ? request.getTimestamp() : requestTimestamp;
        long ageSecs = Math.abs(Instant.now().getEpochSecond() - clientTimestamp.getEpochSecond());
        if (ageSecs > freshnessWindowSeconds) {
            evidence.add("Request timestamp is " + ageSecs + "s old (allowed window: " + freshnessWindowSeconds + "s)");
            isReplay = true;
            log.warn("REPLAY CHECK: Stale timestamp: {}s old", ageSecs);
        }

        // CHECK 4: Request fingerprint
        String fingerprint = computeFingerprint(request);
        if (transactionRepository.existsByRequestFingerprint(fingerprint)) {
            evidence.add("Duplicate request fingerprint detected (identical request content seen before)");
            isReplay = true;
            log.warn("REPLAY CHECK: Duplicate fingerprint: {}", fingerprint);
        }

        return new ReplayCheckResult(isReplay, evidence, fingerprint, ageSecs);
    }

    /**
     * Computes SHA-256 fingerprint over the key request fields.
     */
    public String computeFingerprint(TransactionRequest request) {
        try {
            String data = request.getTransactionId()
                    + "|" + request.getSenderAccount()
                    + "|" + request.getReceiverAccount()
                    + "|" + request.getAmount().toPlainString()
                    + "|" + request.getNonce();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    /**
     * Result of traditional replay protection checks.
     */
    public record ReplayCheckResult(
        boolean isReplay,
        List<String> evidence,
        String fingerprint,
        long timestampAgeSecs
    ) {}
}
