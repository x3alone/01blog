package com._blog._blog.service;

import com._blog._blog.dto.LoginRequest;
import com._blog._blog.dto.RegisterRequest;
import com._blog._blog.model.User;
import com._blog._blog.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder; // Use injected PasswordEncoder
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

// NOTE: This class no longer uses Spring Security's AuthenticationManager or implements UserDetailsService.
// It performs manual user lookup and password verification.
@Service
public class AuthService {

    private final UserRepository userRepository;
    // CRITICAL FIX: Inject the configured PasswordEncoder from SecurityConfig instead of creating a new one
    private final PasswordEncoder passwordEncoder; 

    @Value("${jwt.secret}")
    private String jwtSecret;

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

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : "USER" // Default role to USER
        );

        userRepository.save(user);
    }

    /**
     * Generates a JWT token after successful manual authentication.
     */
    public String generateJwtToken(LoginRequest request) {
        // 1. Find user by username
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
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
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }
}
