import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserService, User } from '../services/admin-user.service';
import { ReportService, Report } from '../services/report.service';
import { PostService } from '../services/post.service';

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
      error: (e) => console.error('Failed to load users', e)
    });

    // Load Reports
    this.reportService.getAllReports().subscribe({
      next: (data) => this.reports.set(data),
      error: (e) => console.error('Failed to load reports', e),
      complete: () => this.isLoading.set(false)
    });
  }

  banUser(userId: number) {
    if (!confirm('Ban this user?')) return;
    this.adminUserService.toggleBan(userId).subscribe(() => {
      this.users.update(list => list.map(u => u.id === userId ? { ...u, isBanned: true } : u));
    });
  }

  unbanUser(userId: number) {
    if (!confirm('Unban this user?')) return;
    this.adminUserService.toggleBan(userId).subscribe(() => {
      this.users.update(list => list.map(u => u.id === userId ? { ...u, isBanned: false } : u));
    });
  }

  dismissReport(reportId: number) {
    if (!confirm('Dismiss this report?')) return;
    this.reportService.deleteReport(reportId).subscribe(() => {
      this.reports.update(list => list.filter(r => r.id !== reportId));
    });
  }

  deleteReportedPost(postId: number, reportId: number) {
    if (!confirm('Delete this post and resolve report?')) return;

    // First delete post
    this.postService.deletePost(postId).subscribe({
      next: () => {
        // Then delete the report (or backend might do it via cascade, but safe to remove from UI)
        this.reportService.deleteReport(reportId).subscribe(() => {
          this.reports.update(list => list.filter(r => r.id !== reportId));
          alert('Post deleted and report resolved.');
        });
      },
      error: (e) => alert('Failed to delete post: ' + e.message)
    });
  }
}