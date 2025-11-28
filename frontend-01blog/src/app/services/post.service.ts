import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define the base URL for the backend API
const API_BASE_URL = '/api';
const POSTS_URL = `${API_BASE_URL}/posts`;

// --- Data Models ---
// Note: The structure should match the response from your FastAPI /posts endpoint
export interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string; // The username who created the post (provided by the backend)
  createdAt: string; // ISO date string (provided by the backend)
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

  /**
   * Helper to retrieve and format the Authorization header.
   * @returns An object containing the Authorization header.
   */
  private getAuthHeaders() {
    const token = localStorage.getItem('microblog_auth_token');
    if (!token) {
      throw new Error('Authentication token not found. Cannot create post.');
    }
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  // --- API Implementation ---

  /**
   * Fetches all posts from the backend, sorted newest first by the API.
   * @returns An Observable of the array of Post objects.
   */
  getAllPosts(): Observable<Post[]> {
    // Uses the actual HttpClient to fetch data from the backend
    return this.http.get<Post[]>(POSTS_URL).pipe(
      catchError(err => {
        console.error('Error fetching posts:', err);
        // Return an empty array or re-throw based on application needs
        return throwError(() => new Error('Failed to load posts from server.'));
      })
    );
  }

  /**
   * Creates a new post by sending the request body and the JWT token to the backend.
   * The backend validates the token and extracts the author's username.
   * @param request The title and content of the new post.
   * @returns An Observable of the newly created Post object.
   */
  createPost(request: CreatePostRequest): Observable<Post> {
    try {
      const headers = this.getAuthHeaders();
      
      // Uses the actual HttpClient to post data to the backend
      return this.http.post<Post>(POSTS_URL, request, headers).pipe(
        catchError(err => {
          console.error('Error creating post:', err);
          // Assuming 401/403 errors are handled by the auth flow
          return throwError(() => new Error(err.error?.detail || 'Failed to create post. Check console for details.'));
        })
      );
    } catch (e) {
      // Handle the case where the token is missing
      return throwError(() => e);
    }
  }
}