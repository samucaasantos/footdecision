package com.project.footdecision.dtos;

import com.project.footdecision.models.Player;
import com.project.footdecision.models.enums.InjuryRisk;

import java.math.BigDecimal;

public record PlayerRecommendationDTO(
        Long playerId,
        String name,
        String currentClub,
        BigDecimal marketValue,
        BigDecimal salary,
        InjuryRisk injuryRisk,
        Double finalScore,
        Double tacticalSimilarity,
        Double economicOpportunity,
        DeterministicReportDTO technicalReport
) {
    public static PlayerRecommendationDTO fromEntity(Player player, Double finalScore, Double tacticalSimilarity, Double economicOpportunity, DeterministicReportDTO technicalReport) {
        return new PlayerRecommendationDTO(
                player.getId(),
                player.getName(),
                player.getCurrentClub(),
                player.getMarketValue(),
                player.getSalary(),
                player.getInjuryRisk(),
                finalScore,
                tacticalSimilarity,
                economicOpportunity,
                technicalReport
                );
    }
}
