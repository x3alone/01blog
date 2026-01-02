import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem('01blog_auth_token');
  let authReq = req;

  if (token && req.url.includes('/api/')) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(authReq).pipe(
    // 1. Check for "Soft Errors" in successful responses (Status 200 but body has error code)
    tap((event) => {
      if (event instanceof HttpResponse) {
        const body = event.body as any;
        if (body && body.status === 403) {
          authService.setBanned(true);
          authService.logout();
          router.navigate(['/error'], { queryParams: { code: '403' } });
        }
      }
    }),
    // 2. Handle standard Http Errors
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      } else if (error.status === 403) {
        authService.setBanned(true);
        authService.logout();
        router.navigate(['/error'], { queryParams: { code: '403' } });
      } else if (error.status === 0) {
        router.navigate(['/error'], { queryParams: { code: '0' } });
      } else if (error.status === 500) {
        router.navigate(['/error'], { queryParams: { code: '500' } });
      }
      return throwError(() => error);
    })
  );
};
