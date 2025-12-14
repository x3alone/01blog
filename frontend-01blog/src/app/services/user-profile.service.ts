import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfileDto {
  id: number;
  username: string;
  role: string;
  followersCount: number;
  followingCount: number;
  isFollowedByCurrentUser: boolean;
  // You mentioned an 'about' section, but it wasn't in your Java DTO provided.
  // I will add a placeholder field for now.
  about?: string;
  isBanned?: boolean; // You might need to add this to your Java DTO if you want to show it publically
  avatarUrl?: string; // Added avatarUrl
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  getProfile(userId: number): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/users/${userId}`);
  }

  followUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/follows/${userId}`, {});
  }

  unfollowUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/follows/${userId}`);
  }
}