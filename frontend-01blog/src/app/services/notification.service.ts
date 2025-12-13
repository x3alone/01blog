import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BlogNotification {
    id: number;
    message: string;
    type: string;
    relatedId: number;
    read: boolean;
    createdAt: string;
    actor?: {
        username: string;
        id: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8080/api/notifications';

    private getAuthHeaders() {
        const token = localStorage.getItem('01blog_auth_token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    }

    getNotifications(): Observable<BlogNotification[]> {
        return this.http.get<BlogNotification[]>(this.API_URL, this.getAuthHeaders());
    }

    getUnreadCount(): Observable<number> {
        return this.http.get<number>(`${this.API_URL}/unread-count`, this.getAuthHeaders());
    }

    markAllAsRead(): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/read-all`, {}, this.getAuthHeaders());
    }

    markAsRead(id: number): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/${id}/read`, {}, this.getAuthHeaders());
    }
}
