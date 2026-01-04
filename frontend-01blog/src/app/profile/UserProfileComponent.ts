import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { UserProfileService, UserProfileDto } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';
import { PostService, Post } from '../services/post.service'; // Import PostService
import { ReportService } from '../services/report.service';
import { ToastService } from '../services/toast.service';
import { CommentService, Comment } from '../services/comment.service';
import { ConfirmationService } from '../services/confirmation.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterModule],
  templateUrl: './user-profile.component.html', // Pointing to the separate HTML file
  styleUrl: './user-profile.component.scss'     // Pointing to the separate SCSS file
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private postService = inject(PostService); // Inject PostService
  private reportService = inject(ReportService);
  private toastService = inject(ToastService);
  private commentService = inject(CommentService);
  private confirmationService = inject(ConfirmationService);

  profile = signal<UserProfileDto | null>(null);
  posts = signal<Post[]>([]); // Store user posts here
  isLoading = signal(true);
  isOwnProfile = signal(false);

  isEditing = signal(false);
  editForm = signal({ aboutMe: '', avatarUrl: '' });

  // Post Edit State
  editingPostId = signal<number | null>(null);
  editTitle = '';
  editContent = '';
  editFile: File | null = null;
  editFilePreview: string | null = null;
  removeMediaFlag = false;

  // Constants
  readonly MAX_TITLE_LENGTH = 100;
  readonly MAX_CONTENT_LENGTH = 3000;
  readonly MAX_COMMENT_LENGTH = 1000;

  // Comment State
  expandedComments = signal<Set<number>>(new Set());
  postComments = signal<Map<number, Comment[]>>(new Map());
  newCommentInputs = signal<Map<number, string>>(new Map());
  commentFiles = signal<Map<number, File>>(new Map());
  commentPreviews = signal<Map<number, string | null>>(new Map());
  isCommenting = signal<Map<number, boolean>>(new Map());
  lastCommentTime = 0;
  likingPosts = new Set<number>();

  // Report State
  reportModalOpen = signal(false);
  reportReason = 'Scammer';
  customReportReason = '';
  reportDetails = '';
  reportingPostId: number | null = null;
  reportOptions = ['Scammer', 'Spreading Hate', 'Impersonation', 'Bot', 'Other'];
  postReportOptions = ['Inappropriate Content', 'Spam', 'Harassment', 'Misinformation', 'Other'];

  // Helper signals for template
  currentUser = signal<string>('');

  ngOnInit() {
    const username = this.authService.getUsername();
    this.currentUser.set(username || '');

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const userId = Number(idParam);

      if (!idParam || isNaN(userId)) {
        this.router.navigate(['/error'], { queryParams: { code: '404' } });
        return;
      }

      if (userId) {
        this.loadProfile(userId);
        this.loadUserPosts(userId);
      }
    });
  }

  loadProfile(userId: number) {
    this.isLoading.set(true);
    this.profileService.getProfile(userId).subscribe({
      next: (data: any) => { // Use 'any' to check for custom status field
        if (data && data.status === 404) {
             this.router.navigate(['/error'], { queryParams: { code: '404' } });
             return;
        }

        this.profile.set(data);
        this.isLoading.set(false);
        this.checkIfOwnProfile(data.username);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 404) {
           this.router.navigate(['/error'], { queryParams: { code: '404' } });
        }
      }
    });
  }

  loadUserPosts(userId: number) {
    this.postService.getPostsByUserId(userId, 0, 100).subscribe({
      next: (page: any) => { // using any to avoid import issues or strict typing on Page interface here if not imported
        this.posts.set(page.content);
      },
      error: (err) => {
        // console.error('Failed to load posts', err) 
      }
    });
  }

  checkIfOwnProfile(profileUsername: string) {
    const currentUsername = this.authService.getUsername();
    this.isOwnProfile.set(currentUsername === profileUsername);
  }

  // Template Helpers
  profileId() {
    return this.profile()?.id;
  }

  isFollowing(): boolean {
    return this.profile()?.isFollowedByCurrentUser ?? false;
  }

  toggleFollow() {
    const p = this.profile();
    if (!p) return;

    if (p.isFollowedByCurrentUser) {
      // Logic for Unfollow
      this.profileService.unfollowUser(p.id).subscribe(() => {
        // Optimistically update UI
        this.profile.update(curr => curr ? {
          ...curr,
          isFollowedByCurrentUser: false,
          followersCount: curr.followersCount - 1
        } : null);
      });
    } else {
      // Logic for Follow
      this.profileService.followUser(p.id).subscribe(() => {
        // Optimistically update UI
        this.profile.update(curr => curr ? {
          ...curr,
          isFollowedByCurrentUser: true,
          followersCount: curr.followersCount + 1
        } : null);
      });
    }
  }


  startEdit() {
    const p = this.profile();
    if (p) {
      this.editForm.set({
        aboutMe: p.aboutMe || '',
        avatarUrl: p.avatarUrl || ''
      });
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  saveEdit() {
    if (this.editForm().aboutMe && this.editForm().aboutMe.length > 500) {
      // You might need to inject ToastService to show this error, or use alert for now if ToastService isn't injected.
      // Looking at imports, ToastService isn't injected. I'll stick to console/alert or just return for now, 
      // but ideally I should add ToastService.
      // Let's add simple alert or just return if it's too long, as requested "prevent that". 
      // User requested "prevent that", so blocking submission is key.
      this.toastService.show("About Me is too long! Max 500 characters.", 'error');
      return;
    }

    this.profileService.updateProfile(this.editForm()).subscribe({
      next: (updatedUser: any) => { // Backend returns User
        const newAvatarUrl = this.editForm().avatarUrl;

        this.profile.update(curr => curr ? {
          ...curr,
          aboutMe: this.editForm().aboutMe,
          avatarUrl: newAvatarUrl
        } : null);

        // Update local persistence if this is the own profile
        if (this.isOwnProfile()) {
          this.authService.updateCurrentUser(newAvatarUrl);
        }

        this.isEditing.set(false);
      },
      error: (err) => {
        // console.error('Failed to update profile', err)
        this.toastService.show("Failed to update profile", 'error');
      }
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastService.show("Only image files are allowed for avatars.", 'error');
        return;
      }
      this.profileService.uploadAvatar(file).subscribe({
        next: (res: any) => {
          const url = res.secure_url || res.url;
          this.editForm.update(curr => ({ ...curr, avatarUrl: url }));
        },
        error: (err) => {
          // console.error('Avatar upload failed', err)
          this.toastService.show("Avatar upload failed", 'error');
        }
      });
    }
  }
  // --- POST ACTIONS (Edit, Delete, Like) ---

  canEditPost(post: Post): boolean {
    const uid = this.authService.getCurrentUserId();
    if (!uid) return false;
    return post.userId === uid;
  }

  canDeletePost(post: Post): boolean {
    const uid = this.authService.getCurrentUserId();
    if (!uid) return false;
    return post.userId === uid || this.authService.getUserRole() === 'ADMIN';
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  startEditPost(post: Post) {
    this.editingPostId.set(post.id);
    this.editTitle = post.title;
    this.editContent = post.content;
    this.editFile = null;
    this.editFilePreview = null;
    this.removeMediaFlag = false;
  }

  cancelEditPost() {
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
      this.removeMediaFlag = false;
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

  saveEditPost(postId: number) {
    if (!this.editTitle.trim() || !this.editContent.trim()) {
      this.toastService.show("Title and content cannot be empty", "error");
      return;
    }
    if (this.editTitle.length > this.MAX_TITLE_LENGTH) {
      this.toastService.show(`Title is too long! (${this.editTitle.length}/${this.MAX_TITLE_LENGTH})`, 'error');
      return;
    }
    if (this.editContent.length > this.MAX_CONTENT_LENGTH) {
      this.toastService.show(`Content is too long! (${this.editContent.length}/${this.MAX_CONTENT_LENGTH})`, 'error');
      return;
    }

    this.postService.updatePost(postId, this.editTitle, this.editContent, this.editFile || undefined, this.removeMediaFlag).subscribe({
      next: (updatedPost) => {
        this.posts.update(posts => posts.map(p => p.id === postId ? updatedPost : p));
        this.cancelEditPost();
        this.toastService.show("Post updated", "success");
      },
      error: (e) => this.toastService.show("Failed to update post", "error")
    });
  }

  deletePost(postId: number) {
    this.confirmationService.confirm("Are you sure you want to delete this post?", "Delete Post").subscribe(confirmed => {
      if (confirmed) {
        this.postService.deletePost(postId).subscribe({
          next: () => {
            this.posts.update(posts => posts.filter(p => p.id !== postId));
            this.toastService.show("Post deleted", "success");
            // Also update thoughts count
            this.profile.update(p => p ? { ...p, postsCount: (p as any).postsCount ? (p as any).postsCount - 1 : this.posts().length } : null);
          },
          error: (e) => this.toastService.show("Failed to delete post", "error")
        });
      }
    });
  }

  toggleLike(post: Post) {
    if (this.likingPosts.has(post.id)) return;
    this.likingPosts.add(post.id);

    // Optimistic Update
    const wasLiked = post.likedByCurrentUser;
    const newLikeStatus = !wasLiked;
    const newCount = wasLiked ? post.likeCount - 1 : post.likeCount + 1;

    this.posts.update(posts => posts.map(p =>
      p.id === post.id
        ? { ...p, likedByCurrentUser: newLikeStatus, likeCount: newCount }
        : p
    ));

    this.postService.toggleLike(post.id).subscribe({
      next: () => {
        this.likingPosts.delete(post.id);
      },
      error: () => {
        // Revert
        this.likingPosts.delete(post.id);
        this.posts.update(posts => posts.map(p =>
          p.id === post.id
            ? { ...p, likedByCurrentUser: wasLiked, likeCount: post.likeCount }
            : p
        ));
        this.toastService.show("Failed to update like", "error");
      }
    });
  }

  toggleHide(post: Post) {
    this.confirmationService.confirm("Are you sure you want to hide/reveal this post?", "Hide Post").subscribe(confirmed => {
      if (confirmed) {
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
    });
  }

  // --- COMMENTS ---

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

  getNewCommentInput(postId: number) {
    return this.newCommentInputs().get(postId) || '';
  }

  isPostCommenting(postId: number): boolean {
    return this.isCommenting().get(postId) || false;
  }

  onCommentFileSelected(postId: number, event: any) {
    const file = event.target.files[0];
    if (file) {
      this.commentFiles.update(map => {
        map.set(postId, file);
        return new Map(map);
      });
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
    const uid = this.authService.getCurrentUserId();
    if (!uid) return false;
    return comment.userId === uid || this.authService.getUserRole() === 'ADMIN';
  }

  addComment(postId: number) {
    let content = this.newCommentInputs().get(postId);
    if (!content) return;
    content = content.trim();

    if (!content) {
      this.toastService.show("Comment cannot be empty.", "error");
      return;
    }
    if (content.length > this.MAX_COMMENT_LENGTH) {
      this.toastService.show(`Comment too long! (${content.length}/${this.MAX_COMMENT_LENGTH})`, 'error');
      return;
    }

    this.isCommenting.update(map => { map.set(postId, true); return new Map(map); });
    const file = this.commentFiles().get(postId) || null;

    this.commentService.addComment(postId, content, file).subscribe({
      next: (newComment: Comment) => {
        this.lastCommentTime = Date.now();
        this.postComments.update(map => {
          const list = map.get(postId) || [];
          list.push(newComment);
          map.set(postId, list);
          return new Map(map);
        });
        this.newCommentInputs.update(map => { map.set(postId, ''); return new Map(map); });
        this.commentFiles.update(map => { map.delete(postId); return new Map(map); });
        this.commentPreviews.update(map => { map.delete(postId); return new Map(map); });

        this.isCommenting.update(map => { map.set(postId, false); return new Map(map); });
      },
      error: (e: any) => {
        this.toastService.show("Failed to add comment", "error");
        this.isCommenting.update(map => { map.set(postId, false); return new Map(map); });
      }
    });
  }

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


  // --- REPORTING ---

  openReportModal(post?: Post | null, userReport = false) { // Combined handler
    this.reportModalOpen.set(true);
    if (userReport && this.profile()) {
      // User report setup
      this.reportingPostId = null;
    } else if (post) {
      this.reportingPostId = post.id;
    }
  }

  closeReportModal() {
    this.reportModalOpen.set(false);
    this.reportReason = 'Inappropriate Content'; // Default
    this.customReportReason = '';
    this.reportDetails = '';
    this.reportingPostId = null;
  }

  submitReport() {
    if (this.reportingPostId) {
      // Report Post
      this.reportService.createReport(this.reportingPostId, this.reportReason, this.reportDetails).subscribe({
        next: (res: any) => {
          this.closeReportModal();
          this.toastService.show("Report submitted", "success");
        },
        error: (e) => this.toastService.show("Failed to submit report", "error")
      });
    } else {
      // Report User (existing logic)
      const p = this.profile();
      if (!p) return;

      let finalReason = this.reportReason;
      if (this.reportReason === 'Other') {
        if (!this.customReportReason.trim()) {
          this.toastService.show("Please specify a reason.", "error");
          return;
        }
        finalReason = this.customReportReason;
      }

      this.reportService.reportUser(p.id, finalReason, this.reportDetails).subscribe({
        next: (res: any) => {
          if (res && res.status && res.status !== 200) {
            if (res.status === 409 || res.status === 500) {
              this.toastService.show("User already reported or conflict occurred.", "error");
            } else if (res.message) {
              this.toastService.show(res.message, "error");
            } else {
              this.toastService.show("Failed to report user.", "error");
            }
            return;
          }

          this.closeReportModal();
          this.toastService.show("User reported successfully.", "success");
        },
        error: (e) => {
          if (e.status === 409 || e.status === 500) {
            this.toastService.show("User already reported or conflict occurred.", "error");
          } else if (e.error && e.error.message) {
            this.toastService.show(e.error.message, "error");
          } else {
            this.toastService.show("Failed to report user.", "error");
          }
        }
      });
    }
  }
}