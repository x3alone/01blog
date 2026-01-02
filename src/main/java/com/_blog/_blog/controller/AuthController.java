package com._blog._blog.controller;

import com._blog._blog.dto.LoginRequest;
import com._blog._blog.dto.RegisterRequest;
import com._blog._blog.dto.AuthenticationResponse; // Assuming this DTO exists
import com._blog._blog.service.AuthService;
import com._blog._blog.service.MediaService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final MediaService mediaService;

    public AuthController(AuthService authService, MediaService mediaService) {
        this.authService = authService;
        this.mediaService = mediaService;
    }

    
      //Handles user registration and returns a 201 Created status upon success.
     //  Does not return a JWT upon registration, only successful creation.
     
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest registerRequest) {
        authService.register(registerRequest);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    
    // Handles user login, calls authService.login, and returns the JWT in the 
     // AuthenticationResponse DTO with a 200 OK status.
     //  This explicitly uses the updated 'login' method name.
     
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody LoginRequest loginRequest) {
        // 1. Call the service layer to perform authentication and generate the JWT
        AuthenticationResponse response = authService.login(loginRequest);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map> uploadMedia(@RequestParam("file") MultipartFile file) {
        try {
            // Public upload for registration (avatars mainly)
            String customName = "upload_" + System.currentTimeMillis(); 
            Map result = mediaService.uploadFile(file, "uploads_public", customName);
            return ResponseEntity.ok(result);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
