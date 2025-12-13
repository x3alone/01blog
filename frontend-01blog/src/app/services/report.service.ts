import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
    id: number;
    reason: string;
    details: string;
    timestamp: string;

    reporterId: number;
    reporterUsername: string;

    reportedPostId: number;
    reportedPostTitle: string;
    reportedPostContent: string;
    reportedPostAuthorUsername: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private http = inject(HttpClient);
    private readonly API_URL = 'http://localhost:8080/api/reports';

    private getAuthHeaders() {
        const token = localStorage.getItem('01blog_auth_token');
        return {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
    }

    createReport(postId: number, reason: string, details: string): Observable<void> {
        return this.http.post<void>(this.API_URL, { postId, reason, details }, this.getAuthHeaders());
    }

    getAllReports(): Observable<Report[]> {
        return this.http.get<Report[]>(this.API_URL, this.getAuthHeaders());
    }

    deleteReport(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`, this.getAuthHeaders());
    }
}
