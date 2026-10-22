package com.project.footdecision.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.footdecision.models.enums.Position;
import jakarta.persistence.*;
import lombok.Getter;

import java.io.Serializable;
import java.util.Objects;


@Getter
@Entity
@Table(name = "player_metrics")
public class PlayerMetrics implements Serializable {

    @Id
    @Column(name = "player_id")
    private Long playerId;

    @Column(name = "minutes_played")
    private Integer minutesPlayed;

    @Column(name = "cluster_id")
    private Integer clusterId;

    @Column(name = "progressive_passes_p90")
    private Double progressivePassesP90;

    @Column(name = "tackles_p90")
    private Double tacklesP90;

    @Column(name = "sca_p90")
    private Double scaP90;

    @Column(name = "progressive_carries_p90")
    private Double progressiveCarriesP90;

    @Column(name = "expected_goals_p90")
    private Double expectedGoalsP90;

    @Column(name = "expected_assists_p90")
    private Double expectedAssistsP90;

    @Column(name = "goals_conceded_p90")
    private Double goalsConcededP90;

    @Column(name = "save_percentage")
    private Double savePercentage;

    @Column(name = "clean_sheet_percentage")
    private Double cleanSheetPercentage;

    @Column(name = "shots_on_target_against_p90")
    private Double shotsOnTargetAgainstP90;

    @Column(name = "penalties_saved_p90")
    private Double penaltiesSavedP90;

    @JsonIgnore
    @OneToOne
    @MapsId
    @JoinColumn(name = "player_id")
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

    public Boolean isGoalKeeper() {
        return player.getPosition() == Position.GK;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        PlayerMetrics that = (PlayerMetrics) o;
        return Objects.equals(getPlayerId(), that.getPlayerId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getPlayerId());
    }
}
