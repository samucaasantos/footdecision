package com.project.footdecision.services;

import com.project.footdecision.dtos.DeterministicReportDTO;
import com.project.footdecision.models.Player;
import com.project.footdecision.models.enums.InjuryRisk;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class DeterministicReportService {

    public DeterministicReportDTO generateReport(Player player, Double score, Double tacticalSim, Double econOpp, BigDecimal maxSalary) {
        return new DeterministicReportDTO(
                tacticalDiagnosis(score, tacticalSim),
                economicCostBenefit(econOpp),
                payrollImpact(player, maxSalary),
                medicalReliability(player)
        );
    }

    private String tacticalDiagnosis(Double score, Double tacticalSim){
        Double percentage = 100 * tacticalSim;
        String diagnosis;
        if (tacticalSim >= 0.75) {
            diagnosis = "alta";
        } else if (tacticalSim >= 0.50) {
            diagnosis = "moderada";
        } else {
            diagnosis = "baixa";
        }
        return String.format("O atleta possui aderência tática %s ao perfil buscado para a posição, possuindo %.1f%% de similaridade e %.2f de score final.", diagnosis, percentage, score);
    }

    private String economicCostBenefit(Double econOpp) {
        String costBenefit;
        if (econOpp >= 0.70) {
            costBenefit = "Excelente oportunidade de mercado";
        } else if (econOpp >= 0.40) {
            costBenefit = "Custo-benefício equilibrado";
        } else {
            costBenefit = "Jogador sobrevalorizado";
        }
        return costBenefit;
    }

    private String payrollImpact(Player player, BigDecimal maxSalary) {
        String impact;
        double salaryRatio = player.getSalary()
                .divide(maxSalary, 4, RoundingMode.HALF_UP)
                .doubleValue() * 100.0;
        if (salaryRatio < 50.0) {
            impact = String.format("Baixo impacto na folha salarial (consome %.1f%% do teto definido).", salaryRatio);
        } else if (salaryRatio <= 80.0) {
            impact = String.format("Impacto moderado na folha salarial (consome %.1f%% do teto definido)", salaryRatio);
        } else {
            impact = String.format("Alto impacto na folha salarial (consome %.1f%% do teto definido)", salaryRatio);
        }
        return impact;
    }

    private String medicalReliability(Player player) {
        InjuryRisk risk = player.getInjuryRisk();
        return switch (risk) {
            case BAIXO -> "Alta disponibilidade física e baixo risco de afastamento.";
            case MODERADO -> "Recomendado monitoramento preventivo do departamento médico";
            case ALTO -> "Alerta! Histórico severo de lesões e risco elevado de indisponibilidade.";
        };
    }
}

