package com.replaylab.backend.controller;

import com.replaylab.backend.dto.AuthResponse;
import com.replaylab.backend.dto.LoginRequest;
import com.replaylab.backend.dto.RegisterRequest;
import com.replaylab.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register and login endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                  HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        return ResponseEntity.ok(authService.register(request, ip));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                               HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        return ResponseEntity.ok(authService.login(request, ip));
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isEmpty()) return forwarded.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
