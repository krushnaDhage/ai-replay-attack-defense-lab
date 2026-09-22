package com.replaylab.backend.response;

import com.replaylab.backend.risk.RiskSeverity;

import java.util.List;

/**
 * Result of the response policy engine decision.
 */
public record ResponseResult(
    RiskSeverity severity,
    String prediction,
    boolean blocked,
    boolean incidentRequired,
    List<String> actionsApplied,
    String transactionStatus
) {}
