import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PostService, Post, UpdatePostRequest } from '../services/post.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../services/report.service';
import { CommentService, Comment } from '../services/comment.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FollowService } from '../services/follow.service';
import { ToastService } from '../services/toast.service';
import { ConfirmationService } from '../services/confirmation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private reportService = inject(ReportService);
  public commentService = inject(CommentService);
  private route = inject(ActivatedRoute);
  private followService = inject(FollowService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  posts = signal<Post[]>([]);
  loggedIn = signal(false);
  currentUsername = signal('');
  currentUserId = signal<number | null>(null);

  // ... (keeping existing properties)
  // Post Creation Signals
  newPostTitle = signal('');
  newPostContent = signal('');
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  selectedMediaType: 'image' | 'video' | 'none' = 'none';
  isPosting = signal(false);
  postCreationError = signal<string | null>(null);

  // Edit State
  editingPostId = signal<number | null>(null);
  editTitle = '';
  editContent = '';

  // Report State
  reportModalOpen = signal(false);
  reportingPostId: number | null = null;
  reportReason = 'Inappropriate Content';
  reportDetails = '';
  reportOptions = ['Inappropriate Content', 'Spam', 'Harassment', 'Misinformation', 'Other'];

  // Comment State
  expandedComments = signal<Set<number>>(new Set());
  postComments = signal<Map<number, Comment[]>>(new Map());
  newCommentInputs = signal<Map<number, string>>(new Map());
  commentFiles = signal<Map<number, File>>(new Map());

  ngOnInit() {
    this.checkLoginStatus();

    // Always load posts on init
    this.loadPosts();

    this.route.queryParams.subscribe(params => {
      if (params['refresh']) {
        this.loadPosts();
      }
    });
  }

  // ... (keeping existing methods)

  checkLoginStatus() {
    if (this.authService.isAuthenticated()) {
      this.loggedIn.set(true);
      this.currentUsername.set(this.authService.getUsername() || '');
    } else {
      this.loggedIn.set(false);
      this.currentUsername.set('');
    }
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        // Sort newest first
        this.posts.set(data.sort((a, b) => b.id - a.id));
      },
      error: (e: any) => console.error('Failed to load posts', e)
    });
  }

  // --- POST CREATION ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedMediaType = file.type.startsWith('video') ? 'video' : 'image';

      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviewUrl = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  createPost() {
    this.postCreationError.set(null);

    // 1. Validate Content (No empty or whitespace only)
    if (!this.newPostTitle() || !this.newPostContent() || !this.newPostContent().trim()) {
      this.postCreationError.set("Post title and content are required.");
      return;
    }

    // 2. Validate File Type (Media only)
    if (this.selectedFile) {
      const type = this.selectedFile.type;
      if (!type.startsWith('image/') && !type.startsWith('video/') && !type.startsWith('audio/')) {
        this.postCreationError.set("Only image, video, or audio files are allowed.");
        return;
      }
    }

    this.isPosting.set(true);

    this.postService.createPost(
      this.newPostTitle(),
      this.newPostContent(),
      this.selectedFile || null
    ).subscribe({
      next: () => {
        this.newPostTitle.set('');
        this.newPostContent.set('');
        this.selectedFile = null;
        this.imagePreviewUrl = null;
        this.loadPosts();
        this.isPosting.set(false);
        this.toastService.show("Post created successfully.", 'success');
      },
      error: (e: any) => {
        console.error('Create post failed', e);
        this.isPosting.set(false);
        this.toastService.show("Failed to create post.", 'error');
      }
    });
  }

  // --- POST ACTIONS ---
  deletePost(id: number) {
    this.confirmationService.confirm('Are you sure you want to delete this post?', 'Delete Post')
      .subscribe(confirmed => {
        if (confirmed) {
          this.postService.deletePost(id).subscribe({
            next: () => {
              this.posts.update(p => p.filter(post => post.id !== id));
              this.toastService.show("Post deleted.", 'success');
            },
            error: () => this.toastService.show("Failed to delete post.", 'error')
          });
        }
      });
  }

  startEdit(post: Post) {
    this.editingPostId.set(post.id);
    this.editTitle = post.title;
    this.editContent = post.content;
  }

  cancelEdit() {
    this.editingPostId.set(null);
  }

  saveEdit(id: number) {
    if (!id) return;

    const update: UpdatePostRequest = { title: this.editTitle, content: this.editContent };
    this.postService.updatePost(id, update).subscribe(() => {
      this.posts.update(list => list.map(p => p.id === id ? { ...p, title: this.editTitle, content: this.editContent } : p));
      this.editingPostId.set(null);
      this.toastService.show("Post updated.", 'success');
    });
  }

  followUser(post: Post) {
    console.log('Follow clicked on home', post.username);
  }

  // --- PERMISSIONS ---
  canDelete(post: Post): boolean {
    const currentId = this.authService.getCurrentUserId();
    if (!currentId) return false;
    const isAdmin = this.authService.isAdmin(); // Assuming AuthService has isAdmin() or check role
    return post.userId === currentId || isAdmin;
  }

  canEdit(post: Post): boolean {
    const currentId = this.authService.getCurrentUserId();
    return currentId !== null && post.userId === currentId;
  }

  canDeleteComment(comment: Comment): boolean {
    const role = this.authService.getUserRole();
    const currentUsername = this.currentUsername();
    // Admin or Owner can delete
    return role === 'ADMIN' || (currentUsername !== '' && comment.username === currentUsername);
  }

  canEditComment(comment: Comment): boolean {
    const currentUsername = this.currentUsername();
    // Only Owner can edit
    return currentUsername !== '' && comment.username === currentUsername;
  }

  // --- REPORTS ---
  openReportModal(post: Post) {
    this.reportingPostId = post.id;
    this.reportModalOpen.set(true);
  }

  closeReportModal() {
    this.reportModalOpen.set(false);
    this.reportingPostId = null;
    this.reportDetails = '';
  }

  submitReport() {
    if (this.reportingPostId) {
      this.reportService.createReport(this.reportingPostId, this.reportReason, this.reportDetails).subscribe({
        next: () => {
          this.toastService.show("Report submitted.", 'success');
          this.closeReportModal();
        },
        error: () => this.toastService.show("Failed to submit report.", 'error')
      });
    }
  }

  // --- COMMENTS ---
  isCommentsExpanded(postId: number): boolean {
    return this.expandedComments().has(postId);
  }

  toggleComments(postId: number) {
    const set = this.expandedComments();
    if (set.has(postId)) {
      set.delete(postId);
    } else {
      set.add(postId);
      if (!this.postComments().has(postId)) {
        this.loadComments(postId);
      }
    }
    // trigger signal update
    this.expandedComments.set(new Set(set));
  }

  loadComments(postId: number) {
    this.commentService.getComments(postId).subscribe({
      next: (data: Comment[]) => {
        this.postComments.update(map => {
          map.set(postId, data);
          return new Map(map);
        });
      },
      error: (e: any) => console.error(e)
    });
  }

  getCommentsForPost(postId: number): Comment[] {
    return this.postComments().get(postId) || [];
  }

  updateCommentInput(postId: number, event: any) {
    this.newCommentInputs.update(map => {
      map.set(postId, event.target.value);
      return new Map(map);
    });
  }

  onCommentFileSelected(postId: number, event: any) {
    const file = event.target.files[0];
    if (file) {
      this.commentFiles.update(map => {
        map.set(postId, file);
        return new Map(map);
      });
    }
  }

  addComment(postId: number) {
    const content = this.newCommentInputs().get(postId);
    if (!content) return;

    const file = this.commentFiles().get(postId) || null;

    this.commentService.addComment(postId, content, file).subscribe({
      next: (newComment: Comment) => {
        this.postComments.update(map => {
          const list = map.get(postId) || [];
          list.push(newComment);
          map.set(postId, list);
          return new Map(map);
        });
        // Clear input
        this.newCommentInputs.update(map => { map.set(postId, ''); return new Map(map); });
        this.commentFiles.update(map => { map.delete(postId); return new Map(map); });
      },
      error: (e: any) => console.error('Failed to add comment', e)
    });
  }

  // --- COMMENT ACTIONS ---
  deleteComment(postId: number, commentId: number) {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.postComments.update(map => {
          let list = map.get(postId) || [];
          list = list.filter(c => c.id !== commentId);
          map.set(postId, list);
          return new Map(map);
        });
      },
      error: (e: any) => console.error(e)
    });
  }

  // Map helper methods for template
  getNewCommentInput(postId: number) {
    return this.newCommentInputs().get(postId) || '';
  }
}