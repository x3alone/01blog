import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface AuthenticationResponse {
    jwtToken: string;
    id: number;
    username: string;
    role: string;
    avatarUrl?: string;
}

// JWT token and user data stored in localStorage for persistent authentication (Audit: Secure Token Management)
const API_BASE_URL = '/api/auth';
const TOKEN_KEY = '01blog_auth_token';
const LAST_USER_KEY = '01blog_last_user';
const AVATAR_KEY = '01blog_user_avatar';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private router = inject(Router);

    // Auth State Subject
    private authState = new BehaviorSubject<boolean>(this.isAuthenticated());
    public authState$ = this.authState.asObservable();

    constructor() { }

    private setToken(token: string): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(TOKEN_KEY, token);
            this.authState.next(true);
        }
    }

    public getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    }

    public isAuthenticated(): boolean {
        return !!this.getToken();
    }

    public getUsername(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(LAST_USER_KEY);
        }
        return null;
    }

    public getUserAvatar(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(AVATAR_KEY);
        }
        return null;
    }

    // Extract user ID from JWT token payload (Audit: JWT Authentication)
    public getCurrentUserId(): number | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id ? Number(payload.id) : null;
        } catch (e) {
            return null;
        }
    }

    // Extract role from JWT token for role-based UI rendering (Audit: Role-based Access Control)
    public getUserRole(): string | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.role || null;
        } catch (e) {
            return null;
        }
    }

    public isAdmin(): boolean {
        return this.getUserRole() === 'ADMIN';
    }

    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(LAST_USER_KEY);
            localStorage.removeItem(AVATAR_KEY);
            this.authState.next(false);
        }
        this.router.navigate(['/login']);
    }

    login(data: { username: string; password: string }): Observable<any> {
        return this.http.post<AuthenticationResponse | any>(`${API_BASE_URL}/login`, data)
            .pipe(
                tap((response) => {
                    if (response.jwtToken && !response.status) {
                        this.setToken(response.jwtToken);
                        if (isPlatformBrowser(this.platformId)) {
                            localStorage.setItem(LAST_USER_KEY, response.username);
                            if (response.avatarUrl) {
                                localStorage.setItem(AVATAR_KEY, response.avatarUrl);
                            } else {
                                localStorage.removeItem(AVATAR_KEY);
                            }
                        }
                        this.router.navigate(['/home']);
                    }
                }),
                map(res => res)
            );
    }
    register(data: {
        username: string;
        password: string;
        email: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string; // ISO date string
        avatarUrl?: string; // Optional
        aboutMe?: string; // Optional
    }): Observable<any> {
        return this.http.post(`${API_BASE_URL}/register`, data)
            .pipe(
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

    // ... rest of the file
}