package com.replaylab.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_tx_transaction_id", columnList = "transactionId"),
    @Index(name = "idx_tx_nonce", columnList = "nonce"),
    @Index(name = "idx_tx_user_id", columnList = "userId"),
    @Index(name = "idx_tx_timestamp", columnList = "createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String transactionId;

    @Column(nullable = false, length = 50)
    private String senderAccount;

    @Column(nullable = false, length = 50)
    private String receiverAccount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 100)
    private String nonce;

    @Column(nullable = false)
    private Instant requestTimestamp;

    @Column(length = 256)
    private String requestFingerprint;

    @Column(length = 50)
    private String status;   // SUCCESS, BLOCKED, SUSPICIOUS

    @Column(length = 50)
    private String securityStatus;  // NORMAL, SUSPICIOUS, REPLAY_ATTACK

    @Column(nullable = false)
    private Long userId;

    @Column(length = 50)
    private String sourceIp;

    @Column(length = 100)
    private String sessionId;

    @Column
    private Double riskScore;

    @Column(length = 50)
    private String severity;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String mlResponseJson;

    @Column(columnDefinition = "TEXT")
    private String evidenceJson;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @Column
    @Builder.Default
    private boolean isReplay = false;
}
