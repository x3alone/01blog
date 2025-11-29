import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators'; 
import { Router } from '@angular/router';

// Define the expected response structure from the backend
interface AuthenticationResponse {
    jwtToken: string;
    // Assuming backend returns username for the app component to display
    username: string; 
}

// Define the base URL for the backend API
const API_BASE_URL = '/api/auth';
const TOKEN_KEY = 'microblog_auth_token';
const LAST_USER_KEY = 'microblog_last_user';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private router = inject(Router);

    constructor() {}
    
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
     * Handles user login and token storage.
     */
    login(data: { username: string; password: string }): Observable<string> {
        return this.http.post<AuthenticationResponse>(`${API_BASE_URL}/login`, data)
            .pipe(
                // Use map to transform the backend response into just the token string
                map(response => response.jwtToken), 
                tap((token: string) => {
                    if (token) {
                        this.setToken(token);
                        // Save username for display
                        if (isPlatformBrowser(this.platformId)) {
                            localStorage.setItem(LAST_USER_KEY, data.username);
                        }
                        // Navigate to 'home' on successful login
                        this.router.navigate(['/home']);
                    } else {
                        throw new Error("Login successful, but token was missing.");
                    }
                })
            );
    }

    /**
     * Handles user registration and auto-login.
     */
    register(data: { username: string; password: string }): Observable<any> {
        return this.http.post(`${API_BASE_URL}/register`, data)
            .pipe(
                // Auto-login after successful registration
                tap(() => {
                    // Note: Subscribing here ensures the login call executes immediately after registration succeeds.
                    this.login(data).subscribe(); 
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
        }
        // Navigate to login after logout
        this.router.navigate(['/login']);
    }
}