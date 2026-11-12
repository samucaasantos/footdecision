package com.project.footdecision.services.components;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class EconomicOpportunityCalculatorTest {

    private final EconomicOpportunityCalculator calculator = new EconomicOpportunityCalculator();

    @Test
    @DisplayName("Deve retornar 0.5 quando o valor justo for igual ao valor de mercado (preço justo)")
    void shouldReturnHalfWhenFairValueEqualsMarketValue() {
        BigDecimal fairValue = new BigDecimal("10000000.00");
        BigDecimal marketValue = new BigDecimal("10000000.00");

        Double result = calculator.calculate(fairValue, marketValue);

        assertEquals(0.5, result, 0.0001);
    }

    @Test
    @DisplayName("Deve retornar índice maior que 0.5 quando atleta estiver subvalorizado (oportunidade de mercado)")
    void shouldReturnGreaterThanHalfWhenPlayerIsUndervalued() {
        BigDecimal fairValue = new BigDecimal("30000000.00");
        BigDecimal marketValue = new BigDecimal("10000000.00");

        Double result = calculator.calculate(fairValue, marketValue);

        // ratio = 3.0 -> 3.0 / (1.0 + 3.0) = 0.75
        assertEquals(0.75, result, 0.0001);
    }

    @Test
    @DisplayName("Deve lançar IllegalArgumentException quando valores forem nulos ou valor de mercado for zero/negativo")
    void shouldThrowExceptionWhenValuesAreInvalid() {
        BigDecimal validValue = new BigDecimal("10000000.00");

        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(null, validValue));
        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(validValue, null));
        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(validValue, BigDecimal.ZERO));
        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(validValue, new BigDecimal("-100.00")));
        assertThrows(IllegalArgumentException.class, () -> calculator.calculate(new BigDecimal("-100.00"), validValue));
    }
}
