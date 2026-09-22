package com.replaylab.backend.repository;

import com.replaylab.backend.entity.NonceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NonceRepository extends JpaRepository<NonceRecord, Long> {
    boolean existsByNonceValue(String nonceValue);
    Optional<NonceRecord> findByNonceValue(String nonceValue);
    boolean existsByTransactionId(String transactionId);
}
