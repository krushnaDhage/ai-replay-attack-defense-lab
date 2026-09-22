package com.replaylab.backend.repository;

import com.replaylab.backend.entity.AttackSimulation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttackSimulationRepository extends JpaRepository<AttackSimulation, Long> {
    List<AttackSimulation> findByUserIdOrderByCapturedAtDesc(Long userId);
    Optional<AttackSimulation> findFirstByUserIdOrderByCapturedAtDesc(Long userId);
}
