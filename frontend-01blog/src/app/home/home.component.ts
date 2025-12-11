import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PostService, Post, UpdatePostRequest } from '../services/post.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../services/report.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private reportService = inject(ReportService);

  posts = signal<Post[]>([]);
  loggedIn = signal(false);
  currentUsername = signal('');
  currentUserRole = signal('');

  newPostTitle = '';
  newPostContent = '';

  editingPostId = signal<number | null>(null);
  editTitle = '';
  editContent = '';

  // Report Modal State
  reportModalOpen = signal(false);
  reportingPostId: number | null = null;
  reportReason = 'Inappropriate Content'; // Default
  reportDetails = '';
  reportOptions = [
    'Inappropriate Content',
    'Harmful or Dangerous',
    'Hate Speech',
    'Scam or Fraud',
    'Other'
  ];

  ngOnInit() {
    this.checkAuth();
    this.loadPosts();
  }

  checkAuth() {
    this.loggedIn.set(this.authService.isAuthenticated());
    if (this.loggedIn()) {
      const u = localStorage.getItem('01blog_last_user');
      this.currentUsername.set(u || '');
      this.currentUserRole.set(this.authService.getUserRole() || '');
    }
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data) => this.posts.set(data),
      error: (e) => console.error(e)
    });
  }

  createPost() {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim()) return;

    const postData = { title: this.newPostTitle.trim(), content: this.newPostContent.trim() };

    this.postService.createPost(postData).subscribe({
      next: () => {
        this.newPostTitle = '';
        this.newPostContent = '';
        this.loadPosts();
      },
      error: (e) => alert("Failed to post: " + e.message)
    });
  }

  // Updated to allow Admins or Authors
  canDelete(post: Post): boolean {
    return this.currentUsername() === post.username || this.currentUserRole() === 'ADMIN';
  }

  deletePost(id: number) {
    if (confirm("Delete this post?")) {
      this.postService.deletePost(id).subscribe(() => {
        this.loadPosts();
      });
    }
  }

  startEdit(post: Post) {
    this.editingPostId.set(post.id);
    this.editTitle = post.title;
    this.editContent = post.content;
  }

  cancelEdit() {
    this.editingPostId.set(null);
  }

  submitEdit() {
    const id = this.editingPostId();
    if (!id) return;

    const req: UpdatePostRequest = { title: this.editTitle, content: this.editContent };
    this.postService.updatePost(id, req).subscribe({
      next: () => {
        this.loadPosts();
        this.cancelEdit();
      }
    });
  }

  // --- Report Logic ---

  openReportModal(post: Post) {
    this.reportingPostId = post.id;
    this.reportReason = 'Inappropriate Content';
    this.reportDetails = '';
    this.reportModalOpen.set(true);
  }

  closeReportModal() {
    this.reportModalOpen.set(false);
    this.reportingPostId = null;
  }

  submitReport() {
    if (!this.reportingPostId) return;

    this.reportService.createReport(this.reportingPostId, this.reportReason, this.reportDetails)
      .subscribe({
        next: () => {
          alert("Report submitted successfully.");
          this.closeReportModal();
        },
        error: (e) => {
          alert("Failed to submit report: " + (e.error?.message || e.message));
        }
      });
  }
}