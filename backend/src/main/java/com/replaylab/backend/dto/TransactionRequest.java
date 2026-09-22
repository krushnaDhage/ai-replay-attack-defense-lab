package com.replaylab.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class TransactionRequest {

    @NotBlank(message = "Transaction ID is required")
    @Size(max = 50)
    private String transactionId;

    @NotBlank(message = "Sender account is required")
    @Size(max = 50)
    private String senderAccount;

    @NotBlank(message = "Receiver account is required")
    @Size(max = 50)
    private String receiverAccount;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @DecimalMax(value = "1000000.00", message = "Amount exceeds maximum limit")
    private BigDecimal amount;

    @NotBlank(message = "Nonce is required")
    @Size(max = 100)
    private String nonce;

    // Optional: client-provided timestamp (ISO-8601). If null, server uses now.
    private Instant timestamp;
}
