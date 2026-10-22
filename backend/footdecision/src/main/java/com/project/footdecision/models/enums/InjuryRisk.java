package com.project.footdecision.models.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.EnumeratedValue;
import lombok.Getter;

import java.util.Objects;

public enum InjuryRisk {
    BAIXO(1.0, "Baixo"),
    MODERADO(2.0, "Moderado"),
    ALTO(3.0, "Alto");

    @Getter
    private final Double numericRisk;

    @EnumeratedValue
    private final String description;

    InjuryRisk(Double numericRisk, String description) {
        this.numericRisk = numericRisk;
        this.description = description;
    }

    @JsonValue
    public String getDescription() {
        return description;
    }

}
