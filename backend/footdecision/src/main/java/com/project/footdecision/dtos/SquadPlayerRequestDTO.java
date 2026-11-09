package com.project.footdecision.dtos;

import com.project.footdecision.models.enums.InjuryRisk;
import com.project.footdecision.models.enums.Position;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record SquadPlayerRequestDTO(

        @NotBlank
        String name,

        @NotNull
        Position position,

        @NotNull
        @Positive
        @Min(value = 15)
        @Max(value = 59)
        Integer age,

        @NotNull
        @PositiveOrZero
        BigDecimal salary,

        @NotNull
        InjuryRisk injuryRisk
) {
}
