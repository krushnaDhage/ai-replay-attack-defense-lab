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

    public MlFeatures extract(TransactionRequest request,
                               Long userId,
                               String sourceIp,
                               String sessionId,
                               boolean transactionIdReused,
                               boolean nonceReused,
                               long timestampAgeSecs,
                               boolean fingerprintDuplicate) {
        return extract(request, userId, sourceIp, sessionId, transactionIdReused, nonceReused, timestampAgeSecs, fingerprintDuplicate, null);
    }

    public MlFeatures extract(TransactionRequest request,
                               Long userId,
                               String sourceIp,
                               String sessionId,
                               boolean transactionIdReused,
                               boolean nonceReused,
                               long timestampAgeSecs,
                               boolean fingerprintDuplicate,
                               MlFeatures customBehavioralOverrides) {

        if (customBehavioralOverrides != null) {
            return customBehavioralOverrides;
        }

        Instant windowStart = Instant.now().minusSeconds(60);
        long recentCount = transactionRepository.countRecentByUser(userId, windowStart);
        double requestFrequency = recentCount;

        double requestInterval = recentCount > 0 ? 60.0 / recentCount : 60.0;
        int ipChanged = 0;
        int sessionChanged = 0;

        double behaviorDeviation = 0.0;
        if (requestFrequency > 10) behaviorDeviation += 0.3;
        if (transactionIdReused) behaviorDeviation += 0.4;
        if (nonceReused) behaviorDeviation += 0.3;
        behaviorDeviation = Math.min(behaviorDeviation, 1.0);

        long duplicateCount = transactionRepository.countReplays();

        double sessionSeqDev = requestFrequency > 5 ? Math.min(0.2 + (requestFrequency * 0.05), 0.9) : 0.05;
        double txFreq = requestFrequency;
        double sessionDuration = 60.0;
        double loginDev = 0.05;
        int deviceDev = 0;

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
            duplicateCount,
            sessionSeqDev,
            txFreq,
            sessionDuration,
            loginDev,
            deviceDev
        );
    }
}
