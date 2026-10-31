package com.project.footdecision.dtos;

import com.project.footdecision.models.enums.InjuryRisk;
import com.project.footdecision.models.enums.Position;

import java.math.BigDecimal;

public record SquadPlayerRequestDTO(
        String name,
        Position position,
        Integer age,
        BigDecimal salary,
        InjuryRisk injuryRisk
) {
}
