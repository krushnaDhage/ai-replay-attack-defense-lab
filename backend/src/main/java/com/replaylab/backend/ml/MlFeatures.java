package com.replaylab.backend.ml;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Feature vector sent to the Python ML service.
 * Supports both traditional replay flags and behavioral anomaly features.
 */
public record MlFeatures(
    double requestFrequency,
    int transactionIdReuse,
    int nonceReuse,
    long timestampAge,
    double requestInterval,
    int ipChanged,
    int sessionChanged,
    double behaviorDeviation,
    long previousRequestCount,
    long duplicateRequestCount,
    double sessionSequenceDeviation,
    double transactionFrequency,
    double sessionDuration,
    double loginTimeDeviation,
    int deviceDeviation
) {
    public MlFeatures(
        double requestFrequency,
        int transactionIdReuse,
        int nonceReuse,
        long timestampAge,
        double requestInterval,
        int ipChanged,
        int sessionChanged,
        double behaviorDeviation,
        long previousRequestCount,
        long duplicateRequestCount
    ) {
        this(requestFrequency, transactionIdReuse, nonceReuse, timestampAge, requestInterval,
             ipChanged, sessionChanged, behaviorDeviation, previousRequestCount, duplicateRequestCount,
             0.0, 0.0, 60.0, 0.0, 0);
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("requestFrequency", requestFrequency);
        map.put("transactionIdReuse", transactionIdReuse);
        map.put("nonceReuse", nonceReuse);
        map.put("timestampAge", timestampAge);
        map.put("requestInterval", requestInterval);
        map.put("ipChanged", ipChanged);
        map.put("sessionChanged", sessionChanged);
        map.put("behaviorDeviation", behaviorDeviation);
        map.put("previousRequestCount", previousRequestCount);
        map.put("duplicateRequestCount", duplicateRequestCount);
        map.put("sessionSequenceDeviation", sessionSequenceDeviation);
        map.put("transactionFrequency", transactionFrequency);
        map.put("sessionDuration", sessionDuration);
        map.put("loginTimeDeviation", loginTimeDeviation);
        map.put("deviceDeviation", deviceDeviation);
        return map;
    }
}
