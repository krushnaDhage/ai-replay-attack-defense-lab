package com.replaylab.backend.repository;

import com.replaylab.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findFirstByTransactionIdOrderByCreatedAtDesc(String transactionId);
    default Optional<Transaction> findByTransactionId(String transactionId) {
        return findFirstByTransactionIdOrderByCreatedAtDesc(transactionId);
    }
    boolean existsByTransactionId(String transactionId);
    boolean existsByNonce(String nonce);
    boolean existsByRequestFingerprint(String fingerprint);
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Transaction> findBySourceIpAndCreatedAtAfter(String ip, Instant since);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.userId = :userId AND t.createdAt > :since")
    long countRecentByUser(Long userId, Instant since);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.isReplay = true")
    long countReplays();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'BLOCKED'")
    long countBlocked();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.securityStatus != 'NORMAL'")
    long countSuspicious();

    List<Transaction> findAllByOrderByCreatedAtDesc();

    @Query("SELECT t FROM Transaction t WHERE t.createdAt > :since ORDER BY t.createdAt DESC")
    List<Transaction> findRecentTransactions(Instant since);
}
