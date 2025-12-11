import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Interceptor that intercepts HTTP requests and adds a JWT to the Authorization header
 * if a token is available in local storage.
 * ALSO handles global 401/403 errors by logging out.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private router = inject(Router);

    constructor() { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        // 1. Get the token from localStorage
        const TOKEN_KEY = '01blog_auth_token';
        const token = localStorage.getItem(TOKEN_KEY);

        let authReq = request;

        // 2. Check if a token exists and if the request is going to our API
        if (token && request.url.includes('/api/')) {
            // 3. Clone the request and add the Authorization header
            authReq = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        // 4. Pass the request down the chain and handle errors
        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                // Check for Unauthorized (401) or Forbidden (403 - e.g. Banned)
                if (error.status === 401 || error.status === 403) {
                    // Clear token/user data
                    localStorage.removeItem(TOKEN_KEY);
                    localStorage.removeItem('01blog_last_user');

                    // Redirect to login
                    this.router.navigate(['/login']);
                }
                return throwError(() => error);
            })
        );
    }
}

// Named function to be used in providers array in Angular's modern configuration
export function authInterceptorProvider() {
    return {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
    };
}