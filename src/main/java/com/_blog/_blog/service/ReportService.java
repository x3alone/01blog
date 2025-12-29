package com._blog._blog.service;

import com._blog._blog.model.Post;
import com._blog._blog.model.Report;
import com._blog._blog.model.User;
import com._blog._blog.repository.PostRepository;
import com._blog._blog.repository.ReportRepository;
import com._blog._blog.repository.UserRepository;
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reporter not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (post.getUser().getId().equals(reporterId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot report your own post");
        }

        if (reportRepository.existsByReporterAndReportedPost(reporter, post)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reported this post");
        }

        Report report = new Report(reporter, post, reason, details);
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
    public List<com._blog._blog.dto.ReportResponse> getAllReportResponses() {
        return getAllReports().stream()
                .map(report -> new com._blog._blog.dto.ReportResponse(
                        report.getId(),
                        report.getReason(),
                        report.getDetails(),
                        report.getTimestamp(),
                        report.getReporter().getId(),
                        report.getReporter().getUsername(),
                        report.getReportedPost().getId(),
                        report.getReportedPost().getTitle(),
                        report.getReportedPost().getContent(),
                        report.getReportedPost().getUser().getUsername(),
                        report.getReportedPost().getMediaUrl(),
                        report.getReportedPost().getMediaType()
                ))
                .collect(java.util.stream.Collectors.toList());
    }
}
