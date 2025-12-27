import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
<div class="login-box">
  <h2>Login</h2>
  <form (ngSubmit)="login()">
    <div class="user-box">
      <input type="text" [(ngModel)]="username" name="username" required="">
      <label>Username</label>
    </div>
    <div class="user-box">
      <input type="password" [(ngModel)]="password" name="password" required="">
      <label>Password</label>
    </div>
    
    <!-- Error Message -->
    @if (loginError) {
        <p class="error-text">{{ loginError }}</p>
    }

    <a href="javascript:void(0)" (click)="login()">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      Submit
    </a>
    
    <div class="register-link">
        Don't have an account? <a routerLink="/register">Register</a>
    </div>
  </form>
</div>
`,
  styles: [`
      :host {
        display: flex; /* Center the box */
        justify-content: center;
        align-items: center;
        margin-top: 15%;
      }

      .login-box {
        width: 400px;
        padding: 40px;
        background: rgba(255, 255, 255, 0.15); /* Light glass */
        box-sizing: border-box;
        box-shadow: 0 15px 25px rgba(0,0,0,.2);
        border-radius: 10px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .login-box h2 {
        margin: 0 0 30px;
        padding: 0;
        color: #fff;
        text-align: center;
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .login-box .user-box {
        position: relative;
      }

      .login-box .user-box input {
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
      .login-box .user-box label {
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

      .login-box .user-box input:focus ~ label,
      .login-box .user-box input:valid ~ label {
        top: -20px;
        left: 0;
        color: #ffffffff; /* Cyan accent */
        font-size: 12px;
      }

      /* Button Style */
      .login-box form a {
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
      }

      .login-box a:hover {
            background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
      }

      .login-box a span {
        position: absolute;
        display: block;
      }

      .login-box a span:nth-child(1) {
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #ffffffff);
        animation: btn-anim1 1s linear infinite;
      }

      @keyframes btn-anim1 {
        0% { left: -100%; }
        50%,100% { left: 100%; }
      }

      .login-box a span:nth-child(2) {
        top: -100%;
        right: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(180deg, transparent, #ffffffff);
        animation: btn-anim2 1s linear infinite;
        animation-delay: .25s
      }

      @keyframes btn-anim2 {
        0% { top: -100%; }
        50%,100% { top: 100%; }
      }

      .login-box a span:nth-child(3) {
        bottom: 0;
        right: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(270deg, transparent, #ffffffff);
        animation: btn-anim3 1s linear infinite;
        animation-delay: .5s
      }

      @keyframes btn-anim3 {
        0% { right: -100%; }
        50%,100% { right: 100%; }
      }

      .login-box a span:nth-child(4) {
        bottom: -100%;
        left: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(360deg, transparent, #ffffffff);
        animation: btn-anim4 1s linear infinite;
        animation-delay: .75s
      }

      @keyframes btn-anim4 {
        0% { bottom: -100%; }
        50%,100% { bottom: 100%; }
      }

      .error-text {
          color: #ff6b6b; /* Red text */
          text-align: center;
          margin-top: 10px;
          font-weight: 500;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
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
              
              &:hover {
                  text-decoration: underline;
              }
          }
      }
    `]
})
export class LoginComponent {
  username = '';
  password = '';
  loginError: string | null = null;

  private auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  login() {
    this.loginError = null;

    if (!this.username || !this.password) {
      this.loginError = "Username and password are required.";
      return;
    }

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login error:', err);

        // Granular Error Handling
        if (err.status === 403 || (err.error?.message && err.error.message.toLowerCase().includes('banned'))) {
          this.loginError = "You have been banned by an admin.";
        }
        else if (err.status === 404 || (err.error?.message && err.error.message.toLowerCase().includes('user not found'))) {
          this.loginError = "User doesn't exist.";
        }
        else if (err.status === 401) {
          this.loginError = "Wrong password.";
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