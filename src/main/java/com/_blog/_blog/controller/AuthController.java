package com._blog._blog.controller;

import com._blog._blog.dto.LoginRequest;
import com._blog._blog.dto.RegisterRequest;
import com._blog._blog.dto.AuthenticationResponse; // Assuming this DTO exists
import com._blog._blog.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Handles user registration and returns a 201 Created status upon success.
     * Note: Does not return a JWT upon registration, only successful creation.
     */
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    /**
     * Handles user login, calls authService.login, and returns the JWT in the 
     * AuthenticationResponse DTO with a 200 OK status.
     * * NOTE: This explicitly uses the updated 'login' method name.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody LoginRequest loginRequest) {
        // 1. Call the service layer to perform authentication and generate the JWT
        String jwt = authService.login(loginRequest);
        
        // 2. Wrap the JWT in a response DTO for the client
        AuthenticationResponse response = new AuthenticationResponse(jwt);
        
        // 3. Return the response entity with the JWT and HTTP 200 OK
        return ResponseEntity.ok(response);
    }
}
