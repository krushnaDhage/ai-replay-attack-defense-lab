package com.replaylab.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.replaylab.backend.dto.LoginRequest;
import com.replaylab.backend.dto.RegisterRequest;
import com.replaylab.backend.dto.TransactionRequest;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ReplayAttackDefenseApplicationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    private static String jwt;
    private static String capturedNonce;
    private static String capturedTxId;

    @Test
    @Order(1)
    void testRegisterUser() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("testuser");
        req.setEmail("testuser@lab.com");
        req.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andReturn();

        jwt = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @Order(2)
    void testLoginUser() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setUsername("testuser");
        req.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        jwt = objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @Order(3)
    void testLegitimateTransaction() throws Exception {
        capturedTxId = "TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        capturedNonce = UUID.randomUUID().toString();

        TransactionRequest req = new TransactionRequest();
        req.setTransactionId(capturedTxId);
        req.setSenderAccount("A001");
        req.setReceiverAccount("A002");
        req.setAmount(new BigDecimal("500.00"));
        req.setNonce(capturedNonce);
        req.setTimestamp(Instant.now());

        mockMvc.perform(post("/api/transactions/transfer")
                .header("Authorization", "Bearer " + jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.securityStatus").value("NORMAL"));
    }

    @Test
    @Order(4)
    void testReplayAttackDetected() throws Exception {
        // Send the SAME transaction again → should be detected and blocked
        TransactionRequest req = new TransactionRequest();
        req.setTransactionId(capturedTxId);
        req.setSenderAccount("A001");
        req.setReceiverAccount("A002");
        req.setAmount(new BigDecimal("500.00"));
        req.setNonce(capturedNonce);
        req.setTimestamp(Instant.now().minusSeconds(600)); // Old timestamp

        mockMvc.perform(post("/api/transactions/transfer")
                .header("Authorization", "Bearer " + jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict()) // 409
                .andExpect(jsonPath("$.status").value("BLOCKED"))
                .andExpect(jsonPath("$.isReplay").value(true));
    }

    @Test
    @Order(5)
    void testNonceReuseDetected() throws Exception {
        // New TX ID but same nonce → nonce reuse flagged
        TransactionRequest req = new TransactionRequest();
        req.setTransactionId("TX-NONCE-REUSE-TEST");
        req.setSenderAccount("A001");
        req.setReceiverAccount("A002");
        req.setAmount(new BigDecimal("100.00"));
        req.setNonce(capturedNonce); // reusing nonce
        req.setTimestamp(Instant.now());

        mockMvc.perform(post("/api/transactions/transfer")
                .header("Authorization", "Bearer " + jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.isReplay").value(true));
    }

    @Test
    @Order(6)
    void testExpiredTimestamp() throws Exception {
        TransactionRequest req = new TransactionRequest();
        req.setTransactionId("TX-EXPIRED-" + UUID.randomUUID().toString().substring(0, 6));
        req.setSenderAccount("A003");
        req.setReceiverAccount("A004");
        req.setAmount(new BigDecimal("200.00"));
        req.setNonce(UUID.randomUUID().toString());
        req.setTimestamp(Instant.now().minusSeconds(600)); // 10 minutes old

        mockMvc.perform(post("/api/transactions/transfer")
                .header("Authorization", "Bearer " + jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(jsonPath("$.isReplay").value(true));
    }

    @Test
    @Order(7)
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.api").value("UP"));
    }

    @Test
    @Order(8)
    void testSecurityIncidentsCreated() throws Exception {
        mockMvc.perform(get("/api/security/incidents")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
    }

    @Test
    @Order(9)
    void testDashboardMetrics() throws Exception {
        mockMvc.perform(get("/api/security/dashboard")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRequests").exists())
                .andExpect(jsonPath("$.replayAttacksDetected").exists());
    }

    @Test
    @Order(10)
    void testNewLegitimateTransactionAfterAttack() throws Exception {
        // Verify normal traffic still works after attack
        TransactionRequest req = new TransactionRequest();
        req.setTransactionId("TX-AFTER-ATTACK-" + UUID.randomUUID().toString().substring(0, 6));
        req.setSenderAccount("A001");
        req.setReceiverAccount("A002");
        req.setAmount(new BigDecimal("250.00"));
        req.setNonce(UUID.randomUUID().toString());
        req.setTimestamp(Instant.now());

        mockMvc.perform(post("/api/transactions/transfer")
                .header("Authorization", "Bearer " + jwt)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    @Order(11)
    void testAdaptiveReplayAttackSimulation() throws Exception {
        mockMvc.perform(post("/api/attack-simulator/replay-adaptive")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value("BLOCKED"))
                .andExpect(jsonPath("$.isReplay").value(false));
    }
}
