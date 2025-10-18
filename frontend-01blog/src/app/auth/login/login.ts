import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // We include RouterModule here so the routerLink in the template works.
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './login.html',
})
export class LoginComponent {
  username = '';
  password = '';
  // Use a property to control the display of the error message instead of alert()
  loginError: string | null = null; 

  private auth = inject(AuthService);
  private router = inject(Router);

  login() {
    this.loginError = null; // Clear previous errors
    
    // Call the service method
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        // On successful login (token is saved in service via tap operator)
        this.router.navigate(['/home']);
      },
      error: (err) => {
        // Handle HTTP error
        console.error('Login error:', err);
        // Display specific message if available, otherwise a generic one
        if (err.status === 401) {
          this.loginError = 'Invalid username or password.';
        } else if (err.error?.message) {
          this.loginError = err.error.message;
        } 
        else {
          this.loginError = 'Login failed. Please check your connection.';
        }
      }
    });
  }
}
