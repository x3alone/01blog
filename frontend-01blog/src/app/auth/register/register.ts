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
        </div>
        <div class="user-box date-box">
          <input type="date" [(ngModel)]="dateOfBirth" name="dateOfBirth" required="">
          <label class="static-label">Date of Birth</label>
        </div>
    </div>

    <!-- Optional Fields -->
    <div class="user-box">
      <input type="text" [(ngModel)]="avatarUrl" name="avatarUrl">
      <label>Avatar URL (Optional)</label>
    </div>
    
    <div class="form-row">
        <div class="user-box">
          <input type="text" [(ngModel)]="nickname" name="nickname">
          <label>Nickname (Optional)</label>
        </div>
        <div class="user-box">
          <input type="text" [(ngModel)]="aboutMe" name="aboutMe">
          <label>About Me (Optional)</label>
        </div>
    </div>

    <!-- Error Message -->
    @if (registerError) {
        <div class="error-msg">{{ registerError }}</div>
    }

    <a href="javascript:void(0)" (click)="register()">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      Register
    </a>
    
    <div class="login-link">
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
        padding: 20px; /* Add padding for overflow */
      }

      .register-box {
        width: 600px; /* Wider for register */
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
      }

      .user-box input {
        width: 100%;
        padding: 10px 0;
        font-size: 16px;
        color: #fff;
        margin-bottom: 30px;
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
          color: #03e9f4;
          font-size: 12px;
      }

      .user-box input:focus ~ label,
      .user-box input:valid ~ label {
        top: -20px;
        left: 0;
        color: #03e9f4;
        font-size: 12px;
      }

      /* Date Input Styling Override */
      input[type="date"] {
        color: #fff;
        font-family: inherit;
      }
      /* Calendar picker icon filter to white */
      input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
      }

      .register-box form a {
        position: relative;
        display: inline-block;
        padding: 10px 20px;
        color: #03e9f4;
        font-size: 16px;
        text-decoration: none;
        text-transform: uppercase;
        overflow: hidden;
        transition: .5s;
        margin-top: 20px;
        letter-spacing: 4px;
        cursor: pointer;
        width: 100%; /* Full width button */
        text-align: center;
      }

      .register-box a:hover {
            background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
      }

      .register-box a span { position: absolute; display: block; }
      .register-box a span:nth-child(1) { top: 0; left: -100%; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, #03e9f4); animation: btn-anim1 1s linear infinite; }
      .register-box a span:nth-child(2) { top: -100%; right: 0; width: 2px; height: 100%; background: linear-gradient(180deg, transparent, #03e9f4); animation: btn-anim2 1s linear infinite; animation-delay: .25s }
      .register-box a span:nth-child(3) { bottom: 0; right: -100%; width: 100%; height: 2px; background: linear-gradient(270deg, transparent, #03e9f4); animation: btn-anim3 1s linear infinite; animation-delay: .5s }
      .register-box a span:nth-child(4) { bottom: -100%; left: 0; width: 2px; height: 100%; background: linear-gradient(360deg, transparent, #03e9f4); animation: btn-anim4 1s linear infinite; animation-delay: .75s }

      @keyframes btn-anim1 { 0% { left: -100%; } 50%,100% { left: 100%; } }
      @keyframes btn-anim2 { 0% { top: -100%; } 50%,100% { top: 100%; } }
      @keyframes btn-anim3 { 0% { right: -100%; } 50%,100% { right: 100%; } }
      @keyframes btn-anim4 { 0% { bottom: -100%; } 50%,100% { bottom: 100%; } }

      .error-msg {
          color: #ffffffff;
          text-align: center;
          margin-top: 10px;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }
      
      .login-link {
          margin-top: 20px;
          text-align: center;
          color: #fff;
          font-size: 0.9rem;
          
          a {
              color: #03e9f4;
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
  nickname = '';
  aboutMe = '';

  registerError: string | null = null;

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  register() {
    this.registerError = null;

    const data = {
      username: this.username,
      password: this.password,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      dateOfBirth: this.dateOfBirth,
      avatarUrl: this.avatarUrl,
      nickname: this.nickname,
      aboutMe: this.aboutMe
    };

    this.auth.register(data).subscribe({
      next: () => {
        this.router.navigate(['/home']); // Auto-login handles navigation logic ideally, but fallback here
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
}
