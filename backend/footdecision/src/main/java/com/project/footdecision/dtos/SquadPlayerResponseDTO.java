package com.project.footdecision.dtos;

import com.project.footdecision.models.Player;
import com.project.footdecision.models.enums.InjuryRisk;
import com.project.footdecision.models.enums.Position;

import java.math.BigDecimal;

public record SquadPlayerResponseDTO(
        Long id,
        String name,
        Position position,
        Integer age,
        BigDecimal salary,
        InjuryRisk injuryRisk
) {
    public static SquadPlayerResponseDTO fromEntity(Player player) {
        return new SquadPlayerResponseDTO(
                player.getId(),
                player.getName(),
                player.getPosition(),
                player.getAge(),
                player.getSalary(),
                player.getInjuryRisk()
        );
    }
}
