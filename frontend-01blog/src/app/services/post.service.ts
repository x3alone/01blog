import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// --- Data Models ---
export interface Post {
    id: number; //  Changed to 'number' to match Java Long/ID type 
    title: string;
    content: string;
    userId: number;
    username: string;
    mediaUrl: string;
    mediaType: string;
    createdAt: string;

    avatarUrl?: string;
    hidden?: boolean;
    likeCount: number;
    likedByCurrentUser: boolean;
}

export interface CreatePostRequest {
    title: string;
    content: string;
}

// NEW DTO for edit
export interface UpdatePostRequest {
    title: string;
    content: string;
}

export interface Page<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class PostService {
    private http = inject(HttpClient);

    private readonly API_URL = 'http://localhost:8080/api/posts';

    private getAuthHeaders() {
        const token = localStorage.getItem('01blog_auth_token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    }

    // --- API Implementation ---

    getAllPosts(page: number, size: number): Observable<Page<Post>> {
        return this.http.get<Page<Post>>(`${this.API_URL}?page=${page}&size=${size}`).pipe(
            catchError(err => {
                // console.error('Error fetching posts:', err);
                return throwError(() => new Error('Failed to load posts from server.'));
            })
        );
    }

    getPostsByUserId(userId: number, page: number, size: number): Observable<Page<Post>> {
        return this.http.get<Page<Post>>(`${this.API_URL}/user/${userId}?page=${page}&size=${size}`).pipe(
            catchError(err => {
                // console.error(`Error fetching posts for user ${userId}:`, err);
                return throwError(() => new Error('Failed to load user posts from server.'));
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

    // Update Post Method
    updatePost(id: number, title: string, content: string, file?: File, removeMedia?: boolean): Observable<Post> {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        if (file) {
            formData.append('file', file);
        }
        if (removeMedia) {
            formData.append('removeMedia', 'true');
        }
        return this.http.put<Post>(`${this.API_URL}/${id}`, formData, this.getAuthHeaders()).pipe(
            catchError(err => {
                // console.error(`Error updating post ${id}:`, err);
                // The backend will return 403 Forbidden if the user is not the author/admin
                return throwError(() => new Error(err.error?.message || `Failed to update post. Status: ${err.status}`));
            })
        );
    }

    //  Delete Post Method
    deletePost(id: number): Observable<void> {
        const headers = this.getAuthHeaders();
        // Backend returns HTTP 204 No Content for a successful delete (type void)
        return this.http.delete<void>(`${this.API_URL}/${id}`, headers).pipe(
            catchError(err => {
                // console.error(`Error deleting post ${id}:`, err);
                // The backend will return 403 Forbidden if the user is not the author/admin
                return throwError(() => new Error(err.error?.message || `Failed to delete post. Status: ${err.status}`));
            })
        );
    }

    toggleHide(id: number): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/${id}/hide`, {}, this.getAuthHeaders()).pipe(
            catchError(err => {
                // console.error(`Error toggling hide for post ${id}:`, err);
                return throwError(() => new Error('Failed to toggle visibility'));
            })
        );
    }

    toggleLike(id: number): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/${id}/like`, {}, this.getAuthHeaders());
    }
}