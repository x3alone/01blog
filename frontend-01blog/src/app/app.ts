import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { PostService, Post } from './services/post.service';
import { AuthService } from './services/auth.service';
import { MakePostFormComponent } from './posts/make-post-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // Combined all required imports: CommonModule, HTTP client, Forms, DatePipe, and the child component
  imports: [CommonModule, HttpClientModule, FormsModule, MakePostFormComponent, DatePipe],
  // Inline Template: Contains the entire application structure (Auth UI + Feed + Post Form)
  template: `
    <div class="min-h-screen bg-gray-900 text-white font-inter">
      <!-- Navbar/Header -->
      <header class="bg-gray-800 shadow-md sticky top-0 z-10">
        <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-3xl font-bold text-indigo-400">{{ title() }}</h1>
          
          <!-- Auth Status & Actions -->
          <div class="flex items-center space-x-4">
            @if (loggedIn()) {
              <!-- Logged In UI -->
              <span class="text-sm font-medium text-gray-300 hidden sm:inline">
                Welcome, {{ currentUsername() }}!
              </span>
              <button
                (click)="logout()"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition duration-300"
              >
                Logout
              </button>
            } @else {
              <!-- Logged Out/Login UI -->
              <form (ngSubmit)="login()" class="flex space-x-2">
                <input
                  type="text"
                  [(ngModel)]="username"
                  name="username"
                  placeholder="Username"
                  required
                  class="p-2 w-24 sm:w-36 bg-gray-700 border border-gray-600 rounded-lg text-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="Password"
                  required
                  class="p-2 w-24 sm:w-36 bg-gray-700 border border-gray-600 rounded-lg text-sm placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition duration-300 text-sm"
                >
                  Login
                </button>
              </form>
              <button
                (click)="register()"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg shadow-md transition duration-300 text-sm hidden sm:inline"
              >
                Register
              </button>
            }
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <!-- Post Creation Form (Only visible when logged in) -->
        @if (loggedIn()) {
          <!-- Listen for the postCreated event and call the loadPosts method to refresh the feed -->
          <app-make-post-form (postCreated)="onPostCreated()"></app-make-post-form>
        } @else {
          <div class="bg-gray-800 rounded-xl p-6 text-center border border-gray-700 shadow-xl">
            <p class="text-lg text-gray-400">Log in or register to share your own thoughts!</p>
          </div>
        }

        <!-- Post Feed Section -->
        <section>
          <h2 class="text-2xl font-semibold text-gray-100 mb-6 border-b border-gray-700 pb-2">Latest Posts</h2>
          
          <!-- Post List -->
          @if (posts().length > 0) {
            <div class="grid gap-6">
              @for (post of posts(); track post.id) {
                <div class="post-card bg-gray-800 rounded-xl shadow-xl p-5 border border-gray-700 transition duration-300 ease-in-out hover:shadow-indigo-500/20">
                  <!-- Post Header -->
                  <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-indigo-400">{{ post.title }}</h3>
                    <span class="text-xs text-gray-500">
                      {{ post.createdAt | date: 'mediumDate' }}
                    </span>
                  </div>
                  
                  <!-- Post Body -->
                  <p class="text-gray-300 mb-4 whitespace-pre-wrap">{{ post.content }}</p>
                  
                  <!-- Post Footer (Author) -->
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
      </main>
    </div>
  `,
  // Basic styling for the hover effect
  styles: [`
    .post-card:hover {
      transform: translateY(-2px);
    }
  `]
})
export class AppComponent implements OnInit {
  // Service Injections
  private authService = inject(AuthService);
  private postService = inject(PostService);

  // State Management
  title = signal('MicroBlog Central');
  username = '';
  password = '';
  loggedIn = signal(false);

  // State for the currently logged-in user and posts
  currentUsername = signal('');
  posts = signal<Post[]>([]);

  ngOnInit(): void {
    this.checkAuthStatus();
    // Load posts initially, regardless of login status
    this.loadPosts();
  }

  /**
   * Checks local storage for a token and updates the loggedIn signal.
   * Also attempts to derive or set the current username.
   */
  checkAuthStatus() {
    this.loggedIn.set(this.authService.isAuthenticated());

    if (this.loggedIn()) {
      // For this simple demo, we rely on the last successful login name saved in local storage
      const lastUsername = localStorage.getItem('microblog_last_user');
      this.currentUsername.set(lastUsername || 'Authenticated User');
    } else {
      this.currentUsername.set('');
    }
  }

  /**
   * Fetches all posts from the PostService and updates the posts signal.
   */
  loadPosts() {
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        // Assume the service returns posts newest first
        this.posts.set(data);
      },
      error: (err) => {
        console.error('Failed to load posts:', err);
      }
    });
  }

  /**
   * Handler for the (postCreated) output event from the MakePostFormComponent.
   * Reloads the entire list of posts to show the new one.
   */
  onPostCreated(): void {
    this.loadPosts();
  }

  register() {
    this.authService.register({ username: this.username, password: this.password }).subscribe({
      next: () => {
        // Log in automatically after successful registration for a smoother UX
        this.login();
        console.log('Registration successful.');
      },
      error: (err) => {
        console.error('Registration failed:', err);
        // In a real app, show a message box here
      }
    });
  }

  login() {
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (token) => {
        this.loggedIn.set(true);
        this.currentUsername.set(this.username);
        localStorage.setItem('microblog_last_user', this.username);
        this.username = '';
        this.password = '';
        this.loadPosts(); // Refresh posts after login
      },
      error: (err) => {
        console.error('Login failed:', err);
        // In a real app, show a message box here
      }
    });
  }

  logout() {
    this.authService.logout();
    this.loggedIn.set(false);
    this.currentUsername.set('');
    localStorage.removeItem('microblog_last_user');
    this.loadPosts(); // Refresh posts after logout
  }
}