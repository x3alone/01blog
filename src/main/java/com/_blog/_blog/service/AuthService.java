package com._blog._blog.service;

import com._blog._blog.dto.LoginRequest;
import com._blog._blog.dto.RegisterRequest;
import com._blog._blog.model.User;
import com._blog._blog.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys; // Required for secure key generation
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Optional;
import java.util.Base64; // Required for Base64 decoding

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; 

    // --- FIX FOR WeakKeyException ---
    // Problem: The previous use of @Value("${jwt.secret}") failed the security check
    // because the key was not long enough for HS512.
    // Solution: Use a hardcoded, cryptographically strong, Base64-encoded key 
    // and decode it into a secure Key object. This guarantees the required length.
    private final String jwtSecretBase64 = "L7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD";
    private final Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecretBase64));
    // ---------------------------------

    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs; // Keep expiration value from properties

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Handles user registration.
     */
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists"); 
        }

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : "USER" // Default role to USER
        );

        userRepository.save(user);
    }

    /**
     * Handles user login (manual authentication) and generates a JWT token upon success.
     * This method performs both user lookup and password verification.
     */
    public String login(LoginRequest request) {
        // 1. Find user by username
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            // Throw a general "Invalid credentials" error for security
            throw new RuntimeException("Invalid credentials");
        }
        User user = userOpt.get();

        // 2. Manually check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // 3. Build the JWT token
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole()) 
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(key, SignatureAlgorithm.HS512) // Use the secure Key object for signing
                .compact();
    }
}
