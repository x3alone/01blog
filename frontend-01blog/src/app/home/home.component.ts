import { Component, OnInit, inject, signal, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { PostService, Post, UpdatePostRequest, Page } from '../services/post.service';
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
export class HomeComponent implements OnInit, AfterViewInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private reportService = inject(ReportService);
  public commentService = inject(CommentService);
  private route = inject(ActivatedRoute);
  private followService = inject(FollowService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = signal(false);

  @ViewChild('sentinel') sentinel!: ElementRef;

  posts = signal<Post[]>([]);
  currentPage = 0;
  pageSize = 10;
  hasMore = signal(true);
  isLoading = signal(false);
  loggedIn = signal(false);
  currentUsername = signal('');
  currentUserId = signal<number | null>(null);

  // ... (keeping existing properties)
  // Post Creation Signals
  newPostTitle = signal('');
  newPostContent = signal('');
  selectedFile: File | null = null;
  imagePreviewUrl = signal<string | null>(null); // Signal for instant preview
  selectedMediaType: 'image' | 'video' | 'none' = 'none';
  isPosting = signal(false);
  postCreationError = signal<string | null>(null);

  // Edit State
  editingPostId = signal<number | null>(null);
  editTitle = '';
  editContent = '';
  editFile: File | null = null;
  editFilePreview: string | null = null;
  removeMediaFlag = false;

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
  commentPreviews = signal<Map<number, string | null>>(new Map());
  isCommenting = signal<Map<number, boolean>>(new Map());

  ngOnInit() {
    this.checkLoginStatus();

    // Always load posts on init
    // Load posts
    this.loadPosts(true);

    this.route.queryParams.subscribe(params => {
      if (params['refresh']) {
        this.loadPosts(true);
      }
    });
  }

  // ... (keeping existing methods)

  checkLoginStatus() {
    if (this.authService.isAuthenticated()) {
      this.loggedIn.set(true);
      this.currentUsername.set(this.authService.getUsername() || '');
      this.currentUserId.set(this.authService.getCurrentUserId());
    } else {
      this.loggedIn.set(false);
      this.currentUsername.set('');
      this.currentUserId.set(null);
    }
  }

  canDelete(post: Post): boolean {
    const uid = this.currentUserId();
    if (!uid) return false;
    return post.userId === uid || this.authService.getUserRole() === 'ADMIN';
  }

  canEdit(post: Post): boolean {
    const uid = this.currentUserId();
    if (!uid) return false;
    return post.userId === uid;
  }

  startEdit(post: Post) {
    this.editingPostId.set(post.id);
    this.editTitle = post.title;
    this.editContent = post.content;
    this.editFile = null;
    this.editFilePreview = null; // Reset new file preview
    this.removeMediaFlag = false;
  }

  cancelEdit() {
    this.editingPostId.set(null);
    this.editTitle = '';
    this.editContent = '';
    this.editFile = null;
    this.editFilePreview = null;
    this.removeMediaFlag = false;
  }

  onEditFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.editFile = file;
      this.removeMediaFlag = false; // logic: if uploading new, we are replacing, so technically removing old is handled by backend replace logic

      const reader = new FileReader();
      reader.onload = (e) => {
        this.editFilePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  flagRemoveMedia() {
    this.removeMediaFlag = true;
    this.editFile = null;
    this.editFilePreview = null;
  }

  saveEdit(postId: number) {
    if (!this.editTitle.trim() || !this.editContent.trim()) {
      this.toastService.show("Title and content cannot be empty", "error");
      return;
    }

    this.postService.updatePost(postId, this.editTitle, this.editContent, this.editFile || undefined, this.removeMediaFlag).subscribe({
      next: (updatedPost) => {
        this.posts.update(posts => posts.map(p => p.id === postId ? updatedPost : p));
        this.cancelEdit();
        this.toastService.show("Post updated", "success");
      },
      error: (e) => this.toastService.show("Failed to update post", "error")
    });
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  toggleHide(post: Post) {
    this.postService.toggleHide(post.id).subscribe({
      next: () => {
        const newStatus = !post.hidden;
        this.posts.update(posts => posts.map(p => p.id === post.id ? { ...p, hidden: newStatus } : p));
        const msg = newStatus ? "Post is now hidden" : "Post is now visible";
        this.toastService.show(msg, "success");
      },
      error: () => this.toastService.show("Failed to toggle visibility", "error")
    });
  }

  deletePost(postId: number) {
    this.confirmationService.confirm("Are you sure you want to delete this post?", "Delete Post").subscribe(confirmed => {
      if (confirmed) {
        this.postService.deletePost(postId).subscribe({
          next: () => {
            this.posts.update(posts => posts.filter(p => p.id !== postId));
            this.toastService.show("Post deleted", "success");
          },
          error: (e) => this.toastService.show("Failed to delete post", "error")
        });
      }
    });
  }

  openReportModal(post: Post) {
    this.reportingPostId = post.id;
    this.reportModalOpen.set(true);
  }

  closeReportModal() {
    this.reportModalOpen.set(false);
    this.reportingPostId = null;
    this.reportReason = 'Inappropriate Content';
    this.reportDetails = '';
  }

  submitReport() {
    if (!this.reportingPostId) return;

    this.reportService.createReport(this.reportingPostId, this.reportReason, this.reportDetails).subscribe({
      next: () => {
        this.closeReportModal();
        this.toastService.show("Report submitted", "success");
      },
      error: (e) => this.toastService.show("Failed to submit report", "error")
    });
  }

  loadPosts(reset = false) {
    if (this.isLoading() || (!reset && !this.hasMore())) return;

    this.isLoading.set(true);
    if (reset) {
      this.currentPage = 0;
      this.hasMore.set(true);
      // Optional: Clear posts immediately or wait for response? 
      // If we clear, user sees flicker. If we don't, we replace.
    }

    this.postService.getAllPosts(this.currentPage, this.pageSize).subscribe({
      next: (page: Page<Post>) => {
        if (reset) {
          this.posts.set(page.content); // Use set to replace
        } else {
          this.posts.update(current => [...current, ...page.content]); // Append
        }

        // Check if last page
        this.hasMore.set(!page.last);
        this.currentPage++;
        this.isLoading.set(false);

        // Re-attach observers after DOM update
        if (this.isBrowser()) {
          setTimeout(() => {
            this.setupScrollObserver();
          }, 100);
        }
      },
      error: (e: any) => {
        console.error('Failed to load posts', e);
        this.isLoading.set(false);
      }
    });
  }

  ngAfterViewInit() {
    this.isBrowser.set(isPlatformBrowser(this.platformId));
    if (this.isBrowser()) {
      this.setupSentinel();
      this.setupScrollObserver();
    }
  }

  setupSentinel() {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && this.hasMore() && !this.isLoading()) {
        this.loadPosts(false);
      }
    }, { rootMargin: '100px' });

    if (this.sentinel) {
      observer.observe(this.sentinel.nativeElement);
    }
  }

  setupScrollObserver() {
    if (!this.isBrowser()) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          // Keep the "re-animate on scroll down" logic requested by user
          // "if i scroll down ... animation" usually implies re-triggering when re-entering viewport
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el));
  }

  // --- POST CREATION ---
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedMediaType = file.type.startsWith('video') ? 'video' : 'image';

      const reader = new FileReader();
      reader.onload = (e: any) => this.imagePreviewUrl.set(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  // Spam Protection
  lastPostTime = 0;
  lastCommentTime = 0;

  // ... (keeping existing methods)

  createPost() {
    this.postCreationError.set(null);

    // 0. Cooldown Check (10 seconds)
    const now = Date.now();
    if (now - this.lastPostTime < 10000) {
      this.postCreationError.set("Please wait 10s.");
      return;
    }

    // 1. Validate Content (No empty or whitespace only)
    if (!this.newPostTitle().trim()) {
      this.postCreationError.set("Title is required");
      return;
    }
    if (!this.newPostContent().trim()) {
      this.postCreationError.set("Post content is required.");
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
        this.lastPostTime = Date.now(); // Update cooldown timestamp
        this.newPostTitle.set('');
        this.newPostContent.set('');
        this.selectedFile = null;
        this.imagePreviewUrl.set(null);
        this.loadPosts(true);
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

  toggleComments(postId: number) {
    const expanded = this.expandedComments();
    if (expanded.has(postId)) {
      expanded.delete(postId);
      this.expandedComments.set(new Set(expanded));
    } else {
      expanded.add(postId);
      this.expandedComments.set(new Set(expanded));
      this.loadComments(postId);
    }
  }

  isCommentsExpanded(postId: number): boolean {
    return this.expandedComments().has(postId);
  }

  loadComments(postId: number) {
    this.commentService.getComments(postId).subscribe({
      next: (comments) => {
        this.postComments.update(map => {
          map.set(postId, comments);
          return new Map(map);
        });
      }
    });
  }

  getCommentsForPost(postId: number): Comment[] {
    return this.postComments().get(postId) || [];
  }

  updateCommentInput(postId: number, event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.newCommentInputs.update(map => {
      map.set(postId, val);
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
      // Generate Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.commentPreviews.update(map => {
          map.set(postId, e.target?.result as string);
          return new Map(map);
        });
      };
      reader.readAsDataURL(file);
    }
  }

  clearCommentFile(postId: number) {
    this.commentFiles.update(map => {
      map.delete(postId);
      return new Map(map);
    });
    this.commentPreviews.update(map => {
      map.delete(postId);
      return new Map(map);
    });
  }

  getCommentPreview(postId: number): string | null {
    return this.commentPreviews().get(postId) || null;
  }

  canDeleteComment(comment: Comment): boolean {
    const uid = this.currentUserId();
    if (!uid) return false;
    return comment.userId === uid || this.authService.getUserRole() === 'ADMIN';
  }

  addComment(postId: number) {
    const content = this.newCommentInputs().get(postId);
    if (!content) return;

    // Loading State Start
    this.isCommenting.update(map => { map.set(postId, true); return new Map(map); });

    const file = this.commentFiles().get(postId) || null;

    this.commentService.addComment(postId, content, file).subscribe({
      next: (newComment: Comment) => {
        this.lastCommentTime = Date.now(); // Update timestamp
        this.postComments.update(map => {
          const list = map.get(postId) || [];
          list.push(newComment);
          map.set(postId, list);
          return new Map(map);
        });
        // Clear input and files
        this.newCommentInputs.update(map => { map.set(postId, ''); return new Map(map); });
        this.newCommentInputs.update(map => { map.set(postId, ''); return new Map(map); });
        this.commentFiles.update(map => { map.delete(postId); return new Map(map); });
        this.commentPreviews.update(map => { map.delete(postId); return new Map(map); });

        // Loading State End
        this.isCommenting.update(map => { map.set(postId, false); return new Map(map); });
      },
      error: (e: any) => {
        // console.error('Failed to add comment', e);
        this.toastService.show("Failed to add comment", "error");
        // Loading State End
        this.isCommenting.update(map => { map.set(postId, false); return new Map(map); });
      }
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
      error: (e: any) => this.toastService.show("Failed to delete comment", "error")

    });
  }

  // Map helper methods for template
  getNewCommentInput(postId: number) {
    return this.newCommentInputs().get(postId) || '';
  }

  isPostCommenting(postId: number): boolean {
    return this.isCommenting().get(postId) || false;
  }
}