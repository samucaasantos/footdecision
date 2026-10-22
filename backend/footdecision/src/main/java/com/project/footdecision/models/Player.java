package com.project.footdecision.models;

import com.project.footdecision.models.enums.InjuryRisk;
import com.project.footdecision.models.enums.Position;
import jakarta.persistence.*;
import lombok.Getter;

import java.io.Serializable;
import java.math.BigDecimal;


@Getter
@Entity
@Table(name = "players")
public class Player implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Position position;
    private Integer age;
    private String currentClub;
    private BigDecimal marketValue;
    private BigDecimal fairMarketValue;
    private BigDecimal salary;

    @Enumerated(EnumType.STRING)
    @Column(name = "injury_risk", length = 20, nullable = false)
    private InjuryRisk injuryRisk;

    private PlayerMetrics metrics;

    public Player() {
    }

    public Player(Long id, String name, Position position, Integer age, String currentClub, BigDecimal marketValue, BigDecimal fairMarketValue, BigDecimal salary, InjuryRisk injuryRisk) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.age = age;
        this.currentClub = currentClub;
        this.marketValue = marketValue;
        this.fairMarketValue = fairMarketValue;
        this.salary = salary;
        this.injuryRisk = injuryRisk;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;

        Player player = (Player) o;
        return getId().equals(player.getId());
    }

    @Override
    public int hashCode() {
        return getId().hashCode();
    }
}
