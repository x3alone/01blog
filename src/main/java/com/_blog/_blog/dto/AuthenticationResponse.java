package com._blog._blog.dto;

/**
 * DTO used for sending the JWT token back to the client after a successful login.
 */
public class AuthenticationResponse {
    
    private String jwtToken;
    private Long id;
    private String username;
    private String role;
    private String avatarUrl;

    public AuthenticationResponse(String jwtToken, Long id, String username, String role, String avatarUrl) {
        this.jwtToken = jwtToken;
        this.id = id;
        this.username = username;
        this.role = role;
        this.avatarUrl = avatarUrl;
    }

    // Getters and Setters
    public String getJwtToken() { return jwtToken; }
    public void setJwtToken(String jwtToken) { this.jwtToken = jwtToken; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}
