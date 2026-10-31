package com.project.footdecision.services;

import com.project.footdecision.dtos.DashboardOverviewDTO;
import com.project.footdecision.models.enums.Position;
import com.project.footdecision.repositories.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    PlayerRepository playerRepository;

    public DashboardOverviewDTO getOverview() {
        BigDecimal totalPayroll = playerRepository.sumMonthlySalaries();
        BigDecimal transferBudgetCap; //verificar como implementar.
        Integer totalSquadCount = Math.toIntExact(playerRepository.count());

        Map<Position, Integer> distributionByPosition = getDistributionByPosition();

        return new DashboardOverviewDTO(totalPayroll, transferBudgetCap, totalSquadCount, distributionByPosition);

    }

    private Map<Position, Integer> getDistributionByPosition() {
        Map<Position, Integer> distribution = new EnumMap<>(Position.class);

        for (Position position : Position.values()) {
            Integer quantity = Math.toIntExact(playerRepository.countByPosition(position));
            distribution.put(position, quantity);
        }
        return distribution;
    }
}
