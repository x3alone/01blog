import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PostService, Post, UpdatePostRequest } from '../services/post.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { CommentService, Comment } from '../services/comment.service';

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
  private commentService = inject(CommentService);

  posts = signal<Post[]>([]);
  loggedIn = signal(false);
  currentUsername = signal('');
  currentUserRole = signal('');

  // Report state
  reportModalOpen = signal(false);
  reportingPostId: number | null = null;
  reportReason = 'Inappropriate Content';
  reportDetails = '';
  reportOptions = [
    'Inappropriate Content',
    'Spam',
    'Harassment',
    'Misinformation',
    'Other'
  ];

  // Comment state
  expandedComments = signal<Set<number>>(new Set());
  postComments = signal<Map<number, Comment[]>>(new Map());
  newCommentInputs = signal<Map<number, string>>(new Map());
  commentFiles = signal<Map<number, File>>(new Map());

  newPostTitle = '';
  newPostContent = '';

  // --- NEW FILE UPLOAD STATE ---
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  isPosting = signal(false); // NEW: Prevent double post

  // Edit state
  editingPostId = signal<number | null>(null);
  editTitle = '';
  editContent = '';

  ngOnInit() {
    this.loggedIn.set(this.authService.isAuthenticated()); // Using isAuthenticated() which returns boolean
    this.currentUsername.set(this.authService.getUsername() || ''); // Handle null
    this.currentUserRole.set(this.authService.getUserRole() || ''); // Handle null
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (posts) => this.posts.set(posts),
      error: (e) => console.error('Error loading posts', e)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreviewUrl = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  // --- CREATE POST WITH FILE ---
  createPost() {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim() || this.isPosting()) return;

    this.isPosting.set(true);

    this.postService
      .createPost(this.newPostTitle.trim(), this.newPostContent.trim(), this.selectedFile)
      .subscribe({
        next: () => {
          this.newPostTitle = '';
          this.newPostContent = '';
          this.selectedFile = null;
          this.imagePreviewUrl = null;
          this.isPosting.set(false);
          this.loadPosts();
        },
        error: (e) => {
          alert('Failed to post: ' + e.message);
          this.isPosting.set(false);
        }
      });
  }

  // Permissions
  canDelete(post: Post): boolean {
    return this.currentUsername() === post.username || this.currentUserRole() === 'ADMIN';
  }

  deletePost(id: number) {
    if (confirm('Delete this post?')) {
      this.postService.deletePost(id).subscribe(() => this.loadPosts());
    }
  }

  // Editing
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

    const req: UpdatePostRequest = {
      title: this.editTitle,
      content: this.editContent
    };

    this.postService.updatePost(id, req).subscribe({
      next: () => {
        this.loadPosts();
        this.cancelEdit();
      }
    });
  }

  // Report modal
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

    this.reportService.createReport(
      this.reportingPostId,
      this.reportReason,
      this.reportDetails
    ).subscribe({
      next: () => {
        alert('Report submitted successfully.');
        this.closeReportModal();
      },
      error: (e) => alert('Failed to submit report: ' + (e.error?.message || e.message))
    });
  }

  // Comments
  toggleComments(postId: number) {
    const expanded = new Set(this.expandedComments());
    if (expanded.has(postId)) {
      expanded.delete(postId);
    } else {
      expanded.add(postId);
      this.loadComments(postId);
    }
    this.expandedComments.set(expanded);
  }

  isCommentsExpanded(postId: number): boolean {
    return this.expandedComments().has(postId);
  }

  loadComments(postId: number) {
    this.commentService.getComments(postId).subscribe({
      next: (comments) => {
        const map = new Map(this.postComments());
        map.set(postId, comments);
        this.postComments.set(map);
      },
      error: (e) => console.error('Failed to load comments', e)
    });
  }

  getCommentsForPost(postId: number): Comment[] {
    return this.postComments().get(postId) || [];
  }

  getNewCommentInput(postId: number): string {
    return this.newCommentInputs().get(postId) || '';
  }

  updateNewCommentInput(postId: number, value: string) {
    const map = new Map(this.newCommentInputs());
    map.set(postId, value);
    this.newCommentInputs.set(map);
  }

  // NEW: Handle comment file selection
  onCommentFileSelected(event: any, postId: number) {
    const file = event.target.files[0];
    if (file) {
      const map = new Map(this.commentFiles());
      map.set(postId, file);
      this.commentFiles.set(map);
    }
  }

  getCommentFile(postId: number): File | undefined {
    return this.commentFiles().get(postId);
  }

  // Helper to allow removing the selected file
  removeCommentFile(postId: number) {
    const map = new Map(this.commentFiles());
    map.delete(postId);
    this.commentFiles.set(map);
  }

  submitComment(postId: number) {
    const content = this.getNewCommentInput(postId);
    const file = this.getCommentFile(postId) || null;

    // Must have either content or file
    if (!content.trim() && !file) return;

    this.commentService.addComment(postId, content, file).subscribe({
      next: (comment) => {
        const map = new Map(this.postComments());
        const list = map.get(postId) || [];
        map.set(postId, [...list, comment]);
        this.postComments.set(map);

        // Reset input and file
        this.updateNewCommentInput(postId, '');
        this.removeCommentFile(postId); // Clear file
      },
      error: (e) => alert('Failed to add comment: ' + e.message)
    });
  }

  deleteComment(postId: number, commentId: number) {
    if (confirm('Delete this comment?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          const map = new Map(this.postComments());
          const list = map.get(postId) || [];
          map.set(postId, list.filter(c => c.id !== commentId));
          this.postComments.set(map);
        },
        error: (e) => alert('Failed to delete comment: ' + e.message)
      });
    }
  }
}
