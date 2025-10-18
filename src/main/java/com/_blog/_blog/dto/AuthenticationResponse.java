package com._blog._blog.dto;

/**
 * DTO used for sending the JWT token back to the client after a successful login.
 */
public class AuthenticationResponse {
    
    private String jwtToken;

    public AuthenticationResponse(String jwtToken) {
        this.jwtToken = jwtToken;
    }

    // Getters and Setters
    public String getJwtToken() {
        return jwtToken;
    }

    public void setJwtToken(String jwtToken) {
        this.jwtToken = jwtToken;
    }
}
