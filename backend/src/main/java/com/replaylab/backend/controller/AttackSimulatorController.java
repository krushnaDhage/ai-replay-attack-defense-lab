package com.replaylab.backend.controller;

import com.replaylab.backend.dto.TransactionRequest;
import com.replaylab.backend.dto.TransactionResponse;
import com.replaylab.backend.entity.AttackSimulation;
import com.replaylab.backend.entity.User;
import com.replaylab.backend.repository.AttackSimulationRepository;
import com.replaylab.backend.repository.UserRepository;
import com.replaylab.backend.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attack-simulator")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Attack Simulator", description = "Controlled lab-only replay attack simulation")
@SecurityRequirement(name = "bearerAuth")
public class AttackSimulatorController {

    private final AttackSimulationRepository simulationRepository;
    private final TransactionService transactionService;
    private final UserRepository userRepository;

    /**
     * Captures a legitimate transaction request for later replay simulation.
     * This operates ONLY against the local demo API.
     */
    @PostMapping("/capture")
    @Operation(summary = "Capture a legitimate request for replay simulation (lab only)")
    public ResponseEntity<Map<String, Object>> captureRequest(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String sourceIp = getClientIp(httpRequest);

        AttackSimulation simulation = AttackSimulation.builder()
                .originalTransactionId(request.getTransactionId())
                .senderAccount(request.getSenderAccount())
                .receiverAccount(request.getReceiverAccount())
                .amount(request.getAmount())
                .nonce(request.getNonce())
                .originalTimestamp(request.getTimestamp() != null ? request.getTimestamp() : Instant.now())
                .userId(user.getId())
                .capturedFromIp(sourceIp)
                .capturedRequestJson(requestToJson(request))
                .replayed(false)
                .build();

        simulation = simulationRepository.save(simulation);
        log.info("Request captured for simulation: {} by user: {}", request.getTransactionId(), userDetails.getUsername());

        return ResponseEntity.ok(Map.of(
            "message", "Request captured successfully for replay simulation",
            "simulationId", simulation.getId(),
            "capturedTransactionId", simulation.getOriginalTransactionId(),
            "capturedAt", simulation.getCapturedAt().toString()
        ));
    }

    /**
     * Replays the most recently captured request.
     * ONLY targets the local demo transaction API — not any external system.
     */
    @PostMapping("/replay")
    @Operation(summary = "Replay the captured request against the local demo API (lab only)")
    public ResponseEntity<TransactionResponse> replayRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {

        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        AttackSimulation simulation = simulationRepository
                .findFirstByUserIdOrderByCapturedAtDesc(user.getId())
                .orElseThrow(() -> new IllegalStateException("No captured request found. Please capture a request first."));

        // Build the identical replay request
        TransactionRequest replayRequest = new TransactionRequest();
        replayRequest.setTransactionId(simulation.getOriginalTransactionId());
        replayRequest.setSenderAccount(simulation.getSenderAccount());
        replayRequest.setReceiverAccount(simulation.getReceiverAccount());
        replayRequest.setAmount(simulation.getAmount());
        replayRequest.setNonce(simulation.getNonce());
        replayRequest.setTimestamp(simulation.getOriginalTimestamp()); // Use old timestamp → will fail freshness check

        String sourceIp = getClientIp(httpRequest);
        String sessionId = httpRequest.getSession(true).getId();

        log.warn("ATTACK SIMULATION: Replaying request {} for user {}",
            simulation.getOriginalTransactionId(), userDetails.getUsername());

        // Process through the FULL security pipeline — this is a real detection call
        TransactionResponse response = transactionService.processTransaction(
            replayRequest, userDetails.getUsername(), sourceIp, sessionId);

        // Update simulation record
        simulation.setReplayed(true);
        simulation.setReplayedAt(Instant.now());
        simulation.setReplayResult(response.getStatus());
        simulationRepository.save(simulation);

        return ResponseEntity.status(response.getStatus().equals("BLOCKED") ? 409 : 200).body(response);
    }

    @GetMapping("/simulations")
    @Operation(summary = "Get all attack simulations for current user")
    public ResponseEntity<List<AttackSimulation>> getSimulations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(simulationRepository.findByUserIdOrderByCapturedAtDesc(user.getId()));
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) return forwarded.split(",")[0].trim();
        return request.getRemoteAddr();
    }

    private String requestToJson(TransactionRequest req) {
        return String.format(
            "{\"transactionId\":\"%s\",\"senderAccount\":\"%s\",\"receiverAccount\":\"%s\",\"amount\":%s,\"nonce\":\"%s\"}",
            req.getTransactionId(), req.getSenderAccount(), req.getReceiverAccount(),
            req.getAmount().toPlainString(), req.getNonce()
        );
    }
}
