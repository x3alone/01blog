package com._blog._blog.service;

import com._blog._blog.dto.LoginRequest;
import com._blog._blog.dto.RegisterRequest;
import com._blog._blog.dto.AuthenticationResponse;
import com._blog._blog.model.User;
import com._blog._blog.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys; 
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException; 
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Key; 
import java.util.Date;
import java.util.Optional;
import java.util.Base64; 

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; 
    private final AuthenticationManager authenticationManager;

    // --- JWT Key Initialization ---
    // Ideally this should be in application.properties but keeping it here as per existing code
    private final String jwtSecretBase64 = "L7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD";
    private final Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecretBase64));
    
    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs; 

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Handles user registration.
     */
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new com._blog._blog.exception.UserAlreadyExistsException("username already exists"); 
        }

        String role = (userRepository.count() == 0) ? "ADMIN" : "USER"; 

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setBanned(false);

        // Map new fields
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setNickname(request.getNickname());
        user.setAboutMe(request.getAboutMe());

        userRepository.save(user);
    }

    /**
     * Handles user login (manual authentication) and generates a JWT token upon success.
     */
    /**
     * Handles user login (manual authentication) and generates a JWT token upon success.
     */
    public AuthenticationResponse login(LoginRequest request) {
        // 1. Check if username exists FIRST
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("username does not exist"));

        // 2. Check if password matches
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("password not correct");
        }

        // 3. Check if user is banned
        if (user.isBanned()) {
             throw new org.springframework.security.authentication.LockedException("you have been banned by an admin");
        }

        // 4. Authenticate using AuthenticationManager (Still needed to set security context if used later, 
        //    but we've already validated credentials manually. Calling this validates again which is fine)
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            // Should not happen if matches() passed, but safe fallback
             throw new BadCredentialsException("password not correct");
        }

        // 5. Build the JWT token
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + jwtExpirationMs);

        String jwtToken = Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole()) 
                .claim("id", user.getId()) // Add ID to token
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(key, SignatureAlgorithm.HS512) 
                .compact();
        
        // 6. Return Response DTO
        return new AuthenticationResponse(
            jwtToken,
            user.getId(),
            user.getUsername(),
            user.getRole(),
            user.getAvatarUrl()
        );
    }
}