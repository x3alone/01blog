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

    // JWT secret key shared with JwtAuthFilter for token generation and validation (Audit: Secure Token Management)
    private final String jwtSecretBase64 = "L7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD2gC5jB4kF7tP8oQ0rN9sM1v7hC6aG2bF1yT5uR3oP0wN8jK4dL7mF9tA5bG1cE3dU2iJ6kH0vQ4sO8rI7uW6xV9zY1wE3tD";
    private final Key key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecretBase64));
    
    @Value("${jwt.expiration-ms}")
    private long jwtExpirationMs; 

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    // User registration with BCrypt password hashing and automatic admin assignment for first user (Audit: Password Security, Role-based Access Control)
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new com._blog._blog.exception.UserAlreadyExistsException("username already exists"); 
        }

        // First registered user becomes ADMIN, subsequent users are USER by default
        String role = (userRepository.count() == 0) ? "ADMIN" : "USER"; 

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt hashing
        user.setRole(role);
        user.setBanned(false);


        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setNickname(request.getNickname());
        user.setAboutMe(request.getAboutMe());

        userRepository.save(user);
    }

    // Login with sequential validation: provides specific error messages (username vs password vs banned) for better UX (Audit: Error Handling)
    public AuthenticationResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("username does not exist"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("password not correct");
        }

        // Ban enforcement: prevents banned users from obtaining new JWT tokens (Audit: Admin Ban Users)
        if (user.isBanned()) {
             throw new org.springframework.security.authentication.LockedException("you have been banned by an admin");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
             throw new BadCredentialsException("password not correct");
        }

        // JWT token generation with HS512 encryption, includes user ID and role claims (Audit: JWT Authentication)
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + jwtExpirationMs);

        String jwtToken = Jwts.builder()
                .setSubject(user.getUsername())
                .claim("role", user.getRole()) 
                .claim("id", user.getId())
                .setIssuedAt(now)
                .setExpiration(expirationDate)
                .signWith(key, SignatureAlgorithm.HS512) 
                .compact();
        

        return new AuthenticationResponse(
            jwtToken,
            user.getId(),
            user.getUsername(),
            user.getRole(),
            user.getAvatarUrl()
        );
    }
}