import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.getUserRole() === 'ADMIN') {
        return true;
    }

    // Redirect to unauthorized error page
    router.navigate(['/error'], { queryParams: { code: '403' } });
    return false;
};
