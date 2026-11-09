package com.project.footdecision.dtos;

import com.project.footdecision.models.enums.Position;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record ClubConfigUpdateDTO(

        @NotNull
        @PositiveOrZero
        BigDecimal transferBudgetCap,

        @NotNull
        Position priorityTacticalNeed
) {
}
