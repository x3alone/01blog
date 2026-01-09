import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface AuthenticationResponse {
  jwtToken: string;
  id: number;
  username: string;
  role: string;
  avatarUrl?: string;
}

const API_BASE_URL = '/api/auth';
const TOKEN_KEY = '01blog_auth_token';
const LAST_USER_KEY = '01blog_last_user';
const AVATAR_KEY = '01blog_user_avatar';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  // Auth state
  private authState = new BehaviorSubject<boolean>(this.isAuthenticated());
  public authState$ = this.authState.asObservable();

  // Ban state
  private bannedState = new BehaviorSubject<boolean>(false);
  public bannedState$ = this.bannedState.asObservable();

  constructor() {}

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
      this.authState.next(true);
      this.clearBanned(); //  Clear ban on successful login
    }
  }

  public getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  public isAuthenticated(): boolean {
    return !!this.getToken() && !this.isBanned();
  }

  // --- BAN LOGIC ---
  setBanned(value: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      if (value) localStorage.setItem('01blog_user_banned', 'true');
      else localStorage.removeItem('01blog_user_banned');
    }
    this.bannedState.next(value);
    this.authState.next(this.isAuthenticated());
  }

  clearBanned() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('01blog_user_banned');
    }
    this.bannedState.next(false);
  }

  isBanned(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('01blog_user_banned') === 'true';
    }
    return this.bannedState.value;
  }

  // USER INFO 
  getUsername(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem(LAST_USER_KEY);
    return null;
  }

  getUserAvatar(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem(AVATAR_KEY);
    return null;
  }

  getCurrentUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id ? Number(payload.id) : null;
    } catch {
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  // --- LOGOUT ---
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LAST_USER_KEY);
      localStorage.removeItem(AVATAR_KEY);
      this.clearBanned();
    }
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  // --- LOGIN / REGISTER ---
  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post<AuthenticationResponse | any>(`${API_BASE_URL}/login`, data).pipe(
      tap((response) => {
        if (response.jwtToken && !response.status) {
          this.setToken(response.jwtToken);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(LAST_USER_KEY, response.username);
            if (response.avatarUrl) localStorage.setItem(AVATAR_KEY, response.avatarUrl);
            else localStorage.removeItem(AVATAR_KEY);
          }
          this.router.navigate(['/home']);
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${API_BASE_URL}/register`, data).pipe(
      tap(() => {
        this.login({ username: data.username, password: data.password }).subscribe();
      })
    );
  }

  uploadAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${API_BASE_URL}/upload`, formData);
  }

  updateCurrentUser(avatarUrl: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(AVATAR_KEY, avatarUrl);
      this.authState.next(true);
    }
  }
}
