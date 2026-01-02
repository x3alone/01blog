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
  // Assuming a new admin endpoint for listing all users: /api/admin/users
  private apiUrl = '/api/users';

  // --- API CALLS ---

  getAllUsers(): Observable<User[]> {
    // You must ensure your Spring Boot UserController has a GET /api/users endpoint
    // that returns List<User> and is protected by @PreAuthorize("hasRole('ADMIN')").
    return this.http.get<User[]>(`${this.apiUrl}/all`); // Assuming /api/users/all
  }

  updateUserRole(userId: number, newRole: 'USER' | 'ADMIN'): Observable<void> {
    // Maps to your @PutMapping("/{id}/promote") or potentially a demote endpoint
    const endpoint = newRole === 'ADMIN' ? 'promote' : 'demote';
    //  Your current backend only has 'promote'. You should add a 'demote' endpoint 
    // or adjust the UserService to handle setting the role explicitly. 
    // For now, we only call 'promote'.
    return this.http.put<void>(`${this.apiUrl}/${userId}/promote`, {});
  }

  demoteUser(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/demote`, {});
  }

  toggleBan(userId: number): Observable<void> {
    // Maps to your @PutMapping("/{id}/ban") which toggles the status
    return this.http.put<void>(`${this.apiUrl}/${userId}/ban`, {});
  }
}