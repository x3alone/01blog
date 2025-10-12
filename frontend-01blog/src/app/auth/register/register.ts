import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
})
export class RegisterComponent {
  username = '';
  password = '';
  private auth = inject(AuthService);
  private router = inject(Router);

  register() {
    this.auth.register(this.username, this.password).subscribe({
      next: () => {
        alert('Registered successfully! Now login.');
        this.router.navigate(['/login']);
      },
      error: err => alert('Registration failed: ' + err.message)
    });
  }
}
