package com.replaylab.backend.controller;

import com.replaylab.backend.dto.TransactionRequest;
import com.replaylab.backend.dto.TransactionResponse;
import com.replaylab.backend.entity.Transaction;
import com.replaylab.backend.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Secure transaction API with replay protection")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    @Operation(summary = "Submit a secure transaction (replay-protected)")
    public ResponseEntity<TransactionResponse> transfer(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest httpRequest) {

        String sourceIp = getClientIp(httpRequest);
        String sessionId = httpRequest.getSession(true).getId();
        TransactionResponse response = transactionService.processTransaction(
            request, userDetails.getUsername(), sourceIp, sessionId);

        // Return 200 for allowed, 409 Conflict for blocked replays
        if ("BLOCKED".equals(response.getStatus())) {
            return ResponseEntity.status(409).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all transactions for current user")
    public ResponseEntity<List<Transaction>> getMyTransactions(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transactionService.getUserTransactions(userDetails.getUsername()));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all transactions (admin view)")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) return forwarded.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
