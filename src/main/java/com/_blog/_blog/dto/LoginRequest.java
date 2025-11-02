package com._blog._blog.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    // Must be at least 4 characters long
    @NotBlank(message = "Username cannot be empty")
    @Size(min = 4, message = "Username must be at least 4 characters long.")
    private String username;

    // Must be at least 8 characters long
    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, message = "Password must be at least 8 characters long.")
    private String password;

    // Constructors
    public LoginRequest() {}

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getters
    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    // Setters
    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
