package com.project.footdecision.models.enums;

import lombok.Getter;

public enum Position {
    GK("Goleiro"),
    DF("Defensor"),
    MF("Meio-campista"),
    FW("Atacante");

    @Getter
    private final String description;

    Position(String description) {
        this.description = description;
    }
}
