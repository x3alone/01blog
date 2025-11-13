import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface Post { title: string; date: string; content: string; }

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  posts = signal<Post[]>([
    { title: 'My First Pixel Post', date: 'Sep 13, 2025', content: 'Hello world! Pixel blog.' },
    { title: 'Another Post', date: 'Sep 12, 2025', content: 'Second post content.' }
  ]);

  logout() {
    this.auth.logout();
    this.router.navigate(['login']);
  }
}
