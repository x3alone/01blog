import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div class="login-box register-box">
  <h2>Register</h2>
  <form (ngSubmit)="register()">
    
    <!-- Row 1: Credentials -->
    <div class="form-row">
        <div class="user-box">
          <input type="text" [(ngModel)]="username" name="username" required="">
          <label>Username</label>
        </div>
        <div class="user-box">
          <input type="password" [(ngModel)]="password" name="password" required="">
          <label>Password</label>
          @if (passwordError) {
            <p class="error-text">{{ passwordError }}</p>
          }
        </div>
    </div>

    <!-- Row 2: Name -->
    <div class="form-row">
        <div class="user-box">
          <input type="text" [(ngModel)]="firstName" name="firstName" required="">
          <label>First Name</label>
        </div>
        <div class="user-box">
          <input type="text" [(ngModel)]="lastName" name="lastName" required="">
          <label>Last Name</label>
        </div>
    </div>

    <!-- Row 3: Email & DOB -->
    <div class="form-row">
        <div class="user-box">
          <input type="email" [(ngModel)]="email" name="email" required="">
          <label>Email</label>
          @if (emailError) {
            <p class="error-text">{{ emailError }}</p>
          }
        </div>
        <div class="user-box date-box">
          <input type="date" [(ngModel)]="dateOfBirth" name="dateOfBirth" required="">
          <label class="static-label">Date of Birth</label>
        </div>
    </div>

    <!-- Optional Fields -->
    <div class="form-row">
        <div class="user-box static-box">
          <div style="display: flex; gap: 10px; margin-top: 10px; align-items: center;">
              <label class="upload-btn" style="position: relative; z-index: 10;">
                <input type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span style="cursor: pointer;">Upload Avatar</span>
              </label>
              @if (avatarUrl) {
                <span style="color: #4ade80; font-size: 0.8rem; font-weight: bold;">Uploaded!</span>
              }
          </div>
        </div>
    </div>
    
    <div class="form-row">
        <div class="user-box static-box">
          <input type="text" [(ngModel)]="aboutMe" name="aboutMe">
          <label>About Me (Optional)</label>
        </div>
    </div>

    <!-- General Error Message (e.g. Server Errors) -->
    @if (registerError) {
        <p class="error-text main-error">{{ registerError }}</p>
    }

    <a href="javascript:void(0)" (click)="register()">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      Register
    </a>
    
    <div class="register-link">
        Already have an account? <a routerLink="/login">Login</a>
    </div>
  </form>
