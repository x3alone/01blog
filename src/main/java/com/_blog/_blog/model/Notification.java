package com._blog._blog.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "email", "posts", "comments", "notifications"})
    private User recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id") // No nullable=false for backward compatibility if needed, but DB enforces it
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "email", "posts", "comments", "notifications"})
    private User actor;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // e.g., "COMMENT", "FOLLOW", "LIKE"

    private Long relatedId; // ID of the post or user related to the event

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Notification(User recipient, User actor, String message, String type, Long relatedId) {
        this.recipient = recipient;
        this.actor = actor;
        this.message = message;
        this.type = type;
        this.relatedId = relatedId;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getRelatedId() { return relatedId; }
    public void setRelatedId(Long relatedId) { this.relatedId = relatedId; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
