package com.project.footdecision.services.components;

import com.project.footdecision.models.PlayerMetrics;
import com.project.footdecision.models.enums.Position;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TacticalSimilarityCalculatorTest {

    @Mock
    private ClusterCentroidRegistry centroidRegistry;

    @InjectMocks
    private TacticalSimilarityCalculator calculator;

    @Test
    @DisplayName("Deve retornar similaridade máxima (1.0) quando métricas do atleta forem idênticas ao centroide")
    void shouldReturnMaxSimilarityWhenMetricsMatchCentroid() {
        PlayerMetrics metrics = new PlayerMetrics(
                1L, 700, 1,
                20.0, 2.0, 0.5, 6.0, 0.3, 0.4,
                null, null, null, null, null
        );
        when(centroidRegistry.getCentroid(Position.MF, 1))
                .thenReturn(new double[]{20.0, 2.0, 0.5, 6.0, 0.3, 0.4});

        Double similarity = calculator.calculate(metrics, Position.MF, 1);

        assertEquals(1.0, similarity, 0.0001);
    }

    @Test
    @DisplayName("Deve calcular similaridade normalizada para goleiros no intervalo (0, 1]")
    void shouldCalculateNormalizedGoalkeeperSimilarity() {
        PlayerMetrics gkMetrics = new PlayerMetrics(
                2L, 800, 5,
                null, null, null, null, null, null,
                0.80, 78.0, 48.0, 3.8, 0.0
        );
        when(centroidRegistry.getCentroid(Position.GK, 5))
                .thenReturn(new double[]{0.82, 77.58, 47.35, 3.80, 0.0});

        Double similarity = calculator.calculate(gkMetrics, Position.GK, 5);

        assertTrue(similarity > 0.90 && similarity <= 1.0);
    }
}
