import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';

// --- Data Models ---
export interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string; // The username who created the post
  createdAt: string; // ISO date string
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

// Simulated in-memory database of posts
const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'Welcome to MicroBlog!',
    content: 'This is the first post on our new platform. Feel free to log in and start sharing your own thoughts and ideas with the world!',
    authorName: 'Admin',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'p2',
    title: 'Angular Signals are Awesome',
    content: 'I\'ve been refactoring my state management using Angular Signals and the simplicity is incredible. No more manual subscriptions!',
    authorName: 'Coder_Max',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
];

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  private posts: Post[] = [...INITIAL_POSTS]; // Start with initial data

  // --- API Simulation ---

  /**
   * Fetches all posts, sorted newest first.
   */
  getAllPosts(): Observable<Post[]> {
    // In a real app, this would be: this.http.get<Post[]>('/api/posts')
    return of(this.posts).pipe(
      map(data => data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    );
  }

  /**
   * Creates a new post.
   * NOTE: This is client-side simulation. In a real app, the username would come from the JWT/AuthService.
   */
  createPost(request: CreatePostRequest): Observable<Post> {
    const token = localStorage.getItem('microblog_auth_token');
    const authorName = localStorage.getItem('microblog_last_user') || 'Unknown Author';

    if (!token) {
        return new Observable(observer => {
            observer.error({ message: 'Authentication required to post.' });
        });
    }

    // Simulate backend delay
    return of(null).pipe(
      map(() => {
        const newPost: Post = {
          id: crypto.randomUUID(),
          title: request.title,
          content: request.content,
          authorName: authorName,
          createdAt: new Date().toISOString(),
        };
        this.posts.push(newPost);
        return newPost;
      })
    );
  }
}