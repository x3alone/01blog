package com._blog._blog.service;

import com._blog._blog.dto.LoginRequest;
import com._blog._blog.dto.RegisterRequest;
import com._blog._blog.model.User;
import com._blog._blog.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys; 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException; 
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key; // Use java.security.Key
import java.util.Date;
import java.util.Optional;
import java.util.Base64; 

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
// import com._blog._blog.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; 

    // --- JWT Key Initialization (MUST match JwtAuthFilter) ---
    private final String jwtSecretBase64 = "L7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD";
    private final Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecretBase64));
    
    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs; 

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

        String role = (userRepository.count() == 0) ? "ADMIN" : "USER"; // sokan l asliyon or new commers

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setBanned(false);

        // FIX: Check if this is the FIRST user
        // if (userRepository.count() == 0) {
        //     user.setRole("ADMIN"); // sokan l asliyon
        // } else {
        //     user.setRole("USER"); 
        // }

        userRepository.save(user);
    }

    /**
     * Handles user login (manual authentication) and generates a JWT token upon success.
     */
    public String login(LoginRequest request) {
        // 1. Find user by username. 
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            throw new BadCredentialsException("Invalid credentials");
        }
        User user = userOpt.get();

        // 2. Manually check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        // 3. Check if user is banned
        if (user.isBanned()) {
             throw new BadCredentialsException("Account is locked by admin.");
        }
        
        // 4. Build the JWT token
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole()) 
                .claim("id", user.getId()) // Add ID to token
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(key, SignatureAlgorithm.HS512) 
                .compact();
    }
}