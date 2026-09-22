package com.replaylab.backend.service;

import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Deterministic AI explanation generator.
 * Produces human-readable explanations from structured evidence.
 * Works without any external LLM — no API keys required.
 */
@Service
public class ExplanationService {

    public String generateExplanation(String prediction,
                                       double confidence,
                                       double riskScore,
                                       List<String> evidence) {
        if (evidence == null || evidence.isEmpty()) {
            return "No anomalies detected. Request appears legitimate.";
        }

        StringBuilder sb = new StringBuilder();

        switch (prediction) {
            case "ADAPTIVE_REPLAY", "SUSPICIOUS_BEHAVIOR" -> {
                sb.append(String.format(
                    "BEHAVIORAL ANOMALY DETECTED (ML confidence: %.1f%%, overall security risk score: %.1f/100). ",
                    confidence * 100, riskScore));
                sb.append("Traditional replay checks did not identify an exact duplicate because the transaction ID and nonce are new. ");
                sb.append("However, behavioral ML detected anomalous session activity: ");
                for (int i = 0; i < evidence.size(); i++) {
                    sb.append((i + 1)).append(") ").append(evidence.get(i)).append(". ");
                }
                sb.append("The system has automatically enforced policy: request blocked, session restricted, and security incident logged.");
            }
            case "REPLAY_ATTACK", "EXACT_REPLAY" -> {
                sb.append(String.format(
                    "EXACT REPLAY ATTACK DETECTED (confidence: %.1f%%, risk score: %.1f/100). ",
                    confidence * 100, riskScore));
                sb.append("The following security violations were identified: ");
                for (int i = 0; i < evidence.size(); i++) {
                    sb.append((i + 1)).append(") ").append(evidence.get(i)).append(". ");
                }
                sb.append("The system has automatically blocked this request and created a security incident. ");
                sb.append("Note: Traditional cryptographic/freshness checks are sufficient to block basic duplicates.");
            }
            case "SUSPICIOUS" -> {
                sb.append(String.format(
                    "SUSPICIOUS REQUEST DETECTED (confidence: %.1f%%, risk score: %.1f/100). ",
                    confidence * 100, riskScore));
                sb.append("The following anomalies were observed: ");
                for (String e : evidence) sb.append(e).append(". ");
                sb.append("The request has been flagged for monitoring.");
            }
            default -> {
                sb.append(String.format(
                    "Request classified as NORMAL (confidence: %.1f%%, risk score: %.1f/100). ",
                    confidence * 100, riskScore));
                sb.append("All replay protection checks passed. Transaction processed successfully.");
            }
        }

        return sb.toString();
    }
}
