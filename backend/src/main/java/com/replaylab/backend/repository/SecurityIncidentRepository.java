package com.replaylab.backend.repository;

import com.replaylab.backend.entity.SecurityIncident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SecurityIncidentRepository extends JpaRepository<SecurityIncident, Long> {
    Optional<SecurityIncident> findByIncidentId(String incidentId);
    List<SecurityIncident> findAllByOrderByDetectedAtDesc();
    List<SecurityIncident> findByStatusOrderByDetectedAtDesc(String status);
    long countByStatus(String status);

    @Query("SELECT COUNT(i) FROM SecurityIncident i WHERE i.attackType = 'REPLAY_ATTACK'")
    long countReplayAttacks();
}
