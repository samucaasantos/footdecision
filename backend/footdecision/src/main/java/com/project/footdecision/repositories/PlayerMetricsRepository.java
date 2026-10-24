package com.project.footdecision.repositories;

import com.project.footdecision.models.PlayerMetrics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PlayerMetricsRepository extends JpaRepository<PlayerMetrics, Long> {

    Optional<PlayerMetrics> findByPlayerId(Long playerId);
}
