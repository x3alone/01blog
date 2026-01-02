import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportService, Report } from '../../services/report.service';
import { PostService } from '../../services/post.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-dashboard-reports',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard-reports.component.html',
  styleUrl: './dashboard-reports.component.scss'
})
export class DashboardReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private postService = inject(PostService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  reports = signal<Report[]>([]);

  ngOnInit() {
    this.loadReports();
  }

  processingReports = signal<Set<number>>(new Set());

  loadReports() {
    this.reportService.getAllReports().subscribe({
      next: (data) => this.reports.set(data),
      error: (e) => console.error(e)
    });
  }

  isProcessing(reportId: number): boolean {
    return this.processingReports().has(reportId);
  }

  deletePost(report: Report) {
    if (this.isProcessing(report.id)) return;

    this.confirmationService.confirm('Are you sure you want to delete the reported post?', 'Delete Post')
      .subscribe(confirmed => {
        if (confirmed) {
          this.processingReports.update(set => {
            const newSet = new Set(set);
            newSet.add(report.id);
            return newSet;
          });

          this.postService.deletePost(report.reportedPostId).subscribe({
            next: () => {
              this.toastService.show("Post deleted.", 'success');
              this.loadReports();
              this.processingReports.update(set => {
                const newSet = new Set(set);
                newSet.delete(report.id);
                return newSet;
              });
            },
            error: (e) => {
              this.toastService.show("Failed to delete post: " + e.message, 'error');
              this.processingReports.update(set => {
                const newSet = new Set(set);
                newSet.delete(report.id);
                return newSet;
              });
            }
          });
        }
      });
  }

  dismissReport(reportId: number) {
    if (this.isProcessing(reportId)) return;

    this.confirmationService.confirm('Are you sure you want to dismiss this report?', 'Dismiss Report')
      .subscribe(confirmed => {
        if (confirmed) {
          this.processingReports.update(set => {
            const newSet = new Set(set);
            newSet.add(reportId);
            return newSet;
          });

          this.reportService.deleteReport(reportId).subscribe({
            next: () => {
              // Optimistically remove from list
              this.reports.update(reports => reports.filter(r => r.id !== reportId));
              this.toastService.show("Report dismissed.", 'success');
              this.processingReports.update(set => {
                const newSet = new Set(set);
                newSet.delete(reportId);
                return newSet;
              });
            },
            error: (e) => {
              // If it's already gone (404), just remove it from UI
              if (e.status === 404) {
                this.reports.update(reports => reports.filter(r => r.id !== reportId));
                this.toastService.show("Report already dismissed.", 'info');
              } else {
                this.toastService.show("Failed to dismiss report: " + e.message, 'error');
              }
              this.processingReports.update(set => {
                const newSet = new Set(set);
                newSet.delete(reportId);
                return newSet;
              });
            }
          });
        }
      });
  }
}
