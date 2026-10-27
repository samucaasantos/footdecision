package com.project.footdecision.dtos;

public record RadarAxisDTO(
        String metricName,
        Double playerValue,
        Double clusterAverageValue
) {
}
