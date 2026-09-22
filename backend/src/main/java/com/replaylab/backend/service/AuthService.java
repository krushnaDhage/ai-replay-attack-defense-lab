package com.replaylab.backend.service;

import com.replaylab.backend.dto.AuthResponse;
import com.replaylab.backend.dto.LoginRequest;
import com.replaylab.backend.dto.RegisterRequest;
import com.replaylab.backend.entity.User;
import com.replaylab.backend.repository.UserRepository;
import com.replaylab.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest request, String sourceIp) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of("USER"))
                .enabled(true)
                .lastLoginIp(sourceIp)
                .lastLoginAt(Instant.now())
                .build();

        userRepository.save(user);
        log.info("User registered: {}", request.getUsername());

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles())
                .expiresIn(86400000L)
                .build();
    }

    public AuthResponse login(LoginRequest request, String sourceIp) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        // Update last login
        userRepository.findByUsername(request.getUsername()).ifPresent(user -> {
            user.setLastLoginAt(Instant.now());
            user.setLastLoginIp(sourceIp);
            userRepository.save(user);
        });

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();

        log.info("User logged in: {} from IP: {}", request.getUsername(), sourceIp);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(user.getRoles())
                .expiresIn(86400000L)
                .build();
    }
}
