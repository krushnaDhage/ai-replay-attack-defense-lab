package com.replaylab.backend.risk;

/**
 * Risk severity levels corresponding to risk score ranges.
 * NORMAL     0-30
 * SUSPICIOUS 31-60
 * HIGH       61-80
 * CRITICAL   81-100
 */
public enum RiskSeverity {
    NORMAL,
    SUSPICIOUS,
    HIGH,
    CRITICAL;

    public static RiskSeverity from(double riskScore) {
        if (riskScore <= 30) return NORMAL;
        if (riskScore <= 60) return SUSPICIOUS;
        if (riskScore <= 80) return HIGH;
        return CRITICAL;
    }
}
