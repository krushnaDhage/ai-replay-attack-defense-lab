package com.replaylab.backend.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String method = request.getMethod();
            String uri = request.getRequestURI();
            String authHeader = request.getHeader("Authorization");
            String cookieHeader = request.getHeader("Cookie");
            log.info("[RequestLoggingFilter] Incoming request - METHOD: {}, URI: {}", method, uri);
            log.info("[RequestLoggingFilter] Authorization header present? {}", authHeader != null ? "YES" : "NO");
            log.info("[RequestLoggingFilter] Cookie header present? {}", cookieHeader != null ? "YES" : "NO");
            // Log all headers for deeper debugging (optional, can be noisy)
            Enumeration<String> headerNames = request.getHeaderNames();
            if (headerNames != null) {
                while (headerNames.hasMoreElements()) {
                    String name = headerNames.nextElement();
                    String value = Collections.list(request.getHeaders(name)).toString();
                    log.debug("[RequestLoggingFilter] Header: {} = {}", name, value);
                }
            }
        } catch (Exception e) {
            log.error("[RequestLoggingFilter] Error while logging request", e);
        }
        // Proceed with the chain
        filterChain.doFilter(request, response);
        // After processing, log response status
        log.info("[RequestLoggingFilter] Response status for {} {}: {}", request.getMethod(), request.getRequestURI(), response.getStatus());
    }
}
