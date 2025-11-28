import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; 
import { Router, RouterModule } from '@angular/router'; // Added RouterModule
import { AuthService } from '../services/auth.service';
import { PostService, Post } from '../services/post.service'; 
import { MakePostFormComponent} from '../posts/make-post-form.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, MakePostFormComponent], 
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'] 
})
export class HomeComponent implements OnInit { 
  private auth = inject(AuthService);
  private router = inject(Router);
  private postService = inject(PostService); 

  // Placeholder user (will likely come from AuthService in the future)
  currentUser = 'Blogger Max'; 

  posts = signal<Post[]>([]); 
  isLoading = signal(true); 
  loadError = signal<string | null>(null);

  ngOnInit(): void {
    // Start fetching posts and listening to real-time changes
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading.set(true);
    this.loadError.set(null);

    // Subscribe to the real-time stream of posts from the service
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        // Reverse the data so newest posts appear at the top
        this.posts.set(data.reverse()); 
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load posts:', err);
        // Ensure the error message is clear about the backend requirement
        this.loadError.set('Failed to load articles. Please ensure the backend is running and you are logged in.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Handler for the (postCreated) output event from the post form.
   * Forces a refresh of the post feed.
   */
  onPostCreated(): void {
    console.log('Post creation successful. Refreshing feed...');
    this.loadPosts();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']); // Fixed path to start with /
  }

  // Placeholder methods for future features
  viewPostDetails(postId: string) { 
    console.log(`Viewing post ${postId}`);
    // Future: this.router.navigate(['/posts', postId]);
  }
}