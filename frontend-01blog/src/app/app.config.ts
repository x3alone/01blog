import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes'; 

// --- Functional Interceptor Fix for 403 Forbidden ---
const authInterceptorFn: HttpInterceptorFn = (req, next) => {
    // Note: Since this is outside of the component context, we check if localStorage exists, 
    // which handles the SSR environment check implicitly.
    if (typeof localStorage !== 'undefined') {
        // Retrieve the token using the consistent key from AuthService
        const token = localStorage.getItem('microblog_auth_token'); 

        // Check if token exists and if the request is going to our API
        if (token && req.url.includes('/api/')) {
            const modifiedRequest = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return next(modifiedRequest);
        }
    }
    
    // Pass the original request down if no token or not an API call
    return next(req);
};
// ---------------------------------------------------

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes), 
        // Register HttpClient and include the functional interceptor
        provideHttpClient(withFetch(), withInterceptors([authInterceptorFn])), 
        provideClientHydration(withEventReplay()),
        provideZonelessChangeDetection(),
        provideBrowserGlobalErrorListeners(),
    ]
};