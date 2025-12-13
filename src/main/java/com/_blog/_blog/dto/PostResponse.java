package com._blog._blog.dto;

import java.time.LocalDateTime;

public class PostResponse {
    
    private Long id;
    private String title;
    private String content;
    private Long userId; // NEW FIELD
    private String username; // The author's username
    private LocalDateTime createdAt;
    private String mediaType; // NEW FIELD
    private String mediaUrl;  // NEW FIELD

    // UPDATED CONSTRUCTOR: Now takes 8 arguments
    public PostResponse(Long id, String title, String content, Long userId, String username, LocalDateTime createdAt, String mediaUrl, String mediaType) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.userId = userId;
        this.username = username;
        this.createdAt = createdAt;
        this.mediaUrl = mediaUrl;   // Assigning mediaUrl
        this.mediaType = mediaType; // Assigning mediaType
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }
}