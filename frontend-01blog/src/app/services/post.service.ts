import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// --- Data Models ---
export interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);

  // FIX 1: Point to the Backend Port (8080), not the Frontend Port (4200)
  private readonly API_URL = 'http://localhost:8080/api/posts';

  private getAuthHeaders() {
    const token = localStorage.getItem('microblog_auth_token');
    // Note: Since we are in permitAll mode, we don't strictly need this throw, 
    // but it's good practice to keep it for when security is enabled.
    if (!token) {
      console.warn('No auth token found, but attempting request anyway (PermitAll mode)');
      return {}; 
    }
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  // --- API Implementation ---

  getAllPosts(): Observable<Post[]> {
    // FIX 2: Use the variable API_URL (http://localhost:8080/api/posts)
    // This matches the @GetMapping in the controller
    return this.http.get<Post[]>(this.API_URL).pipe(
      catchError(err => {
        console.error('Error fetching posts:', err);
        return throwError(() => new Error('Failed to load posts from server.'));
      })
    );
  }

  createPost(request: CreatePostRequest): Observable<Post> {
    const headers = this.getAuthHeaders();
    
    // FIX 3: Send POST to http://localhost:8080/api/posts
    // (I removed '/get' to match standard REST conventions, see Controller below)
    return this.http.post<Post>(this.API_URL, request, headers).pipe(
      catchError(err => {
        console.error('Error creating post:', err);
        return throwError(() => new Error(err.error?.detail || 'Failed to create post.'));
      })
    );
  }
}