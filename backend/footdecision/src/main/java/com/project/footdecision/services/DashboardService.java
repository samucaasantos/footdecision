package com.project.footdecision.services;

import com.project.footdecision.dtos.ClubConfigUpdateDTO;
import com.project.footdecision.dtos.DashboardOverviewDTO;
import com.project.footdecision.dtos.SquadPlayerRequestDTO;
import com.project.footdecision.dtos.SquadPlayerResponseDTO;
import com.project.footdecision.models.Player;
import com.project.footdecision.models.enums.Position;
import com.project.footdecision.repositories.PlayerRepository;
import com.project.footdecision.services.exceptions.DatabaseException;
import com.project.footdecision.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final PlayerRepository playerRepository;
    private BigDecimal transferBudgetCap = BigDecimal.ZERO;
    private Position priorityTacticalNeed = Position.MF;

    @Transactional(readOnly = true)
    public DashboardOverviewDTO getOverview() {
        BigDecimal totalPayroll = playerRepository.sumMonthlySalariesBySquad();
        Integer totalSquadCount = Math.toIntExact(playerRepository.countByIsSquadMemberTrue());

        Map<Position, Integer> distributionByPosition = getDistributionByPosition();

        return new DashboardOverviewDTO(totalPayroll, transferBudgetCap, totalSquadCount, priorityTacticalNeed, distributionByPosition);

    }

    private Map<Position, Integer> getDistributionByPosition() {
        Map<Position, Integer> distribution = new EnumMap<>(Position.class);

        for (Position position : Position.values()) {
            Integer quantity = Math.toIntExact(playerRepository.countByPositionAndIsSquadMemberTrue(position));
            distribution.put(position, quantity);
        }
        return distribution;
    }

    public DashboardOverviewDTO updateClubConfig(ClubConfigUpdateDTO request) {
        this.transferBudgetCap = request.transferBudgetCap();
        this.priorityTacticalNeed = request.priorityTacticalNeed();

        return getOverview();
    }

    @Transactional
    public SquadPlayerResponseDTO addSquadPlayer(SquadPlayerRequestDTO request) {
        Player player = new Player(
                request.name(),
                request.position(),
                request.age(),
                request.salary(),
                request.injuryRisk()
        );

         player = playerRepository.save(player);

        return SquadPlayerResponseDTO.fromEntity(player);
    }

    @Transactional(readOnly = true)
    public List<SquadPlayerResponseDTO> getSquadPlayers() {
        List<Player> squadPlayers = playerRepository.findByIsSquadMemberTrue();
        List<SquadPlayerResponseDTO> squad = new ArrayList<>();

        for (Player player : squadPlayers) {
            SquadPlayerResponseDTO squadPlayer = SquadPlayerResponseDTO.fromEntity(player);
            squad.add(squadPlayer);
        }

        return squad;
    }

    @Transactional
    public void removeSquadPlayer(Long id)  {
        Player player = playerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(id));
        if (!player.getIsSquadMember()) {
            throw new ResourceNotFoundException(id);
        }

        try {
            playerRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException(e.getMessage());
        }
    }
}
