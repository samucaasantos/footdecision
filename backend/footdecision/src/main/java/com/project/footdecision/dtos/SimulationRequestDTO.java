package com.project.footdecision.dtos;

import com.project.footdecision.models.enums.Position;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record SimulationRequestDTO(
        Position targetPosition,
        Integer targetClusterId,

        @Positive
        BigDecimal maxTransferBudget,

        @Positive
        BigDecimal maxMonthlySalary,

        Double maxTolerableRisk,

        @NotNull
        Double weightTactical,

        @NotNull
        Double weightEconomic,

        @NotNull
        Double weightRisk
) {
}
