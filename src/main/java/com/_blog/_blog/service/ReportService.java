package com._blog._blog.service;

import com._blog._blog.model.Post;
import com._blog._blog.model.Report;
import com._blog._blog.model.User;
import com._blog._blog.repository.PostRepository;
import com._blog._blog.repository.ReportRepository;
import com._blog._blog.repository.UserRepository;
import com._blog._blog.dto.ReportResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository, PostRepository postRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public void createReport(Long reporterId, Long postId, String reason, String details) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if self-reporting
        if (reporter.getId().equals(post.getUser().getId())) {
             throw new RuntimeException("You cannot report your own post.");
        }
        
        // Check if already reported
        if (reportRepository.existsByReporterAndReportedPost(reporter, post)) {
             throw new RuntimeException("You have already reported this post.");
        }

        Report report = new Report(reporter, post, reason, details);
        reportRepository.save(report);
    }

    @Transactional
    public void createUserReport(Long reporterId, Long reportedUserId, String reason, String details) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));
        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (reporter.getId().equals(reportedUser.getId())) {
             throw new RuntimeException("You cannot report yourself.");
        }

        // Check if already reported
        if (reportRepository.existsByReporterAndReportedUser(reporter, reportedUser)) {
             throw new RuntimeException("You have already reported this user.");
        }

        Report report = new Report(reporter, reportedUser, reason, details);
        reportRepository.save(report);
    }

    public void deleteReport(Long reportId) {
        if (!reportRepository.existsById(reportId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found");
        }
        reportRepository.deleteById(reportId);
    }

    public List<Report> getAllReports() {
        return reportRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReportResponses() {
        return getAllReports().stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private ReportResponse mapToResponse(Report report) {
        Long postId = report.getReportedPost() != null ? report.getReportedPost().getId() : null;
        String postTitle = report.getReportedPost() != null ? report.getReportedPost().getTitle() : null;
        String postContent = report.getReportedPost() != null ? report.getReportedPost().getContent() : null;
        String postAuthor = (report.getReportedPost() != null && report.getReportedPost().getUser() != null) ? report.getReportedPost().getUser().getUsername() : null;
        String mediaUrl = (report.getReportedPost() != null) ? report.getReportedPost().getMediaUrl() : null;
        String mediaType = (report.getReportedPost() != null) ? report.getReportedPost().getMediaType() : null;

        Long reportedUserId = report.getReportedUser() != null ? report.getReportedUser().getId() : null;
        String reportedUsername = report.getReportedUser() != null ? report.getReportedUser().getUsername() : null;
        String reportedUserAvatar = report.getReportedUser() != null ? report.getReportedUser().getAvatarUrl() : null;

        return new ReportResponse(
                report.getId(),
                report.getReason(),
                report.getDetails(),
                report.getTimestamp(),
                report.getReporter().getId(),
                report.getReporter().getUsername(),
                postId,
                postTitle,
                postContent,
                postAuthor,
                mediaUrl,
                mediaType,
                reportedUserId,
                reportedUsername,
                reportedUserAvatar
        );
    }
}
