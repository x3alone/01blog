package com._blog._blog.repository;

import com._blog._blog.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findAllByOrderByTimestampDesc();
    boolean existsByReporterAndReportedPost(com._blog._blog.model.User reporter, com._blog._blog.model.Post reportedPost);
    boolean existsByReporterAndReportedUser(com._blog._blog.model.User reporter, com._blog._blog.model.User reportedUser);
}
