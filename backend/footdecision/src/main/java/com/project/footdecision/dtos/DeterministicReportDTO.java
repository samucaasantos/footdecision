package com.project.footdecision.dtos;

public record DeterministicReportDTO(
        String tacticalDiagnosis,
        String economicCostBenefit,
        String payrollImpact,
        String medicalReliability
) {
}
