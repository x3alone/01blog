import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

// Define the expected response structure from the backend
interface AuthenticationResponse {
    jwtToken: string;
    id: number;
    username: string;
    role: string;
    avatarUrl?: string;
}

// Define the base URL for the backend API
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

    constructor() { }

    /**
     * Safely stores the JWT in local storage.
     */
    private setToken(token: string): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(TOKEN_KEY, token);
        }
    }

    /**
     * Safely retrieves the JWT from local storage.
     */
    public getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    }

    /**
     * Checks if a token exists.
     */
    public isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Retrieves the username from local storage for display purposes.
     */
    public getUsername(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(LAST_USER_KEY);
        }
        return null;
    }

    /**
     * Safely retrieves the Avatar URL from local storage.
     */
    public getUserAvatar(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(AVATAR_KEY);
        }
        return null;
    }

    /**
     * Extracts the user's ID from the JWT token.
     */
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

    /** 
     * Extract role from token
     */
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

    /**
     * Handles user login and token storage.
     */
    login(data: { username: string; password: string }): Observable<string> {
        return this.http.post<AuthenticationResponse>(`${API_BASE_URL}/login`, data)
            .pipe(
                tap((response) => {
                    if (response.jwtToken) {
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
                map(res => res.jwtToken)
            );
    }

    /**
     * Handles user registration and auto-login.
     */
    register(data: {
        username: string;
        password: string;
        email: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string; // ISO date string
        avatarUrl?: string; // Optional
        nickname?: string; // Optional
        aboutMe?: string; // Optional
    }): Observable<any> {
        return this.http.post(`${API_BASE_URL}/register`, data)
            .pipe(
                // Auto-login after successful registration
                tap(() => {
                    this.login({ username: data.username, password: data.password }).subscribe();
                })
            );
    }

    /**
     * Clears authentication data and navigates to login.
     */
    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(LAST_USER_KEY);
            localStorage.removeItem(AVATAR_KEY);
        }
        // Navigate to login after logout
        this.router.navigate(['/login']);
    }
}