package com._blog._blog.controller;

import com._blog._blog.dto.RegisterRequest;
import com._blog._blog.dto.LoginRequest;
import com._blog._blog.dto.AuthResponse;
import com._blog._blog.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200") // Angular frontend
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(new AuthResponse("User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
    String token = authService.generateJwtToken(request);
    return ResponseEntity.ok(new AuthResponse(token));
}


}
