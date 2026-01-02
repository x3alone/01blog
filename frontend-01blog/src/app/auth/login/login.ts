import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  loginError: string | null = null;

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Redirects authenticated users to the home page
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  login() {
    this.loginError = null;

    // Validates that username and password are provided
    if (!this.username || !this.password) {
      this.loginError = "Username and password are required.";
      return;
    }

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: (res: any) => {
        // Handles 200 OK responses that contain error details in the body
        if (res.status && res.status !== 200) {
          if (res.status === 403) {
            this.loginError = "You have been banned by an admin.";
          }
          else if (res.status === 404) {
            this.loginError = "Username does not exist";
          }
          else if (res.status === 401) {
            this.loginError = "Password not correct";
          }
          else if (res.message) {
            this.loginError = res.message;
          }
          else {
            this.loginError = 'Login failed. Please check your connection.';
          }
          return;
        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
        // Handles HTTP error responses
        if (err.status === 403) {
          this.loginError = "You have been banned by an admin.";
        }
        else if (err.status === 404) {
          this.loginError = "Username does not exist";
        }
        else if (err.status === 401) {
          this.loginError = "Password not correct";
        }
        else if (err.error?.message) {
          this.loginError = err.error.message;
        }
        else {
          this.loginError = 'Login failed. Please check your connection.';
        }
      }
    });
  }
}