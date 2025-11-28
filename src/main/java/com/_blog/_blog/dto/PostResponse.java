package com._blog._blog.dto;

import java.time.LocalDateTime;

/**
 * DTO for sending Post data back to the frontend.
 * Includes the username instead of the full User object.
 */
public class PostResponse {
    
    private Long id;
    private String title;
    private String content;
    private String username; // The author's username
    private LocalDateTime createdAt;

    // Constructor
    public PostResponse(Long id, String title, String content, String username, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.username = username;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}