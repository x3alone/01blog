import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.getUserRole() === 'ADMIN') {
        return true;
    }

    // Redirect or show error
    // router.navigate(['/']); // Redirect to home
    // Or better, let them stay but show a message?
    // User asked: "make sure even if somehow they got access ... they couldnt see data ... leave a message"
    // A simple alert or redirect with state is easiest. 
    // But strict requirement: "leave a message like 'only admins can access dashboard'"
    alert('Only admins can access dashboard');
    router.navigate(['/']);
    return false;
};
