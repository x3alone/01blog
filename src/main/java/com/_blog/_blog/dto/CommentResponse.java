package com._blog._blog.dto;

import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private String content;
    private String username;
    private LocalDateTime createdAt;
    private String mediaType;
    private String mediaUrl;
    private String avatarUrl; 
    private Long userId; // NEW FIELD

    public CommentResponse(Long id, String content, String username, LocalDateTime createdAt, String avatarUrl, Long userId) {
        this.id = id;
        this.content = content;
        this.username = username;
        this.createdAt = createdAt;
        this.avatarUrl = avatarUrl;
        this.userId = userId;
    }

    public CommentResponse(Long id, String content, String username, LocalDateTime createdAt, String mediaUrl, String mediaType, String avatarUrl, Long userId) {
        this.id = id;
        this.content = content;
        this.username = username;
        this.createdAt = createdAt;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.avatarUrl = avatarUrl;
        this.userId = userId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    
}
