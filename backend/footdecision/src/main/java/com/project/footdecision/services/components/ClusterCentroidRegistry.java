package com.project.footdecision.services.components;

import com.project.footdecision.models.PlayerMetrics;
import com.project.footdecision.models.enums.Position;
import com.project.footdecision.repositories.PlayerMetricsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ClusterCentroidRegistry {

    @Autowired
    private PlayerMetricsRepository playerMetricsRepository;

    private final Map<String, double[]> centroids = new HashMap<>();

    public double[] getCentroid(Position position, Integer clusterId) {
        if (centroids.isEmpty()) {
            loadCentroids();
        }

        double[] centroid = null;
        String key;
        if (position == Position.GK) {
            key = "GOALKEEPER_" + clusterId;
        } else {
            key = "OUTFIELD_" + clusterId;
        }

        centroid = centroids.get(key);
        if (centroid == null) {
            throw new IllegalArgumentException("Cluster inválido para a posição " + position.getDescription());
        }
        return centroid;
    }

    public Map<String, Double> getBenchmarkMetrics(Position position, Integer clusterId) {
        double[] centroid = getCentroid(position, clusterId);
        Map<String, Double> benchmarks = new LinkedHashMap<>();
        if (position == Position.GK) {
            benchmarks.put("goalsConcededP90", centroid[0]);
            benchmarks.put("savePercentage", centroid[1]);
            benchmarks.put("cleanSheetPercentage", centroid[2]);
            benchmarks.put("shotsOnTargetAgainstP90", centroid[3]);
            benchmarks.put("penaltiesSavedP90", centroid[4]);
        } else {
            benchmarks.put("progressivePassesP90", centroid[0]);
            benchmarks.put("tacklesP90", centroid[1]);
            benchmarks.put("scaP90", centroid[2]);
            benchmarks.put("progressiveCarriesP90", centroid[3]);
            benchmarks.put("expectedGoalsP90", centroid[4]);
            benchmarks.put("expectedAssistsP90", centroid[5]);
        }
        return benchmarks;
    }

    private void loadCentroids() {
        centroids.put("OUTFIELD_1", calculateCentroid(1, false));
        centroids.put("OUTFIELD_2", calculateCentroid(2, false));
        centroids.put("OUTFIELD_3", calculateCentroid(3, false));
        centroids.put("GOALKEEPER_4", calculateCentroid(4, true));
        centroids.put("GOALKEEPER_5", calculateCentroid(5, true));
        centroids.put("GOALKEEPER_6", calculateCentroid(6, true));
    }

    private double[] calculateCentroid(int clusterId, boolean isGoalkeeper) {
        List<PlayerMetrics> metricsList = playerMetricsRepository.findByClusterId(clusterId);
        double[] centroid;
        int size;
        if (isGoalkeeper) {
            size = 5;
        } else {
            size = 6;
        }
        centroid = new double[size];

        if (metricsList.isEmpty()) {
            return centroid;
        }

        for (PlayerMetrics metrics : metricsList) {
            double[] playerVector;
            if (isGoalkeeper) {
                playerVector = metrics.getGoalKeeperFeatureVector();
            } else {
                playerVector = metrics.getOutfieldFeatureVector();
            }
            for (int i = 0; i < size; i++) {
                centroid[i] += playerVector[i] ;
            }
        }

        for (int i = 0; i < size; i++) {
            centroid[i] = centroid[i] / metricsList.size();
        }

        return centroid;
    }

}
