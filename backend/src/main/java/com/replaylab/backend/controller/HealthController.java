package com.replaylab.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "System health check")
public class HealthController {

    @Value("${app.ml-service.url}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate;

    public HealthController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping
    @Operation(summary = "Check health of all system components")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("api", "UP");
        status.put("timestamp", Instant.now().toString());
        status.put("version", "1.0.0");

        // Check ML service
        try {
            ResponseEntity<Map> mlHealth = restTemplate.getForEntity(mlServiceUrl + "/health", Map.class);
            status.put("mlService", mlHealth.getStatusCode().is2xxSuccessful() ? "UP" : "DEGRADED");
            if (mlHealth.getBody() != null) {
                status.put("mlModel", mlHealth.getBody().getOrDefault("modelLoaded", false));
            }
        } catch (Exception e) {
            status.put("mlService", "DOWN");
            status.put("mlModel", false);
        }

        return ResponseEntity.ok(status);
    }
}
