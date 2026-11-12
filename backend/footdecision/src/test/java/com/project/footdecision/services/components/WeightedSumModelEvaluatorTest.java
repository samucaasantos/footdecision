package com.project.footdecision.services.components;

import com.project.footdecision.models.enums.InjuryRisk;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class WeightedSumModelEvaluatorTest {

    private final WeightedSumModelEvaluator evaluator = new WeightedSumModelEvaluator();

    @Test
    @DisplayName("Deve calcular corretamente o score ponderado normalizando pesos automaticamente")
    void shouldCalculateWeightedScoreWithNormalizedWeights() {
        // tacticalSim = 0.80, econOpp = 0.60, risco BAIXO (1.0 -> normalizedRisk = 0.0 -> disponibilidade = 1.0)
        // Pesos: 50, 30, 20 -> normalizados: 0.50, 0.30, 0.20
        // Score esperado: (0.80 * 0.50) + (0.60 * 0.30) + (1.0 * 0.20) = 0.40 + 0.18 + 0.20 = 0.78
        Double score = evaluator.calculateScore(
                0.80,
                0.60,
                InjuryRisk.BAIXO.getNumericRisk(),
                50.0,
                30.0,
                20.0
        );

        assertEquals(0.78, score, 0.0001);
    }

    @Test
    @DisplayName("Deve zerar a contribuição do critério médico quando o risco for ALTO (3.0)")
    void shouldPenalizeHighInjuryRiskCorrectly() {
        // risco ALTO (3.0 -> normalizedRisk = 1.0 -> (1 - normalizedRisk) = 0.0)
        Double score = evaluator.calculateScore(
                0.80,
                0.50,
                InjuryRisk.ALTO.getNumericRisk(),
                0.0,
                0.0,
                1.0
        );

        assertEquals(0.0, score, 0.0001);
    }

    @Test
    @DisplayName("Deve lançar IllegalArgumentException quando a soma dos pesos for zero ou negativa")
    void shouldThrowExceptionWhenWeightsSumIsZero() {
        assertThrows(IllegalArgumentException.class, () ->
                evaluator.calculateScore(0.8, 0.6, 1.0, 0.0, 0.0, 0.0)
        );
    }
}
