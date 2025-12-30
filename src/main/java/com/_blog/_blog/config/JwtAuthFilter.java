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

    // Shared JWT secret key for token validation (must match AuthService key) (Audit: Secure Token Management)
    private final String jwtSecretBase64 = "L7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD";

    private final com._blog._blog.repository.UserRepository userRepository;

    public JwtAuthFilter(com._blog._blog.repository.UserRepository userRepository) {
        this.userRepository = userRepository;
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecretBase64));
    }

    // Bypass JWT validation for authentication endpoints (login/register do not require existing token)
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return pathMatcher.match("/api/auth/**", path) || pathMatcher.match("/auth/**", path);
    }

    // JWT validation filter: extracts token, validates signature, checks ban status, and sets authentication context (Audit: JWT Authentication)
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key) 
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String username = claims.getSubject();
                
                // Real-time user validation: checks current ban status and role from database, not stale token claims (Audit: Admin Ban Enforcement)
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    var userOpt = userRepository.findByUsername(username);
                    
                    if (userOpt.isPresent()) {
                        var user = userOpt.get();
                        
                        // Immediate rejection of banned users prevents any API access
                        if (user.isBanned()) {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"User is banned\"}");
                            return;
                        }

                        // Using current role from database ensures role changes take effect immediately without re-login
                        String role = user.getRole();

                        java.util.List<org.springframework.security.core.authority.SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                        if (role != null) {
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(role));
                            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role));
                        }

                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(username, null, authorities);
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }

            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
        
    }
}