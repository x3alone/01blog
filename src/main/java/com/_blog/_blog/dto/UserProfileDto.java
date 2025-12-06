package com._blog._blog.dto;

public class UserProfileDto {

    private Long id;
    private String username;
    private String role; // For display on profile, e.g., to show "Admin"
    
    // Follow statistics
    private long followersCount;
    private long followingCount;
    
    // Relationship status relative to the CURRENTLY logged-in user
    private boolean isFollowedByCurrentUser;

    // --- Constructors, Getters, and Setters ---

    public UserProfileDto() {
    }

    public UserProfileDto(Long id, String username, String role, long followersCount, long followingCount, boolean isFollowedByCurrentUser) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.isFollowedByCurrentUser = isFollowedByCurrentUser;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(long followersCount) {
        this.followersCount = followersCount;
    }

    public long getFollowingCount() {
        return followingCount;
    }

    public void setFollowingCount(long followingCount) {
        this.followingCount = followingCount;
    }

    public boolean getIsFollowedByCurrentUser() {
        return isFollowedByCurrentUser;
    }

    public void setIsFollowedByCurrentUser(boolean isFollowedByCurrentUser) {
        this.isFollowedByCurrentUser = isFollowedByCurrentUser;
    }
}