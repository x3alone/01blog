import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FollowService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8080/api/follows';

    private getAuthHeaders() {
        const token = localStorage.getItem('01blog_auth_token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    }

    followUser(userId: number): Observable<void> {
        return this.http.post<void>(`${this.API_URL}/${userId}`, {}, this.getAuthHeaders());
    }

    unfollowUser(userId: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${userId}`, this.getAuthHeaders());
    }

    isFollowing(userId: number): Observable<{ isFollowing: boolean }> {
        return this.http.get<{ isFollowing: boolean }>(`${this.API_URL}/${userId}/check`, this.getAuthHeaders());
    }
}
