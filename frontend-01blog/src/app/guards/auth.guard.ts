import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core'; 
import { AuthService } from '../services/auth.service';

/**
 * Functional Guard to check if the user is authenticated (has a JWT token).
 * If not authenticated, it redirects the user to the login page.
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // This checks localStorage.getItem('token')
    const loggedIn = authService.isAuthenticated(); 
    
    if (!loggedIn) {
        // Redirect to the login route if no token is found
        router.navigate(['/login']); 
        return false;
    }
    // Allow navigation if logged in
    return true;
};