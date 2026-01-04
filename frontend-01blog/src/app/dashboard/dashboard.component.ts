import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserService, User } from '../services/admin-user.service';
import { ReportService, Report } from '../services/report.service';
import { PostService, Post } from '../services/post.service';
import { ToastService } from '../services/toast.service';
import { ConfirmationService } from '../services/confirmation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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
  posts = signal<Post[]>([]);
  isLoading = signal(false);

  // 'hub' | 'users' | 'reports' | 'posts'
  currentView = 'hub';

  ngOnInit() {
    this.loadData();
  }

  setView(view: string) {
    this.currentView = view;
    if (view !== 'hub') {
      this.loadData();
    }
  }

  loadData() {
    this.isLoading.set(true);

    if (this.currentView === 'users') {
      this.adminUserService.getAllUsers().subscribe({
        next: (data) => {
          this.users.set(data);
          this.isLoading.set(false);
        },
        error: (e) => {
          console.error('Failed to load users', e);
          this.toastService.show('Failed to load users', 'error');
          this.isLoading.set(false);
        }
      });
    } else if (this.currentView === 'reports') {
      this.reportService.getAllReports().subscribe({
        next: (data: any) => {
          if (Array.isArray(data)) {
            this.reports.set(data);
          } else {
            // Handle potential '200 OK' error response
            this.reports.set([]);
            if (data && data.status) {
              this.toastService.show('Failed to load reports: ' + (data.message || 'Error ' + data.status), 'error');
            }
          }
          this.isLoading.set(false);
        },
        error: (e) => {
          console.error('Failed to load reports', e);
          this.toastService.show('Failed to load reports', 'error');
          this.isLoading.set(false);
        }
      });
    } else if (this.currentView === 'posts') {
      // Fetch all posts (page 0, size 100 for admin overview for now)
      this.postService.getAllPosts(0, 50).subscribe({
        next: (page) => {
          this.posts.set(page.content);
          this.isLoading.set(false);
        },
        error: (e) => {
          console.error('Failed to load posts', e);
          this.toastService.show('Failed to load posts', 'error');
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
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

  /* --- LIGHTBOX --- */
  selectedMediaUrl: string | null = null;
  selectedMediaType: 'image' | 'video' | 'none' | string | null = null; // matching types loosely
  isLightboxOpen = false;

  openLightbox(url: string, type: string) {
    if (!url) return;
    this.selectedMediaUrl = url;
    this.selectedMediaType = type;
    this.isLightboxOpen = true;
  }

  closeLightbox() {
    this.isLightboxOpen = false;
    this.selectedMediaUrl = null;
    this.selectedMediaType = null;
  }

  /* --- POST MANAGEMENT --- */
  togglePostVisibility(post: Post) {
    this.postService.toggleHide(post.id).subscribe({
      next: () => {
        this.posts.update(list => list.map(p => p.id === post.id ? { ...p, hidden: !p.hidden } : p));
        this.toastService.show(`Post ${post.hidden ? 'visible' : 'hidden'} now.`, 'success');
      },
      error: (e) => this.toastService.show('Failed to toggle visibility', 'error')
    });
  }

  adminDeletePost(postId: number) {
    this.confirmationService.confirm('Permanently delete this post?', 'Delete Post').subscribe(confirmed => {
      if (confirmed) {
        this.postService.deletePost(postId).subscribe({
          next: () => {
            this.posts.update(list => list.filter(p => p.id !== postId));
            this.toastService.show('Post deleted successfully', 'success');
          },
          error: (e) => this.toastService.show('Failed to delete post', 'error')
        });
      }
    });
  }
}