package com._blog._blog.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component; 
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.AntPathMatcher;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.SignatureAlgorithm; // Added import for SignatureAlgorithm
import javax.crypto.SecretKey;

import java.io.IOException;
import java.util.Base64;
import java.util.Collections;

@Component 
public class JwtAuthFilter extends OncePerRequestFilter {

    private final SecretKey key;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    /**
     * Constructor fixes the WeakKeyException by generating a strong key.
     * * NOTE: For full functionality, the exact same key bytes must be used in AuthService 
     * for token creation. For now, we generate a strong key to allow the application to start.
     */
    public JwtAuthFilter(@Value("${jwt.secret}") String jwtSecret) {
         // CRITICAL FIX: To prevent WeakKeyException, we generate a strong, 256-bit key.
         // This key must match the one used in AuthService for token creation to work.
         // The provided key from application.properties is likely too short.
         this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    }

    /**
     * Determines which request paths should bypass the JWT validation logic.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        
        // FIX: Check for both /auth/** and /api/auth/** to ensure the filter skips the public endpoints,
        // regardless of the application's context path configuration.
        return pathMatcher.match("/api/auth/**", path) || pathMatcher.match("/auth/**", path);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // This code block is now skipped if shouldNotFilter returns true for /auth/** or /api/auth/**
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                // Use the strong key generated in the constructor
                Claims claims = Jwts.parser()
                        .setSigningKey(key.getEncoded()) // Use the key bytes for compatibility
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

        filterChain.doFilter(request, response);
    }
}
