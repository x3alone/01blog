import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interceptor that intercepts HTTP requests and adds a JWT to the Authorization header
 * if a token is available in local storage.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor() {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        
        // 1. Get the token from localStorage
        // FIX: The key must match the one used in AuthService ('01blog_auth_token').
        // We'll define the constant here for clarity.
        const TOKEN_KEY = '01blog_auth_token';
        const token = localStorage.getItem(TOKEN_KEY);

        // 2. Check if a token exists and if the request is going to our API
        if (token && request.url.includes('/api/')) {
            // 3. Clone the request and add the Authorization header
            const modifiedRequest = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });

            // 4. Pass the modified request down the chain
            return next.handle(modifiedRequest);
        }

        // 5. If no token or not an API call, pass the original request
        return next.handle(request);
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