import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
})
export class RegisterComponent {
  username = '';
  password = '';
  registerError: string | null = null; // New state to hold error message

  private auth = inject(AuthService);
  private router = inject(Router);

  register() {
    this.registerError = null; // Clear previous errors
    
    this.auth.register({ username: this.username, password: this.password }).subscribe({
      next: () => {
        // On successful registration, navigate to login page
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        
        // Handle specific error cases (e.g., username already taken)
        if (err.status === 409) {
          this.registerError = 'Username is already taken. Please choose another.';
        } else if (err.error?.message) {
          this.registerError = err.error.message;
        } 
        else {
          this.registerError = 'Registration failed. Check your backend status.';
        }
      }
    });
  }
}
