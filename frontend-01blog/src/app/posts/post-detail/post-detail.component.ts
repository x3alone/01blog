import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PostService, Post } from '../../services/post.service';
import { CommentService, Comment } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';

@Component({
   selector: 'app-post-detail',
   standalone: true,
   imports: [CommonModule, RouterModule, FormsModule],
   template: `
    <div class="post-detail-container">
      @if (loading()) {
        <div class="loading">Loading post...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (post()) {
         <div class="post-card">
            <!-- Header -->
            <div class="post-header">
                <div class="author-info">
                   <div class="author-avatar" [routerLink]="['/user', post()!.userId]">
                      @if (post()!.avatarUrl) {
                        <img [src]="post()!.avatarUrl" class="avatar-img">
                      } @else {
                        {{ post()!.username ? post()!.username.charAt(0).toUpperCase() : '?' }}
                      }
                   </div>
                   <div class="author-meta">
                      <span class="author-name" [routerLink]="['/user', post()!.userId]">{{ post()!.username }}</span>
                      <span class="post-date">{{ post()!.createdAt | date:'medium' }}</span>
                   </div>
                </div>
            </div>

            <!-- Content -->
            <h1 class="post-title">{{ post()!.title }}</h1>
            <div class="post-content">{{ post()!.content }}</div>

            <!-- Media -->
            @if (post()!.mediaUrl) {
              <div class="post-media">
                 @if (post()!.mediaType === 'video') {
                    <video [src]="post()!.mediaUrl" controls class="media-content"></video>
                 } @else if (post()!.mediaUrl.endsWith('.pdf')) {
                    <div class="pdf-preview" style="text-align: center; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="font-size: 3rem; margin-bottom: 10px;">📄</div>
                        <a [href]="post()!.mediaUrl" target="_blank" download class="download-btn" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                            Download PDF
                        </a>
                    </div>
                 } @else {
                    <img [src]="post()!.mediaUrl" class="media-content">
                 }
              </div>
            }

            <!-- Comments Section (Simplified for now - strictly fetching existing comments) -->
            <div class="comments-section">
               <h3>Comments</h3>
               @if (comments().length === 0) {
                 <p>No comments yet.</p>
               }
               @for (comment of comments(); track comment.id) {
                 <div class="comment-item">
                    <strong>{{ comment.username }}</strong>: {{ comment.content }}
                 </div>
               }
            </div>
         </div>
      }
    </div>
  `,
   styles: [`
    .post-detail-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .loading, .error {
      text-align: center;
      margin-top: 3rem;
      font-size: 1.2rem;
    }
    .error { color: #ef4444; }
    
    /* Reusing some card styles similar to home */
    .post-card {
      background: #1e1e24; /* deep dark */
      border-radius: 12px;
      padding: 24px;
      color: #e0e0e0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    }
    .post-header {
      display: flex;
      margin-bottom: 1.5rem;
    }
    .author-info {
       display: flex;
       align-items: center;
       gap: 12px;
    }
    .author-avatar {
       width: 48px;
       height: 48px;
       border-radius: 50%;
       background: #6366f1;
       color: white;
       display: flex;
       align-items: center;
       justify-content: center;
       font-weight: bold;
       font-size: 1.2rem;
       overflow: hidden;
       cursor: pointer;
    }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .author-meta { display: flex; flex-direction: column; }
    .author-name { font-weight: 600; color: #fff; cursor: pointer; }
    .post-date { font-size: 0.85rem; color: #9ca3af; }

    .post-title { font-size: 2rem; margin-bottom: 1rem; color: #fff; }
    .post-content { font-size: 1.1rem; line-height: 1.6; color: #d1d5db; margin-bottom: 1.5rem; white-space: pre-wrap; }
    
    .post-media {
       margin-bottom: 2rem;
       border-radius: 8px;
       overflow: hidden;
    }
    .media-content { width: 100%; max-height: 600px; object-fit: contain; background: #000; }

    .comments-section {
       border-top: 1px solid #374151;
       padding-top: 1.5rem;
    }
    .comment-item {
       padding: 0.75rem 0;
       border-bottom: 1px solid #2d3748;
    }
  `]
})
export class PostDetailComponent implements OnInit {
   private route = inject(ActivatedRoute);
   private postService = inject(PostService);
   private commentService = inject(CommentService);

   post = signal<Post | null>(null);
   comments = signal<Comment[]>([]);
   loading = signal(true);
   error = signal<string | null>(null);

   ngOnInit() {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (id) {
         this.loadPost(id);
         this.loadComments(id);
      } else {
         this.error.set("Invalid Post ID");
         this.loading.set(false);
      }
   }

   loadPost(id: number) {
      this.postService.getPostById(id).subscribe({
         next: (p) => {
            this.post.set(p);
            this.loading.set(false);
         },
         error: (err) => {
            console.error(err);
            this.error.set("Post not found");
            this.loading.set(false);
         }
      });
   }

   loadComments(id: number) {
      this.commentService.getComments(id).subscribe({
         next: (c) => this.comments.set(c),
         error: (e) => console.error("Failed to load comments", e)
      });
   }
}
