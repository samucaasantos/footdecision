package com.project.footdecision.controllers;

import com.project.footdecision.dtos.SimulationRequestDTO;
import com.project.footdecision.dtos.SimulationResponseDTO;
import com.project.footdecision.services.DecisionEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/simulations")
@RequiredArgsConstructor
public class SimulationController {
    private final DecisionEngineService decisionEngineService;

    @PostMapping("/run")
    public ResponseEntity<SimulationResponseDTO> runSimulation(@Valid @RequestBody SimulationRequestDTO request) {
        SimulationResponseDTO simulation = decisionEngineService.runSimulation(request);
        return ResponseEntity.ok().body(simulation);
    }
}
