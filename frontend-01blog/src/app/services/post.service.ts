import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// --- Data Models ---
export interface Post {
    id: number; // NOTE: Changed to 'number' to match Java Long/ID type better
    title: string;
    content: string;
    userId: number; // NEW FIELD
    username: string;
    mediaUrl: string;
    mediaType: string;
    createdAt: string;
}

export interface CreatePostRequest {
    title: string;
    content: string;
}

// NEW DTO for Updates
export interface UpdatePostRequest {
    title: string;
    content: string;
}

@Injectable({
    providedIn: 'root',
})
export class PostService {
    private http = inject(HttpClient);

    private readonly API_URL = 'http://localhost:8080/api/posts';

    // NOTE: Removed unnecessary console.warn and simplified headers
    private getAuthHeaders() {
        const token = localStorage.getItem('01blog_auth_token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    }

    // --- API Implementation ---

    getAllPosts(): Observable<Post[]> {
        return this.http.get<Post[]>(this.API_URL).pipe(
            catchError(err => {
                console.error('Error fetching posts:', err);
                return throwError(() => new Error('Failed to load posts from server.'));
            })
        );
    }

    createPost(title: string, content: string, file: File | null): Observable<Post> {
        const headers = this.getAuthHeaders();
        //this for text + media uploads

        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (file) {
            formData.append('file', file);
        }

        return this.http.post<Post>(this.API_URL, formData, headers);
    }

    // NEW: Update Post Method
    updatePost(id: number, request: UpdatePostRequest): Observable<Post> {
        const headers = this.getAuthHeaders();
        return this.http.put<Post>(`${this.API_URL}/${id}`, request, headers).pipe(
            catchError(err => {
                console.error(`Error updating post ${id}:`, err);
                // The backend will return 403 Forbidden if the user is not the author/admin
                return throwError(() => new Error(err.error?.message || `Failed to update post. Status: ${err.status}`));
            })
        );
    }

    // NEW: Delete Post Method
    deletePost(id: number): Observable<void> {
        const headers = this.getAuthHeaders();
        // Backend returns HTTP 204 No Content for a successful delete (type void)
        return this.http.delete<void>(`${this.API_URL}/${id}`, headers).pipe(
            catchError(err => {
                console.error(`Error deleting post ${id}:`, err);
                // The backend will return 403 Forbidden if the user is not the author/admin
                return throwError(() => new Error(err.error?.message || `Failed to delete post. Status: ${err.status}`));
            })
        );
    }
}