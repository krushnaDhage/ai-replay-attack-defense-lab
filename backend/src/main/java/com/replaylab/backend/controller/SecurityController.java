package com.replaylab.backend.controller;

import com.replaylab.backend.entity.SecurityEvent;
import com.replaylab.backend.entity.SecurityIncident;
import com.replaylab.backend.incident.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/security")
@RequiredArgsConstructor
@Tag(name = "Security", description = "Security events, incidents, dashboard and metrics")
@SecurityRequirement(name = "bearerAuth")
public class SecurityController {

    private final IncidentService incidentService;

    @GetMapping("/events")
    @Operation(summary = "Get all security events (timeline)")
    public ResponseEntity<List<SecurityEvent>> getEvents() {
        return ResponseEntity.ok(incidentService.getAllEvents());
    }

    @GetMapping("/events/recent")
    @Operation(summary = "Get recent security events (last N minutes)")
    public ResponseEntity<List<SecurityEvent>> getRecentEvents(
            @RequestParam(defaultValue = "60") int minutes) {
        return ResponseEntity.ok(incidentService.getRecentEvents(minutes));
    }

    @GetMapping("/incidents")
    @Operation(summary = "Get all security incidents")
    public ResponseEntity<List<SecurityIncident>> getIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get live dashboard metrics")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(incidentService.getDashboardMetrics());
    }

    @GetMapping("/metrics")
    @Operation(summary = "Get detailed system metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        Map<String, Object> metrics = incidentService.getDashboardMetrics();
        // Accuracy placeholder — real values computed from test runs via /api/ml/metrics
        metrics.put("note", "ML evaluation metrics available at /api/ml/metrics after running tests");
        return ResponseEntity.ok(metrics);
    }
}
