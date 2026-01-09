package com._blog._blog.controller;

import com._blog._blog.dto.ReportResponse; 
import com._blog._blog.service.ReportService;
import com._blog._blog.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;

    public ReportController(ReportService reportService, UserService userService) {
        this.reportService = reportService;
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<Void> createReport(@RequestBody Map<String, Object> payload, @AuthenticationPrincipal String username) {
        Long reporterId = userService.getUserByUsername(username).getId();
        
        if (payload.containsKey("postId")) {
            Long postId = Long.valueOf(payload.get("postId").toString());
            String reason = (String) payload.get("reason");
            String details = (String) payload.get("details");
            reportService.createReport(reporterId, postId, reason, details);
        } else if (payload.containsKey("reportedUserId")) {
            Long reportedUserId = Long.valueOf(payload.get("reportedUserId").toString());
            String reason = (String) payload.get("reason");
            String details = (String) payload.get("details");
            reportService.createUserReport(reporterId, reportedUserId, reason, details);
        } else {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReportResponse>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReportResponses());
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok().build();
    }
}
