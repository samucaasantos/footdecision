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
        if (position == Position.GK) {
            playerVector = metrics.getGoalKeeperFeatureVector();
        } else {
            playerVector = metrics.getOutfieldFeatureVector();
        }

        double[] centroid = centroidRegistry.getCentroid(position, clusterId);
        double distance = euclideanDistance(playerVector, centroid);

        return 1.0 / (1.0 + distance);
    }

    private Double euclideanDistance(double[] v1, double[] v2) {
        if (v1.length != v2.length) {
            throw new IllegalArgumentException("Os tamanhos dos vetores são diferentes. Eles devem ser iguais!");
        }

        double sum = 0.0;
        for (int i = 0; i < v1.length; i++) {
            if (v2[i] > 0) {
                double diff = (v1[i] - v2[i]) / v2[i];
                sum += diff * diff;
            }
        }
        sum /= v1.length;
        return Math.sqrt(sum);
    }
}
