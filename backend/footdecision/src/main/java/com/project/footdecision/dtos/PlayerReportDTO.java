package com.project.footdecision.dtos;

import com.project.footdecision.models.Player;
import com.project.footdecision.models.enums.InjuryRisk;
import com.project.footdecision.models.enums.Position;

import java.math.BigDecimal;
import java.util.List;

public record PlayerReportDTO(
        Long id,
        String name,
        Position position,
        Integer age,
        String currentClub,
        BigDecimal marketValue,
        BigDecimal salary,
        InjuryRisk injuryRisk,
        List<RadarAxisDTO> radarMetrics
) {
    public static PlayerReportDTO fromEntity(Player player, List<RadarAxisDTO> radarMetrics) {
        return new PlayerReportDTO(
                player.getId(),
                player.getName(),
                player.getPosition(),
                player.getAge(),
                player.getCurrentClub(),
                player.getMarketValue(),
                player.getSalary(),
                player.getInjuryRisk(),
                radarMetrics
        );
    }
}