</div>
  `,
  styles: [`
      :host {
        display: block;
        min-height: 100vh;
        width: 100vw;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }

      .register-box {
        width: 600px;
        padding: 40px;
        background: rgba(255, 255, 255, 0.15);
        box-sizing: border-box;
        box-shadow: 0 15px 25px rgba(0,0,0,.2);
        border-radius: 10px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .register-box h2 {
        margin: 0 0 30px;
        padding: 0;
        color: #fff;
        text-align: center;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .form-row {
          display: flex;
          gap: 20px;
      }
      .form-row .user-box {
          flex: 1;
      }

      .user-box {
        position: relative;
        margin-bottom: 30px;
      }

      .user-box input {
        width: 100%;
        padding: 10px 0;
        font-size: 16px;
        color: #fff;
        margin-bottom: 5px; /* Space for error message */
        border: none;
        border-bottom: 1px solid #fff;
        outline: none;
        background: transparent;
      }
      .user-box label {
        position: absolute;
        top:0;
        left: 0;
        padding: 10px 0;
        font-size: 16px;
        color: #fff;
        pointer-events: none;
        transition: .5s;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }

      .user-box label.static-label {
          top: -20px;
          left: 0;
          color: #ffffffff;
          font-size: 12px;
      }

      .user-box input:focus ~ label,
      .user-box input:valid ~ label,
      .user-box select:focus ~ label,
      .user-box select:valid ~ label {
        top: -20px;
        left: 0;
        color: #ffffffff;
        font-size: 12px;
      }
      
      .static-box label {
          top: -20px;
          left: 0;
          color: #ffffffff;
          font-size: 12px;
      }

      input[type="date"] {
        color: #fff;
        font-family: inherit;
      }
      input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
      }
      
      .upload-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 8px 12px;
        border: 1px solid rgba(255,255,255,0.5);
        border-radius: 5px;
        transition: 0.3s;
        pointer-events: auto;
        position: relative;
        z-index: 100 !important; /* Force high z-index */
        background: rgba(255,255,255,0.05); /* Slight fill to help hit target */
        
        /* Fix for pointer-events being overridden by parent label rule */
        pointer-events: auto !important;
        
        &:hover {
            background: rgba(255,255,255,0.2);
            border-color: #fff;
        }
        
        span {
            color: #fff;
            font-size: 0.9rem;
        }
      }

      .register-box form a {
            position: relative;
            display: inline-block;
            padding: 10px 20px;
            color: #333;
            font-size: 16px;
            text-decoration: none;
            overflow: hidden;
            transition: 0.5s;
            letter-spacing: 4px;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.15);
            box-sizing: border-box;
            box-shadow: 0 0px 10px rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            width: 100%;
            text-align: center;
      }

      .register-box a:hover {
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
      }

      .register-box a span { position: absolute; display: block; }
      .register-box a span:nth-child(1) { top: 0; left: -100%; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #ffffffff); animation: btn-anim1 1s linear infinite; }
      .register-box a span:nth-child(2) { top: -100%; right: 0; width: 2px; height: 100%; background: linear-gradient(180deg, transparent, #ffffffff); animation: btn-anim2 1s linear infinite; animation-delay: .25s }
      .register-box a span:nth-child(3) { bottom: 0; right: -100%; width: 100%; height: 2px; background: linear-gradient(270deg, transparent, #ffffffff); animation: btn-anim3 1s linear infinite; animation-delay: .5s }
      .register-box a span:nth-child(4) { bottom: -100%; left: 0; width: 2px; height: 100%; background: linear-gradient(360deg, transparent, #ffffffff); animation: btn-anim4 1s linear infinite; animation-delay: .75s }

      @keyframes btn-anim1 { 0% { left: -100%; } 50%,100% { left: 100%; } }
      @keyframes btn-anim2 { 0% { top: -100%; } 50%,100% { top: 100%; } }
      @keyframes btn-anim3 { 0% { right: -100%; } 50%,100% { right: 100%; } }
      @keyframes btn-anim4 { 0% { bottom: -100%; } 50%,100% { bottom: 100%; } }

      .error-text {
          color: #ff6b6b; /* Red text */
          font-size: 0.8rem;
          margin: 2px 0 0 0;
          font-weight: 500;
          text-align: left;
      }
      .main-error {
        text-align: center;
        margin-top: 10px;
        font-size: 1rem;
      }
      
      .register-link {
          margin-top: 20px;
          color: #fff;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          
          a {
              color: #ffffffff;
              text-decoration: none;
              font-weight: bold;
              &:hover { text-decoration: underline; }
          }
      }
  `]
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
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  register() {
    this.registerError = null;
    this.passwordError = null;
    this.emailError = null;

    // Age Validation
    if (!this.dateOfBirth) {
      this.registerError = "Date of Birth is required.";
      return;
    }
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

    // Password Validation: >= 8 chars
    if (this.password.length < 8) {
      this.passwordError = "Password must be at least 8 characters long.";
    }

    // Email Regex Validation: 3 chars @ 2 chars . 2 chars
    // Regex: ^.{3,}@.{2,}\..{2,}$
    const emailRegex = /^.{3,}@.{2,}\..{2,}$/;
    if (!emailRegex.test(this.email)) {
      this.emailError = "Invalid email format (e.g. user@domain.com).";
    }

    if (this.passwordError || this.emailError) {
      return; // Stop if validation fails
    }

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
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        if (err.status === 409) {
          this.registerError = 'Username is already taken. Please choose another.';
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
          console.error('Upload failed', err);
          this.registerError = "Failed to upload avatar.";
        }
      });
    }
  }
}
