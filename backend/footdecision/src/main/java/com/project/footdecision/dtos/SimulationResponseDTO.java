package com.project.footdecision.dtos;

import java.util.List;

public record SimulationResponseDTO(
        List<PlayerRecommendationDTO> recommendations,
        Integer totalEvaluated,
        Integer totalApprovedFilters
) {
}
