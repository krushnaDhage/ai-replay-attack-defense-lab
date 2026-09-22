package com.replaylab.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "nonce_records", indexes = {
    @Index(name = "idx_nonce_value", columnList = "nonceValue"),
    @Index(name = "idx_nonce_tx_id", columnList = "transactionId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NonceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String nonceValue;

    @Column(nullable = false, length = 50)
    private String transactionId;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 50)
    private String sourceIp;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant usedAt;

    @Column
    @Builder.Default
    private boolean flaggedAsInvalid = false;
}
