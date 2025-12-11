import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportService, Report } from '../../services/report.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-dashboard-reports',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="reports-container">
      <h3 class="section-title">Reported Posts</h3>
      
      @if (reports().length === 0) {
        <div class="no-reports-message">No reports found.</div>
      }

      <div class="reports-list">
        @for (report of reports(); track report.id) {
          <div class="report-card">
            <div class="report-header">
              <span class="report-reason">{{ report.reason }}</span>
              <span class="report-date">{{ report.timestamp | date:'short' }}</span>
            </div>
            
            <p class="report-details">"{{ report.details }}"</p>
            <p class="reporter-info">Reported by: {{ report.reporterUsername }}</p>
            
            <div class="reported-post-box">
              <h4>Post: {{ report.reportedPostTitle }}</h4>
              <p>By: {{ report.reportedPostAuthorUsername }}</p>
              <p class="post-snippet">{{ report.reportedPostContent | slice:0:100 }}...</p>
            </div>

            <div class="action-buttons">
              <button (click)="deletePost(report.reportedPostId)" class="delete-btn">
                Delete Post
              </button>
              <button (click)="dismissReport(report.id)" class="dismiss-btn">
                Dismiss
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .reports-container { padding: 20px; }
    .section-title { font-size: 1.5rem; margin-bottom: 20px; color: #fff; }
    .no-reports-message { color: #aaa; font-style: italic; }
    
    .reports-list { display: grid; gap: 20px; }
    
    .report-card {
      background: #1e293b;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #334155;
    }
    
    .report-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .report-reason {
      font-weight: bold;
      color: #f87171; /* Red-ish */
      text-transform: uppercase;
      font-size: 0.9rem;
    }
    .report-date { font-size: 0.8rem; color: #94a3b8; }
    
    .report-details { font-style: italic; color: #e2e8f0; margin-bottom: 10px; }
    .reporter-info { font-size: 0.85rem; color: #94a3b8; margin-bottom: 15px; }

    .reported-post-box {
      background: #0f172a;
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    .reported-post-box h4 { margin: 0 0 5px; color: #fff; }
    .reported-post-box p { font-size: 0.9rem; color: #cbd5e1; margin: 0; }
    .post-snippet { color: #94a3b8; margin-top: 5px !important; }

    .action-buttons { display: flex; gap: 10px; }

    .delete-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }
    .delete-btn:hover { background: #dc2626; }

    .dismiss-btn {
      background: #64748b;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.2s;
    }
    .dismiss-btn:hover { background: #475569; }
  `]
})
export class DashboardReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private postService = inject(PostService);

  reports = signal<Report[]>([]);

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.reportService.getAllReports().subscribe({
      next: (data) => this.reports.set(data),
      error: (e) => console.error(e)
    });
  }

  deletePost(postId: number) {
    if (!confirm("Are you sure you want to delete the reported post?")) return;

    this.postService.deletePost(postId).subscribe({
      next: () => {
        alert("Post deleted.");
        this.loadReports();
      },
      error: (e) => alert("Failed to delete post: " + e.message)
    });
  }

  dismissReport(reportId: number) {
    if (!confirm("Are you sure you want to dismiss this report?")) return;

    this.reportService.deleteReport(reportId).subscribe({
      next: () => {
        // Optimistically remove from list
        this.reports.update(reports => reports.filter(r => r.id !== reportId));
      },
      error: (e) => alert("Failed to dismiss report: " + e.message)
    });
  }
}
