package com.project.footdecision.services.components;

import com.project.footdecision.models.PlayerMetrics;
import com.project.footdecision.models.enums.Position;
import com.project.footdecision.repositories.PlayerMetricsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class ClusterCentroidRegistry {
    private final PlayerMetricsRepository playerMetricsRepository;

    private final Map<String, double[]> centroids = new ConcurrentHashMap<>();

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
            for (int i = 0; i < PlayerMetrics.GOALKEEPER_METRIC_NAMES.size(); i++) {
                benchmarks.put(PlayerMetrics.GOALKEEPER_METRIC_NAMES.get(i), centroid[i]);
            }
        } else {
            for (int i = 0; i < PlayerMetrics.OUTFIELD_METRIC_NAMES.size(); i++) {
                benchmarks.put(PlayerMetrics.OUTFIELD_METRIC_NAMES.get(i), centroid[i]);
            }
        }
        return benchmarks;
    }

    private synchronized void loadCentroids() {
        if (centroids.isEmpty()) {
            centroids.put("OUTFIELD_1", calculateCentroid(1, false));
            centroids.put("OUTFIELD_2", calculateCentroid(2, false));
            centroids.put("OUTFIELD_3", calculateCentroid(3, false));
            centroids.put("GOALKEEPER_4", calculateCentroid(4, true));
            centroids.put("GOALKEEPER_5", calculateCentroid(5, true));
            centroids.put("GOALKEEPER_6", calculateCentroid(6, true));
        }
    }

    private double[] calculateCentroid(int clusterId, boolean isGoalkeeper) {
        List<PlayerMetrics> metricsList = playerMetricsRepository.findByClusterId(clusterId);
        double[] centroid;
        int size;
        if (isGoalkeeper) {
            size = PlayerMetrics.GOALKEEPER_METRIC_NAMES.size();
        } else {
            size = PlayerMetrics.OUTFIELD_METRIC_NAMES.size();
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
