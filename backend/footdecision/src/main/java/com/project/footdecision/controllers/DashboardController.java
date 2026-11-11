package com.project.footdecision.controllers;

import com.project.footdecision.dtos.ClubConfigUpdateDTO;
import com.project.footdecision.dtos.DashboardOverviewDTO;
import com.project.footdecision.dtos.SquadPlayerRequestDTO;
import com.project.footdecision.dtos.SquadPlayerResponseDTO;
import com.project.footdecision.services.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping(value = "/overview")
    public ResponseEntity<DashboardOverviewDTO> getOverview() {
        DashboardOverviewDTO overview = dashboardService.getOverview();
        return ResponseEntity.ok().body(overview);
    }

    @PutMapping(value = "/config")
    public ResponseEntity<DashboardOverviewDTO> updateClubConfig(@Valid @RequestBody ClubConfigUpdateDTO request) {
        DashboardOverviewDTO clubConfig = dashboardService.updateClubConfig(request);
        return ResponseEntity.ok().body(clubConfig);
    }

    @PostMapping(value = "/squad")
    public ResponseEntity<SquadPlayerResponseDTO> addSquadPlayer(@Valid @RequestBody SquadPlayerRequestDTO request) {
        SquadPlayerResponseDTO player = dashboardService.addSquadPlayer(request);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(player.id()).toUri();
        return ResponseEntity.created(uri).body(player);
    }

    @GetMapping(value = "/squad")
    public ResponseEntity<List<SquadPlayerResponseDTO>> getSquadPlayers() {
        List<SquadPlayerResponseDTO> squadPlayers = dashboardService.getSquadPlayers();
        return ResponseEntity.ok().body(squadPlayers);
    }

    @DeleteMapping(value = "/squad/{id}")
    public ResponseEntity<Void> removeSquadPlayer(@PathVariable Long id) {
        dashboardService.removeSquadPlayer(id);
        return ResponseEntity.noContent().build();
    }
}
