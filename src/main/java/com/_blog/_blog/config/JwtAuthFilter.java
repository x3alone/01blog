package com._blog._blog.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component; 
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys; 
import io.jsonwebtoken.SignatureAlgorithm; 

import java.io.IOException;
import java.security.Key;
import java.util.Base64;
import java.util.Collections;

@Component 
public class JwtAuthFilter extends OncePerRequestFilter {

    private final Key key;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    // CRITICAL FIX: Use the SAME hardcoded Base64 secret key as defined in AuthService
    private final String jwtSecretBase64 = "L7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD";

    public JwtAuthFilter() {
        // Initialize the key using the Base64 string for HMAC SHA-512 signing
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecretBase64));
    }

    /**
     * Determines which request paths should bypass the JWT validation logic.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        
        return pathMatcher.match("/api/auth/**", path) || pathMatcher.match("/auth/**", path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // FIX: Use Jwts.parserBuilder() and the initialized key
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key) 
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String username = claims.getSubject();

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Authenticate the user based on the valid token (no password needed)
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }

            } catch (Exception e) {
                // Log and clear context if the token is invalid or expired
                System.err.println("JWT Validation Failed: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        System.out.println("filter\n\n  zdzdzdzdazdazdazdzadazd");
        filterChain.doFilter(request, response);
        System.out.println("filter222222222\n\n  zdzdzdzdazdazdazdzadazd");
        
    }
}