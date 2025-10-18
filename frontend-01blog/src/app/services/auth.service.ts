import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common'; // <-- Needed for platform check
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient); 
  // Inject the platform identifier
  private platformId = inject(PLATFORM_ID); // <-- New injection

  constructor() {} 

  login(data: { username: string; password: string }): Observable<any> {
    return this.http.post('/api/auth/login', data);
  }

  register(data: { username: string; password: string }): Observable<any> {
    return this.http.post('/api/auth/register', data);
  }

  logout(): void {
    // Check if running in a browser environment before accessing localStorage
    if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('token');
    }
  }

  isAuthenticated(): boolean {
    // CRITICAL FIX: Only access localStorage if the application is running in the browser
    if (isPlatformBrowser(this.platformId)) {
        return !!localStorage.getItem('token');
    }
    
    // During Server-Side Rendering, we assume the user is NOT authenticated.
    // This allows the router to either prerender the login page or wait for client-side hydration.
    return false; 
  }
}
