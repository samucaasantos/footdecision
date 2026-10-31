package com.project.footdecision.dtos;

import com.project.footdecision.models.enums.Position;

import java.math.BigDecimal;
import java.util.Map;

public record DashboardOverviewDTO(
        BigDecimal totalPayroll,
        BigDecimal transferBudgetCap,
        Integer totalSquadCount,
        Position priorityTacticalNeed,
        Map<Position, Integer> distributionByPosition
) {
}
