package com.replaylab.backend.repository;

import com.replaylab.backend.entity.SecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface SecurityEventRepository extends JpaRepository<SecurityEvent, Long> {
    List<SecurityEvent> findAllByOrderByOccurredAtDesc();
    List<SecurityEvent> findByUserIdOrderByOccurredAtDesc(Long userId);
    List<SecurityEvent> findByOccurredAtAfterOrderByOccurredAtDesc(Instant since);
    long countBySeverity(String severity);
}
