import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, FormsModule],
  templateUrl: './app.component.html', // Points to the new HTML file
  styleUrl: './app.component.scss'     // Points to the new SCSS file
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  loggedIn = signal(false);
  currentUsername = signal('');
  
  ngOnInit() {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.loggedIn.set(this.authService.isAuthenticated());
    if (this.loggedIn()) {
      const username = localStorage.getItem('01blog_last_user');
      this.currentUsername.set(username || 'User');
    }
  }

  logout() {
    this.authService.logout();
    this.loggedIn.set(false);
    this.currentUsername.set('');
    this.router.navigate(['/login']);
  }
}