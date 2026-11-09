package com.project.footdecision.services.components;

import org.springframework.stereotype.Component;

@Component
public class WeightedSumModelEvaluator {

    public Double calculateScore(Double tacticalSim, Double econOpp, Double riskScore, Double w1, Double w2, Double w3) {
        double[] normalizedWeights = normalizeWeights(w1, w2, w3);
        double normalizedRisk = ((riskScore - 1) / 2.0);
        return tacticalSim * normalizedWeights[0] + econOpp * normalizedWeights[1] + (1.0 - normalizedRisk) * normalizedWeights[2];
    }

    private double[] normalizeWeights(Double w1, Double w2, Double w3) {
        double[] vector = {w1, w2, w3};

        double sum = w1 + w2 + w3;
        if (sum <= 0.0) {
            throw new IllegalArgumentException("A soma dos pesos deve ser maior que zero");
        }

        for (int i = 0; i < vector.length; i++) {
            vector[i] /= sum;
        }
        return vector;
    }
}
