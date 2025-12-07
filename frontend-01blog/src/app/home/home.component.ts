import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PostService, Post, UpdatePostRequest } from '../services/post.service';
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  templateUrl: './home.component.html', // Now pointing to the separate HTML file
  styleUrl: './home.component.scss'     // Now pointing to the separate SCSS file
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);

  posts = signal<Post[]>([]);
  loggedIn = signal(false);
  currentUsername = signal('');

  newPostTitle = '';
  newPostContent = '';

  editingPostId = signal<number | null>(null);
  editTitle = '';
  editContent = '';

  ngOnInit() {
    this.checkAuth();
    this.loadPosts();
  }

  checkAuth() {
    this.loggedIn.set(this.authService.isAuthenticated());
    if (this.loggedIn()) {
      const u = localStorage.getItem('01blog_last_user');
      this.currentUsername.set(u || '');
    }
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data) => this.posts.set(data),
      error: (e) => console.error(e)
    });
  }

  createPost() {
    if(!this.newPostTitle.trim() || !this.newPostContent.trim()) return;
    
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

  deletePost(id: number) {
    if(confirm("Delete this post?")) {
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
}