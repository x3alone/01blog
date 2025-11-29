import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PostService, Post } from '../services/post.service';
import { AuthService } from '../services/auth.service';
import { MakePostFormComponent } from '../posts/make-post-form.component';
import { RouterLink } from '@angular/router'; // Import RouterLink for the "New Post" button

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatePipe, MakePostFormComponent, RouterLink], // Use common modules and post component
  template: `
    <div class="space-y-8">
        @if (!loggedIn()) {
             <div class="bg-gray-800 rounded-xl p-6 text-center border border-gray-700 shadow-xl">
                 <p class="text-lg text-gray-400">
                    <a [routerLink]="['/login']" class="text-indigo-400 hover:text-indigo-300 font-bold">Log in</a> or 
                    <a [routerLink]="['/register']" class="text-indigo-400 hover:text-indigo-300 font-bold">register</a> to share your own thoughts!
                 </p>
             </div>
        } @else {
            <div class="bg-gray-800 rounded-xl p-6 text-center border border-gray-700 shadow-xl">
                <p class="text-lg text-gray-400">
                    Feeling inspired? <a [routerLink]="['/post/new']" class="text-indigo-400 hover:text-indigo-300 font-bold">Create a new post!</a>
                </p>
            </div>
        }

        <section>
          <h2 class="text-2xl font-semibold text-gray-100 mb-6 border-b border-gray-700 pb-2">Latest Posts</h2>
          
          @if (posts().length > 0) {
            <div class="grid gap-6">
              @for (post of posts(); track post.id) {
                <div class="post-card bg-gray-800 rounded-xl shadow-xl p-5 border border-gray-700 transition duration-300 ease-in-out hover:shadow-indigo-500/20">
                                    <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-indigo-400">{{ post.title }}</h3>
                    <span class="text-xs text-gray-500">
                      {{ post.createdAt | date: 'mediumDate' }}
                    </span>
                  </div>
                  
                                    <p class="text-gray-300 mb-4 whitespace-pre-wrap">{{ post.content }}</p>
                  
                                    <div class="text-sm font-medium text-right border-t border-gray-700 pt-3">
                    <span class="text-gray-500">Author:</span>
                    <span class="text-indigo-300 ml-1">{{ post.authorName || 'Anonymous' }}</span>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="text-center p-10 bg-gray-800 rounded-xl border border-gray-700">
              <p class="text-gray-400">No posts yet. Be the first to publish!</p>
            </div>
          }
        </section>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);

  posts = signal<Post[]>([]);
  loggedIn = signal(false);

  ngOnInit(): void {
    this.loggedIn.set(this.authService.isAuthenticated());
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts.set(data);
      },
      error: (err) => {
        console.error('Failed to load posts:', err);
      }
    });
  }
  
  // We don't need onPostCreated here, as the new post form is in its own route! 
  // The user will be navigated back to /home after creation. 
}