package com.replaylab.backend.service;

import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Deterministic AI explanation generator.
 * Produces human-readable explanations from structured evidence.
 * Works without any external LLM — no API keys required.
 * An LLM can be wired in via environment variable in future.
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
            case "REPLAY_ATTACK" -> {
                sb.append(String.format(
                    "HIGH PROBABILITY REPLAY ATTACK DETECTED (confidence: %.1f%%, risk score: %.1f/100). ",
                    confidence * 100, riskScore));
                sb.append("The following security violations were identified: ");
                for (int i = 0; i < evidence.size(); i++) {
                    sb.append((i + 1)).append(") ").append(evidence.get(i)).append(". ");
                }
                sb.append("The system has automatically blocked this request and created a security incident. ");
                sb.append("A replay attack occurs when an adversary intercepts a legitimate request and retransmits it to fraudulently repeat an operation.");
            }
            case "SUSPICIOUS" -> {
                sb.append(String.format(
                    "SUSPICIOUS REQUEST DETECTED (confidence: %.1f%%, risk score: %.1f/100). ",
                    confidence * 100, riskScore));
                sb.append("The following anomalies were observed: ");
                for (String e : evidence) sb.append(e).append(". ");
                sb.append("The request has been flagged for review but allowed through pending investigation.");
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
