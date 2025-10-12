import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  username = '';
  password = '';
  private auth = inject(AuthService);
  private router = inject(Router);

  login() {
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/home']),
      error: err => alert('Login failed: ' + err.message)
    });
  }
}
