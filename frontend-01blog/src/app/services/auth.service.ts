// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api';
  private tokenKey = 'jwtToken';

  constructor(private http: HttpClient) {}

  /** Register a new user */
  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { username, password });
  }

  /** Login user and store JWT */
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { username, password })
      .pipe(
        tap(res => {
          if (res.token) localStorage.setItem(this.tokenKey, res.token);
        })
      );
  }

  /** Logout user */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /** Check if user is logged in */
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /** Get JWT token */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
