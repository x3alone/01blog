import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
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
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
      } else if (error.status === 403) {
        //Mark user as banned
        authService.setBanned(true);
        authService.logout();
        router.navigate(['/unauthorized']); // optional banned page
      }
      return throwError(() => error);
    })
  );
};
