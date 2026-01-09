import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Matching the User model in your Spring Boot backend
export interface User {
  id: number;
  username: string;
  role: string;
  banned: boolean; // Add banned status
  avatarUrl?: string; // Add avatarUrl
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  updateUserRole(userId: number, newRole: 'USER' | 'ADMIN'): Observable<void> {
    // Maps to @PutMapping("/{id}/promote")  
    const endpoint = newRole === 'ADMIN' ? 'promote' : 'demote';
    return this.http.put<void>(`${this.apiUrl}/${userId}/${endpoint}`, {});
  }

  demoteUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/demote`, {});
  }

  toggleBan(userId: number): Observable<void> {
    // Maps to your @PutMapping("/{id}/ban") which toggles the status
    return this.http.put<void>(`${this.apiUrl}/${userId}/ban`, {});
  }
}