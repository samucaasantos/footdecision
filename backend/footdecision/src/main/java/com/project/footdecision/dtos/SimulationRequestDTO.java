package com.project.footdecision.dtos;

import com.project.footdecision.models.enums.Position;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record SimulationRequestDTO(
        @NotNull
        Position targetPosition,

        @NotNull
        @Min(value = 1, message = "O valor deve ser no mínimo 1")
        @Max(value = 6, message = "O valor deve ser no máximo 6")
        Integer targetClusterId,


        @NotNull
        @Positive
        BigDecimal maxTransferBudget,

        @NotNull
        @Positive
        BigDecimal maxMonthlySalary,

        @NotNull
        @DecimalMin(value = "1.0" , message = "O risco não pode ser menor que 1.0")
        @DecimalMax(value = "3.0", message = "O risco não pode ser maior que 3.0")
        Double maxTolerableRisk,

        @NotNull
        @PositiveOrZero(message = "peso pode ser zerado, mas nunca ser negativo")
        Double weightTactical,

        @NotNull
        @PositiveOrZero(message = "peso pode ser zerado, mas nunca ser negativo")
        Double weightEconomic,

        @NotNull
        @PositiveOrZero(message = "peso pode ser zerado, mas nunca ser negativo")
        Double weightRisk
) {
}
