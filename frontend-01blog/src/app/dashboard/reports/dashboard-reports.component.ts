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
              <div class="mini-post-header">
                <span class="mini-label">Reported Post</span>
                <span class="post-author">@{{ report.reportedPostAuthorUsername }}</span>
              </div>
              
              <h4 class="post-title">{{ report.reportedPostTitle }}</h4>
              <p class="post-snippet">{{ report.reportedPostContent | slice:0:150 }}{{ report.reportedPostContent.length > 150 ? '...' : '' }}</p>
              
              @if (report.reportedPostMediaType === 'image' && report.reportedPostMediaUrl) {
                <div class="media-preview">
                  <img [src]="report.reportedPostMediaUrl" alt="Reported Media">
                </div>
              }
              @if (report.reportedPostMediaType === 'video' && report.reportedPostMediaUrl) {
                <div class="media-preview">
                  <video [src]="report.reportedPostMediaUrl" controls></video>
                </div>
              }
            </div>

            <div class="action-buttons">
              <button (click)="deletePost(report)" class="delete-btn" [disabled]="isProcessing(report.id)">
                @if (isProcessing(report.id)) { ... } @else { Delete Post }
              </button>
              <button (click)="dismissReport(report.id)" class="dismiss-btn" [disabled]="isProcessing(report.id)">
               @if (isProcessing(report.id)) { ... } @else { Dismiss }
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
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      border: 1px solid #334155;
    }
    .mini-post-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    .mini-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
    .post-author { font-size: 0.85rem; color: #38bdf8; font-weight: 500; }
    
    .post-title { margin: 0 0 5px; color: #f1f5f9; font-size: 1rem; }
    .post-snippet { color: #eee; margin: 0 0 10px !important; line-height: 1.4; font-size: 0.9rem; }
    
    .media-preview {
      width: 100%;
      height: 150px;
      background: #000;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .media-preview img, .media-preview video {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

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
