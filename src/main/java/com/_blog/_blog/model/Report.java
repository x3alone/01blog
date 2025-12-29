package com._blog._blog.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore; 
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The user who filed the report
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    @JsonIgnoreProperties({"posts", "password", "role", "isBanned", "authorities"}) // Simplify serialization
    private User reporter;

    // The post being reported (Optional if reporting a user)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = true)
    @JsonIgnoreProperties({"user", "content"}) 
    private Post reportedPost;

    // The user being reported (Optional if reporting a post)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id", nullable = true)
    @JsonIgnoreProperties({"posts", "password", "role", "isBanned", "authorities"})
    private User reportedUser;

    @Column(nullable = false)
    private String reason; // e.g., "Scam", "Hate", "Other"

    @Column(columnDefinition = "TEXT")
    private String details; // Optional description

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public Report() {}

    public Report(User reporter, Post reportedPost, String reason, String details) {
        this.reporter = reporter;
        this.reportedPost = reportedPost;
        this.reason = reason;
        this.details = details;
    }

    public Report(User reporter, User reportedUser, String reason, String details) {
        this.reporter = reporter;
        this.reportedUser = reportedUser;
        this.reason = reason;
        this.details = details;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }
    public Post getReportedPost() { return reportedPost; }
    public void setReportedPost(Post reportedPost) { this.reportedPost = reportedPost; }
    public User getReportedUser() { return reportedUser; }
    public void setReportedUser(User reportedUser) { this.reportedUser = reportedUser; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
