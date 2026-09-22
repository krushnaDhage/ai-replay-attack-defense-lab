package com.replaylab.backend.ml;

import java.util.List;
import java.util.Map;

/**
 * Result returned from the Python ML service (or fallback heuristic).
 */
public record MlPredictionResult(
    String prediction,          // NORMAL, SUSPICIOUS, REPLAY_ATTACK
    double confidence,          // 0.0 – 1.0
    double riskScore,           // 0.0 – 100.0
    List<String> importantFeatures,
    Map<String, Double> featureImportance,
    boolean fromMlService       // true = real ML, false = fallback heuristic
) {}
