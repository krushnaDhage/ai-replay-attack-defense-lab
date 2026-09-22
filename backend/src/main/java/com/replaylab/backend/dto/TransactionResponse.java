package com.replaylab.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String transactionId;
    private String senderAccount;
    private String receiverAccount;
    private BigDecimal amount;
    private String nonce;
    private String status;
    private String securityStatus;
    private String severity;
    private Double riskScore;
    private Double confidence;
    private String explanation;
    private List<String> evidence;
    private List<String> actionsApplied;
    private String mlPrediction;
    private Instant timestamp;
    @com.fasterxml.jackson.annotation.JsonProperty("isReplay")
    private boolean isReplay;
    private String incidentId;
}
