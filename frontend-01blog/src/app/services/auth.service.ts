import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; 

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
            localStorage.setItem('token', token);
        }
    }

    /**
     * FIX: Explicitly set the Observable return type to string.
     * The backend returns a raw JWT string (text), so this matches the 
     * 'responseType: text' and fixes the compiler error in the pipe.
     */
    login(data: { username: string; password: string }): Observable<string> {
        // Use responseType: 'text' to correctly handle the raw JWT string response.
        return this.http.post('/api/auth/login', data, { responseType: 'text' })
            .pipe(
                // The type of 'token' is now correctly inferred as string.
                tap((token: string) => {
                    // This guarantees the token is saved synchronously upon successful login, 
                    // preventing the redirection loop.
                    if (token) {
                        this.setToken(token);
                    } else {
                        throw new Error("Login successful, but token was missing.");
                    }
                })
            );
    }

    register(data: { username: string; password: string }): Observable<any> {
        return this.http.post('/api/auth/register', data);
    }

    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
        }
    }

    isAuthenticated(): boolean {
        // This check will pass immediately after a successful login due to the synchronous 'tap'.
        if (isPlatformBrowser(this.platformId)) {
            return !!localStorage.getItem('token');
        }
        return false;
    }
}