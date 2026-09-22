package com.replaylab.backend.ml;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Feature vector sent to the Python ML service.
 * All features are numeric for Random Forest compatibility.
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
    long duplicateRequestCount
) {
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
        return map;
    }
}
