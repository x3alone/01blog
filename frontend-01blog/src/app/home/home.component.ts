import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface Post { 
  id: number; // Added ID for tracking
  title: string; 
  date: string; 
  content: string; 
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Mock property: In a real app, this would be fetched from a service after login.
  currentUser = 'Blogger Max'; 

  posts = signal<Post[]>([
    { id: 1, title: 'Understanding Angular Signals', date: 'Sep 13, 2025', content: 'Signals are a modern way to manage state in Angular applications, offering performance benefits...' },
    { id: 2, title: 'Why I Switched to Tailwind CSS', date: 'Sep 12, 2025', content: 'Tailwind provides utility-first styling that drastically speeds up development time and component design.' },
    { id: 3, title: 'The Power of Standalone Components', date: 'Sep 11, 2025', content: 'Standalone components simplify the NgModule system and make dependency management much cleaner.' }
  ]);

  logout() {
    this.auth.logout();
    this.router.navigate(['login']);
  }

  // Placeholder method for future implementation
  createNewPost() {
    console.log('Navigating to create new post...');
    // In a real application, you would navigate to a /create route here.
    // this.router.navigate(['/create-post']);
  }
}