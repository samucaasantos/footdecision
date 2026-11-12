package com.project.footdecision.services;

import com.project.footdecision.dtos.DeterministicReportDTO;
import com.project.footdecision.models.Player;
import com.project.footdecision.models.enums.InjuryRisk;
import com.project.footdecision.models.enums.Position;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class DeterministicReportServiceTest {

    private final DeterministicReportService reportService = new DeterministicReportService();

    @Test
    @DisplayName("Deve gerar parecer determinístico completo com aderência alta, excelente oportunidade e baixo risco")
    void shouldGenerateCompleteReportForTopCandidate() {
        Player player = new Player(
                13L,
                "Antonio Blanco",
                Position.MF,
                26,
                "Alavés",
                new BigDecimal("10000000.00"),
                new BigDecimal("25000000.00"),
                new BigDecimal("40000.00"),
                InjuryRisk.BAIXO
        );

        DeterministicReportDTO report = reportService.generateReport(
                player,
                0.82,
                0.80,
                0.71,
                new BigDecimal("200000.00")
        );

        assertTrue(report.tacticalDiagnosis().contains("alta"));
        assertEquals("Excelente oportunidade de mercado", report.economicCostBenefit());
        assertTrue(report.payrollImpact().contains("Baixo impacto na folha salarial"));
        assertTrue(report.medicalReliability().contains("Alta disponibilidade física"));
    }
}
