package com.project.footdecision.services.components;

import com.project.footdecision.models.PlayerMetrics;
import com.project.footdecision.models.enums.Position;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TacticalSimilarityCalculator {

    @Autowired
    private ClusterCentroidRegistry centroidRegistry;

    public Double calculate(PlayerMetrics metrics, Position position, Integer clusterId) {
        double[] playerVector;
        if (metrics.isGoalKeeper()) {
            playerVector = metrics.getGoalKeeperFeatureVector();
        } else {
            playerVector = metrics.getOutfieldFeatureVector();
        }

        double[] centroid = centroidRegistry.getCentroid(position, clusterId);
        double distance = euclideanDistance(playerVector, centroid);

        return 1.0 / (1.0 + distance);
    }

    private Double euclideanDistance(double[] v1, double[] v2) {
        double sum = 0.0;
        for (int i = 0; i < v1.length; i++) {
            double diff = v1[i] - v2[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
}
