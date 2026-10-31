package com.project.footdecision.dtos;

import com.project.footdecision.models.enums.Position;

import java.math.BigDecimal;

public record ClubConfigUpdateDTO(
        BigDecimal transferBudgetCap,
        Position priorityTacticalNeed
) {
}
