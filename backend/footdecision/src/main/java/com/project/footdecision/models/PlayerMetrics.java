package com.project.footdecision.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;

import java.io.Serializable;


@Getter
@Entity
@Table(name = "player_metrics")
public class PlayerMetrics implements Serializable {
    @Id
    private Long playerId;

    private Integer minutesPlayed;
    private Integer clusterId;
    private Double progressivePassesP90;
    private Double tacklesP90;
    private Double scaP90;
    private Double progressiveCarriesP90;
    private Double expectedGoalsP90;
    private Double expectedAssistsP90;
    private Double goalsConcededP90;
    private Double savePercentage;
    private Double cleanSheetPercentage;
    private Double shotsOnTargetAgainstP90;
    private Double penaltiesSavedP90;

    @JsonIgnore
    @OneToOne
    @MapsId
    private Player player;

    public PlayerMetrics() {
    }

    public PlayerMetrics(Long playerId, Integer minutesPlayed, Integer clusterId, Double progressivePassesP90, Double tacklesP90, Double scaP90, Double progressiveCarriesP90, Double expectedGoalsP90, Double expectedAssistsP90, Double goalsConcededP90, Double savePercentage, Double cleanSheetPercentage, Double shotsOnTargetAgainstP90, Double penaltiesSavedP90) {
        this.playerId = playerId;
        this.minutesPlayed = minutesPlayed;
        this.clusterId = clusterId;
        this.progressivePassesP90 = progressivePassesP90;
        this.tacklesP90 = tacklesP90;
        this.scaP90 = scaP90;
        this.progressiveCarriesP90 = progressiveCarriesP90;
        this.expectedGoalsP90 = expectedGoalsP90;
        this.expectedAssistsP90 = expectedAssistsP90;
        this.goalsConcededP90 = goalsConcededP90;
        this.savePercentage = savePercentage;
        this.cleanSheetPercentage = cleanSheetPercentage;
        this.shotsOnTargetAgainstP90 = shotsOnTargetAgainstP90;
        this.penaltiesSavedP90 = penaltiesSavedP90;
    }


}
