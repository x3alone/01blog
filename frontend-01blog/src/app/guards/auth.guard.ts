import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core'; // <--- FIX: 'inject' must be imported from '@angular/core'
import { AuthService } from '../services/auth.service';

/**
 * Functional Guard to check if the user is authenticated (has a JWT token).
 * If not authenticated, it redirects the user to the login page.
 */
export const authGuard: CanActivateFn = () => {
  // Use inject() to get dependencies inside the functional context
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check the authentication status via the service
  const loggedIn = authService.isAuthenticated(); 
  
  if (!loggedIn) {
    // If not logged in, navigate to the login route
    router.navigate(['login']);
    return false;
  }
  // If logged in, allow navigation
  return true;
};
