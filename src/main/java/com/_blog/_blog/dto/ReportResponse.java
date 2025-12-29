package com._blog._blog.dto;

import java.time.LocalDateTime;

public class ReportResponse {
    private Long id;
    private String reason;
    private String details;
    private LocalDateTime timestamp;
    
    // Flattened Reporter Info
    private Long reporterId;
    private String reporterUsername;

    // Flattened Reported Post Info
    private Long reportedPostId;
    private String reportedPostTitle;
    private String reportedPostContent;
    private String reportedPostAuthorUsername;
    private String reportedPostMediaUrl;
    private String reportedPostMediaType;

    // Flattened Reported User Info
    private Long reportedUserId;
    private String reportedUsername;
    private String reportedUserAvatarUrl;

    public ReportResponse(Long id, String reason, String details, LocalDateTime timestamp, 
                          Long reporterId, String reporterUsername, 
                          Long reportedPostId, String reportedPostTitle, String reportedPostContent, String reportedPostAuthorUsername,
                          String reportedPostMediaUrl, String reportedPostMediaType,
                          Long reportedUserId, String reportedUsername, String reportedUserAvatarUrl) {
        this.id = id;
        this.reason = reason;
        this.details = details;
        this.timestamp = timestamp;
        this.reporterId = reporterId;
        this.reporterUsername = reporterUsername;
        this.reportedPostId = reportedPostId;
        this.reportedPostTitle = reportedPostTitle;
        this.reportedPostContent = reportedPostContent;
        this.reportedPostAuthorUsername = reportedPostAuthorUsername;
        this.reportedPostMediaUrl = reportedPostMediaUrl;
        this.reportedPostMediaType = reportedPostMediaType;
        this.reportedUserId = reportedUserId;
        this.reportedUsername = reportedUsername;
        this.reportedUserAvatarUrl = reportedUserAvatarUrl;
    }

    // Getters
    public Long getId() { return id; }
    public String getReason() { return reason; }
    public String getDetails() { return details; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public Long getReporterId() { return reporterId; }
    public String getReporterUsername() { return reporterUsername; }
    public Long getReportedPostId() { return reportedPostId; }
    public String getReportedPostTitle() { return reportedPostTitle; }
    public String getReportedPostContent() { return reportedPostContent; }
    public String getReportedPostAuthorUsername() { return reportedPostAuthorUsername; }
    public String getReportedPostMediaUrl() { return reportedPostMediaUrl; }
    public String getReportedPostMediaType() { return reportedPostMediaType; }
    public Long getReportedUserId() { return reportedUserId; }
    public String getReportedUsername() { return reportedUsername; }
    public String getReportedUserAvatarUrl() { return reportedUserAvatarUrl; }
}
