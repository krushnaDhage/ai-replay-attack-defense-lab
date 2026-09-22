package com.replaylab.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "security_incidents", indexes = {
    @Index(name = "idx_incident_id", columnList = "incidentId"),
    @Index(name = "idx_incident_user_id", columnList = "userId"),
    @Index(name = "idx_incident_tx_id", columnList = "transactionId"),
    @Index(name = "idx_incident_detected_at", columnList = "detectedAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityIncident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String incidentId;  // INC-2024-0001

    @Column(nullable = false, length = 50)
    private String attackType;  // REPLAY_ATTACK

    @Column(nullable = false, length = 20)
    private String severity;    // CRITICAL

    @Column(nullable = false)
    private Double confidence;

    @Column(nullable = false)
    private Double riskScore;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 50)
    private String transactionId;

    @Column(length = 50)
    private String sourceIp;

    @Column(nullable = false)
    private Instant detectedAt;

    @Column(nullable = false, length = 1000)
    private String actionTaken;   // REQUEST_BLOCKED, SESSION_RESTRICTED, etc.

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "OPEN"; // OPEN, INVESTIGATING, MITIGATED, CLOSED

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String evidenceJson;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;
}
