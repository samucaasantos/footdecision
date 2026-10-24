package com.project.footdecision.repositories;

import com.project.footdecision.models.Player;
import com.project.footdecision.models.enums.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    @Query("""
            SELECT p FROM Player p
            LEFT JOIN FETCH p.metrics
            WHERE p.position = :position
              AND p.marketValue <= :maxBudget
              AND p.salary <= :maxSalary
            """)
    List<Player> findEligiblePlayers(@Param("position") Position position, @Param("maxBudget") BigDecimal maxBudget, @Param("maxSalary") BigDecimal maxSalary);

    @Query("SELECT p FROM Player p LEFT JOIN FETCH p.metrics WHERE p.id = :id")
    Optional<Player> findByIdWithMetrics(@Param("id") Long id);

    Long countByPosition(Position position);

    @Query("SELECT COALESCE(SUM(p.salary), 0) FROM Player p")
    BigDecimal sumMonthlySalaries();
}
