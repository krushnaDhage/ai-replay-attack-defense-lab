package com.replaylab.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "security_events", indexes = {
    @Index(name = "idx_sevent_user_id", columnList = "userId"),
    @Index(name = "idx_sevent_tx_id", columnList = "transactionId"),
    @Index(name = "idx_sevent_type", columnList = "eventType")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String eventType;   // TRANSACTION, REPLAY_DETECTED, INCIDENT_CREATED, etc.

    @Column(length = 50)
    private String severity;    // INFO, WARNING, HIGH, CRITICAL

    @Column(length = 50)
    private String transactionId;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 50)
    private String sourceIp;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String metadataJson;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant occurredAt;
}
