package com.project.footdecision.services.components;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class EconomicOpportunityCalculator {

    public Double calculate(BigDecimal fairMarketValue, BigDecimal marketValue) {
        if (fairMarketValue == null || marketValue == null || fairMarketValue.compareTo(BigDecimal.ZERO) < 0 || marketValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valores de mercado inválidos para cálculo de oportunidade econômica");
        }

        double ratio = fairMarketValue.divide(marketValue, 4, RoundingMode.HALF_UP).doubleValue();
        return ratio / (1.0 + ratio);
    }
}
