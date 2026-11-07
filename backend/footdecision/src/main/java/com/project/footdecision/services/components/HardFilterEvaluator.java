package com.project.footdecision.services.components;

import com.project.footdecision.dtos.SimulationRequestDTO;
import com.project.footdecision.models.Player;
import com.project.footdecision.repositories.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class HardFilterEvaluator {

    @Autowired
    private PlayerRepository playerRepository;

    public List<Player> filter(SimulationRequestDTO request) {
        return playerRepository.findEligiblePlayers(request.targetPosition(), request.maxTransferBudget(), request.maxMonthlySalary())
                .stream()
                .filter(x -> x.getInjuryRisk().getNumericRisk() <= request.maxTolerableRisk())
                .toList();
    }
}
