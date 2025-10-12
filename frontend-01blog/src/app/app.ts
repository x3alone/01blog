import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Post {
  title: string;
  date: string;
  content: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class App {
  // Signals
  protected readonly title = signal('Pixel Blog');
  protected readonly posts = signal<Post[]>([
    {
      title: 'My First Pixel Post',
      date: 'September 13, 2025',
      content: `Hello world! This is my black and white pixel-style blog.
Everything here is raw and minimal, just like retro websites.`
    },
    {
      title: 'Another Post',
      date: 'September 12, 2025',
      content: `Pixel blogs are fun because they feel like you are coding everything by hand.
No colors, no gradients, just pure black and white.`
    }
  ]);

  // Auth form data
  username = '';
  password = '';
  loginUsername = '';
  loginPassword = '';
  role = 'USER';

  // Auth state
  private token = signal<string | null>(null);

  // Inject HttpClient
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  // Helpers
  loggedIn() {
    return this.token() !== null;
  }

  // Register
  register() {
    const body = { username: this.username, password: this.password, role: this.role };
    this.http.post(`${this.baseUrl}/register`, body)
      .subscribe({
        next: () => alert('Registered successfully!'),
        error: (err: any) => alert('Registration failed: ' + err.message)
      });
  }

  // Login
  login() {
    const body = { username: this.loginUsername, password: this.loginPassword };
    this.http.post<{ token: string }>(`${this.baseUrl}/login`, body)
      .subscribe({
        next: (res) => {
          this.token.set(res.token); // store token
          alert('Login successful!');
        },
        error: (err: any) => alert('Login failed: ' + err.message)
      });
  }

  // Logout
  logout() {
    this.token.set(null);
    this.loginUsername = '';
    this.loginPassword = '';
    alert('Logged out successfully');
  }
}
