package com.project.footdecision.controllers;

import com.project.footdecision.dtos.PlayerReportDTO;
import com.project.footdecision.services.PlayerReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {
    private final PlayerReportService playerReportService;

    @GetMapping("/{id}/report")
    public ResponseEntity<PlayerReportDTO> getReport(@PathVariable Long id) {
        PlayerReportDTO playerReport = playerReportService.getPlayerReport(id);
        return ResponseEntity.ok().body(playerReport);
    }
}
