package com.replaylab.backend.ml;

import com.replaylab.backend.dto.TransactionRequest;
import com.replaylab.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
@RequiredArgsConstructor
public class FeatureExtractor {

    private final TransactionRepository transactionRepository;

    /**
     * Extracts ML features from a transaction request.
     * These features capture behavioral patterns used by the Random Forest classifier.
     */
    public MlFeatures extract(TransactionRequest request,
                               Long userId,
                               String sourceIp,
                               String sessionId,
                               boolean transactionIdReused,
                               boolean nonceReused,
                               long timestampAgeSecs,
                               boolean fingerprintDuplicate) {

        Instant windowStart = Instant.now().minusSeconds(60);
        long recentCount = transactionRepository.countRecentByUser(userId, windowStart);
        double requestFrequency = recentCount; // requests in last 60s

        // Approximate request interval (seconds between requests)
        double requestInterval = recentCount > 0 ? 60.0 / recentCount : 60.0;

        // IP changed: simplified — if sourceIp is from a known range we assume no change
        int ipChanged = 0; // extended in production with session tracking

        // Session change flag
        int sessionChanged = 0;

        // Behavior deviation score (heuristic)
        double behaviorDeviation = 0.0;
        if (requestFrequency > 10) behaviorDeviation += 0.3;
        if (transactionIdReused) behaviorDeviation += 0.4;
        if (nonceReused) behaviorDeviation += 0.3;
        behaviorDeviation = Math.min(behaviorDeviation, 1.0);

        long duplicateCount = transactionRepository.countReplays();

        return new MlFeatures(
            requestFrequency,
            transactionIdReused ? 1 : 0,
            nonceReused ? 1 : 0,
            timestampAgeSecs,
            requestInterval,
            ipChanged,
            sessionChanged,
            behaviorDeviation,
            recentCount,
            duplicateCount
        );
    }
}
