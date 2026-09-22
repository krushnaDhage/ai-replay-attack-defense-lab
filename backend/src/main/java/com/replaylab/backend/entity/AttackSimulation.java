package com.replaylab.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "attack_simulations", indexes = {
    @Index(name = "idx_sim_tx_id", columnList = "originalTransactionId"),
    @Index(name = "idx_sim_user_id", columnList = "userId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttackSimulation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String originalTransactionId;

    @Column(nullable = false, length = 50)
    private String senderAccount;

    @Column(nullable = false, length = 50)
    private String receiverAccount;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 100)
    private String nonce;

    @Column(nullable = false)
    private Instant originalTimestamp;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 50)
    private String capturedFromIp;

    @Column(columnDefinition = "TEXT")
    private String capturedRequestJson;

    @Column
    @Builder.Default
    private boolean replayed = false;

    @Column
    private Instant replayedAt;

    @Column(length = 50)
    private String replayResult;  // BLOCKED, ALLOWED

    @CreationTimestamp
    @Column(updatable = false)
    private Instant capturedAt;
}
