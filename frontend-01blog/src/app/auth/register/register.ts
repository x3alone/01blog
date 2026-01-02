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
  styleUrl: './register.scss'
})
export class RegisterComponent {
  username = '';
  password = '';
  email = '';
  firstName = '';
  lastName = '';
  dateOfBirth = '';
  avatarUrl = '';
  aboutMe = '';

  registerError: string | null = null;
  passwordError: string | null = null;
  emailError: string | null = null;

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Redirects authenticated users to the home page
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  register() {
    this.registerError = null;
    this.passwordError = null;
    this.emailError = null;

    // Validates that the Date of Birth is provided
    if (!this.dateOfBirth) {
      this.registerError = "Date of Birth is required.";
      return;
    }

    // Calculates age to ensure the user is at least 10 years old
    const dob = new Date(this.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 10) {
      this.registerError = "You must be at least 10 years old to register.";
      return;
    }

    // Validates password length
    if (this.password.length < 8) {
      this.passwordError = "Password must be at least 8 characters long.";
    }

    // Validates email format using regex
    const emailRegex = /^.{3,}@.{2,}\..{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = "Invalid email format (e.g. user@domain.com).";
    }

    if (this.passwordError || this.emailError) {
      return;
    }

    // Ensures all required fields are populated
    if (!this.username || !this.password || !this.email || !this.firstName || !this.lastName) {
      this.registerError = "All fields are required.";
      return;
    }

    const data = {
      username: this.username,
      password: this.password,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      avatarUrl: this.avatarUrl,
      aboutMe: this.aboutMe
    };

    this.auth.register(data).subscribe({
      next: (res: any) => {
        // Handles 200 OK responses that contain error details in the body
        if (res && res.status && res.status !== 200) {
          if (res.status === 409 || res.status === 500) {
            this.registerError = 'Username already exists';
          } else if (res.message) {
            this.registerError = res.message;
          } else {
            this.registerError = 'Registration failed.';
          }
          return;
        }

        this.router.navigate(['/home']);
      },
      error: (err) => {
        // Handles HTTP error responses
        if (err.status === 409 || err.status === 500) {
          this.registerError = 'Username already exists';
        } else if (err.error?.message) {
          this.registerError = err.error.message;
        }
        else {
          this.registerError = 'Registration failed. Check your connection.';
        }
      }
    });
  }
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.registerError = null; // Clear previous errors
      this.auth.uploadAvatar(file).subscribe({
        next: (res: any) => {
          this.avatarUrl = res.secure_url || res.url;
        },
        error: (err: any) => {
          // console.error('Upload failed', err);
          this.registerError = "Failed to upload avatar.";
        }
      });
    }
  }
}
