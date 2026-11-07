package com.project.footdecision.services;

import com.project.footdecision.dtos.PlayerReportDTO;
import com.project.footdecision.dtos.RadarAxisDTO;
import com.project.footdecision.models.Player;
import com.project.footdecision.models.PlayerMetrics;
import com.project.footdecision.repositories.PlayerRepository;
import com.project.footdecision.services.components.ClusterCentroidRegistry;
import com.project.footdecision.services.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PlayerReportService {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private ClusterCentroidRegistry centroidRegistry;

    public PlayerReportDTO getPlayerReport(Long id) {
        Optional<Player> player = playerRepository.findByIdWithMetrics(id);
        Player reportedPlayer = player.orElseThrow(() -> new ResourceNotFoundException(id));

        List<RadarAxisDTO> radarMetrics = new ArrayList<>();
        PlayerMetrics metrics = reportedPlayer.getMetrics();
        if (metrics == null) {
            throw new ResourceNotFoundException();
        }

        Map<String, Double> benchmarks = centroidRegistry.getBenchmarkMetrics(reportedPlayer.getPosition(), metrics.getClusterId());

        double[] playerVector;
        if (metrics.isGoalKeeper()) {
            playerVector = metrics.getGoalKeeperFeatureVector();
        } else {
            playerVector = metrics.getOutfieldFeatureVector();
        }

        int i = 0;
        for (Map.Entry<String, Double> entry : benchmarks.entrySet()) {
            String metricName = entry.getKey();
            Double playerValue = playerVector[i];
            Double clusterAverageValue = entry.getValue();
            radarMetrics.add(new RadarAxisDTO(metricName, playerValue, clusterAverageValue));
            i++;
        }
        return PlayerReportDTO.fromEntity(reportedPlayer, radarMetrics);
    }
}
