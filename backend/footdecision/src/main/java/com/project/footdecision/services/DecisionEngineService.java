package com.project.footdecision.services;

import com.project.footdecision.dtos.DeterministicReportDTO;
import com.project.footdecision.dtos.PlayerRecommendationDTO;
import com.project.footdecision.dtos.SimulationRequestDTO;
import com.project.footdecision.dtos.SimulationResponseDTO;
import com.project.footdecision.models.Player;
import com.project.footdecision.repositories.PlayerRepository;
import com.project.footdecision.services.components.EconomicOpportunityCalculator;
import com.project.footdecision.services.components.HardFilterEvaluator;
import com.project.footdecision.services.components.TacticalSimilarityCalculator;
import com.project.footdecision.services.components.WeightedSumModelEvaluator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DecisionEngineService {
    private final HardFilterEvaluator filterEvaluator;
    private final TacticalSimilarityCalculator tacticalCalculator;
    private final EconomicOpportunityCalculator economicCalculator;
    private final WeightedSumModelEvaluator wsmEvaluator;
    private final DeterministicReportService reportService;
    private final PlayerRepository playerRepository;

    @Transactional(readOnly = true)
    public SimulationResponseDTO runSimulation(SimulationRequestDTO request) {
        List<Player> approvedPlayers = filterEvaluator.filter(request);
        Integer totalApprovedFilters = approvedPlayers.size();

        List<PlayerRecommendationDTO> top5Recommendations = approvedPlayers.stream()
                .map(x -> evaluatePlayer(x, request))
                .sorted(Comparator.comparing(PlayerRecommendationDTO::finalScore).reversed())
                .limit(5)
                .toList();

        Integer totalEvaluated = Math.toIntExact(playerRepository.count()) - Math.toIntExact(playerRepository.countByIsSquadMemberTrue());

        return new SimulationResponseDTO(top5Recommendations, totalEvaluated, totalApprovedFilters);
    }

    private PlayerRecommendationDTO evaluatePlayer(Player player, SimulationRequestDTO request) {
        Double tacticalSimilarity = tacticalCalculator.calculate(player.getMetrics(), request.targetPosition(), request.targetClusterId());
        Double economicOpportunity = economicCalculator.calculate(player.getFairMarketValue(), player.getMarketValue());
        Double finalScore = wsmEvaluator.calculateScore(tacticalSimilarity, economicOpportunity, player.getInjuryRisk().getNumericRisk(),
                request.weightTactical(), request.weightEconomic(), request.weightRisk());
        DeterministicReportDTO technicalReport = reportService.generateReport(player, finalScore, tacticalSimilarity, economicOpportunity,
                request.maxMonthlySalary());

        return PlayerRecommendationDTO.fromEntity(player, finalScore, tacticalSimilarity, economicOpportunity, technicalReport);
    }
}
