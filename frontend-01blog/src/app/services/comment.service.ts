import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';

export interface Comment {
    id: number;
    content: string;
    username: string;
    createdAt: string;
    mediaUrl?: string;
    mediaType?: string;
    avatarUrl?: string;
    userId: number;
}

export interface CreateCommentRequest {
    content: string;
    postId: number;
}

@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8080/api/comments';

    private getAuthHeaders() {
        const token = localStorage.getItem('01blog_auth_token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    }

    getComments(postId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.API_URL}/post/${postId}`);
    }

    addComment(postId: number, content: string, file: File | null): Observable<Comment> {
        const headers = this.getAuthHeaders();
        const formData = new FormData();
        formData.append('content', content);
        formData.append('postId', postId.toString());
        if (file) {
            formData.append('file', file);
        }

        return this.http.post<Comment>(this.API_URL, formData, headers);
    }

    deleteComment(id: number): Observable<void> {
        const headers = this.getAuthHeaders();
        return this.http.delete<void>(`${this.API_URL}/${id}`, headers);
    }
}
