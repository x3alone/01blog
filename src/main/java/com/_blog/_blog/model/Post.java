package com._blog._blog.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Cloudinary media fields: URL for display, type (IMAGE/VIDEO), publicId for deletion ( Secure Media Storage)
    @Column
    private String mediaUrl;

    @Column
    private String mediaType;

    @Column
    private String publicId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Post() {
        this.createdAt = LocalDateTime.now();
    }


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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // Cascade delete: when post is deleted, all comments are automatically removed ( Deleted Content Removal)
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Comment> comments = new java.util.ArrayList<>();

    public java.util.List<Comment> getComments() {
        return comments;
    }

    public void setComments(java.util.List<Comment> comments) {
        this.comments = comments;
    }

    // Cascade delete: reports tied to deleted posts are automatically removed ( Database Relationships)
    @OneToMany(mappedBy = "reportedPost", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<Report> reports = new java.util.ArrayList<>();

    // Many-to-many: tracks which users liked this post ( Post Interactions)
    @ManyToMany
    @JoinTable(
        name = "post_likes",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likes = new HashSet<>();

    public Set<User> getLikes() {
        return likes;
    }

    public void setLikes(Set<User> likes) {
        this.likes = likes;
    }

    public java.util.List<Report> getReports() {
        return reports;
    }

    public void setReports(java.util.List<Report> reports) {
        this.reports = reports;
    }

    // Admin hide functionality: hidden posts excluded from public feed but retained in database ( Admin Remove/Hide Posts)
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean hidden = false;

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }
}