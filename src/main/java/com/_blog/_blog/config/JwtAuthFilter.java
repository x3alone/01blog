package com._blog._blog.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component; // <-- NEW: Component annotation
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.util.AntPathMatcher;

import java.io.IOException;
import java.util.Collections;

@Component // <-- Add this to make it a Spring bean
public class JwtAuthFilter extends OncePerRequestFilter {

    private final String jwtSecret = "mysecretkey"; // Must match the one in AuthService
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    // CRITICAL FIX: Tell the filter to skip these paths entirely
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Exclude /api/auth/** paths from JWT validation logic
        return pathMatcher.match("/api/auth/**", request.getServletPath());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // This logic will be SKIPPED for /api/auth/**
        
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtSecret.getBytes())
                        .parseClaimsJws(token)
                        .getBody();

                String username = claims.getSubject();

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }

            } catch (Exception e) {
                // Invalid token
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}