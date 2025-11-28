import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; 

// Define the base URL for the backend API
const API_BASE_URL = '/api/auth';
const TOKEN_KEY = 'microblog_auth_token';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);

    constructor() {}
    
    /**
     * Helper to store the token in localStorage. Must be wrapped in a platform check.
     */
    private setToken(token: string): void {
        if (isPlatformBrowser(this.platformId)) {
            // FIX: Use the consistent key 'microblog_auth_token'
            localStorage.setItem(TOKEN_KEY, token);
        }
    }

    /**
     * Logs the user in and stores the JWT token.
     */
    login(data: { username: string; password: string }): Observable<string> {
        // Use responseType: 'text' to correctly handle the raw JWT string response.
        return this.http.post(`${API_BASE_URL}/login`, data, { responseType: 'text' })
            .pipe(
                // The type of 'token' is now correctly inferred as string.
                tap((token: string) => {
                    if (token) {
                        this.setToken(token);
                    } else {
                        // This should ideally not happen if the backend returns 200/201
                        throw new Error("Login successful, but token was missing.");
                    }
                })
            );
    }

    /**
     * Registers a new user.
     */
    register(data: { username: string; password: string }): Observable<any> {
        return this.http.post(`${API_BASE_URL}/register`, data);
    }

    /**
     * Clears the authentication token.
     */
    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            // FIX: Use the consistent key 'microblog_auth_token'
            localStorage.removeItem(TOKEN_KEY);
        }
    }

    /**
     * Checks if a token exists in local storage.
     */
    isAuthenticated(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            // FIX: Use the consistent key 'microblog_auth_token'
            return !!localStorage.getItem(TOKEN_KEY);
        }
        return false;
    }
}