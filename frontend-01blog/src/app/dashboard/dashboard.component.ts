import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserService, User } from '../services/admin-user.service';
import { ReportService, Report } from '../services/report.service';
import { PostService } from '../services/post.service';
import { ToastService } from '../services/toast.service';
import { ConfirmationService } from '../services/confirmation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], // Removed RouterOutlet as we are using a single view now
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private adminUserService = inject(AdminUserService);
  private reportService = inject(ReportService);
  private postService = inject(PostService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  reports = signal<Report[]>([]);
  isLoading = signal(false);

  // 'hub' | 'users' | 'reports'
  currentView = 'hub';

  ngOnInit() {
    this.loadData();
  }

  setView(view: string) {
    this.currentView = view;
  }

  loadData() {
    this.isLoading.set(true);
    // Load Users
    this.adminUserService.getAllUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (e) => {
        console.error('Failed to load users', e);
        this.toastService.show('Failed to load users', 'error');
      }
    });

    // Load Reports
    this.reportService.getAllReports().subscribe({
      next: (data) => this.reports.set(data),
      error: (e) => {
        console.error('Failed to load reports', e);
        this.toastService.show('Failed to load reports', 'error');
      },
      complete: () => this.isLoading.set(false)
    });
  }

  banUser(userId: number) {
    if (userId === 1) {
      this.toastService.show("Cannot ban the Super Admin.", 'error');
      return;
    }

    this.confirmationService.confirm('Ban this user?', 'Ban User').subscribe(confirmed => {
      if (confirmed) {
        this.adminUserService.toggleBan(userId).subscribe({
          next: () => {
            this.users.update(list => list.map(u => u.id === userId ? { ...u, banned: true } : u));
            this.toastService.show('User banned successfully', 'success');
          },
          error: (e) => this.toastService.show('Failed to ban user: ' + e.message, 'error')
        });
      }
    });
  }

  unbanUser(userId: number) {
    this.confirmationService.confirm('Unban this user?', 'Unban User').subscribe(confirmed => {
      if (confirmed) {
        this.adminUserService.toggleBan(userId).subscribe({
          next: () => {
            this.users.update(list => list.map(u => u.id === userId ? { ...u, banned: false } : u));
            this.toastService.show('User unbanned successfully', 'success');
          },
          error: (e) => this.toastService.show('Failed to unban user: ' + e.message, 'error')
        });
      }
    });
  }

  promoteUser(userId: number) {
    this.confirmationService.confirm('Promote this user to ADMIN?', 'Promote User').subscribe(confirmed => {
      if (confirmed) {
        this.adminUserService.updateUserRole(userId, 'ADMIN').subscribe({
          next: () => {
            this.users.update(list => list.map(u => u.id === userId ? { ...u, role: 'ADMIN' } : u));
            this.toastService.show('User promoted to ADMIN', 'success');
          },
          error: (e) => this.toastService.show('Failed to promote user: ' + (e.error?.message || e.message), 'error')
        });
      }
    });
  }

  demoteUser(userId: number) {
    if (userId === 1) {
      this.toastService.show("Cannot demote the Super Admin.", 'error');
      return;
    }

    this.confirmationService.confirm('Demote this user to USER?', 'Demote User').subscribe(confirmed => {
      if (confirmed) {
        this.adminUserService.demoteUser(userId).subscribe({
          next: () => {
            this.users.update(list => list.map(u => u.id === userId ? { ...u, role: 'USER' } : u));
            this.toastService.show('User demoted to USER', 'success');
          },
          error: (e) => this.toastService.show('Failed to demote user: ' + e.message, 'error')
        });
      }
    });
  }

  dismissReport(reportId: number) {
    this.confirmationService.confirm('Dismiss this report?', 'Dismiss Report').subscribe(confirmed => {
      if (confirmed) {
        this.reportService.deleteReport(reportId).subscribe({
          next: () => {
            this.reports.update(list => list.filter(r => r.id !== reportId));
            this.toastService.show('Report dismissed', 'success');
          },
          error: (e) => this.toastService.show('Failed to dismiss report', 'error')
        });
      }
    });
  }

  deleteReportedPost(postId: number, reportId: number) {
    this.confirmationService.confirm('Delete this post and resolve report?', 'Delete Post').subscribe(confirmed => {
      if (confirmed) {
        // First delete post
        this.postService.deletePost(postId).subscribe({
          next: () => {
            // Then delete the report (or backend might do it via cascade, but safe to remove from UI)
            this.reportService.deleteReport(reportId).subscribe(() => {
              this.reports.update(list => list.filter(r => r.id !== reportId));
              this.toastService.show('Post deleted and report resolved.', 'success');
            });
          },
          error: (e) => this.toastService.show('Failed to delete post: ' + e.message, 'error')
        });
      }
    });
  }
}