import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    // Using inline template for full component portability and Tailwind styling
    template: `
<div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="max-w-md w-full p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h2 class="text-3xl font-bold text-center text-gray-800">Welcome Back</h2>
        <p class="text-center text-gray-500">Sign in to access your blog.</p>

        <form (ngSubmit)="login()" class="space-y-4">
            <div>
                <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                <input id="username" type="text" [(ngModel)]="username" name="username" required
                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input id="password" type="password" [(ngModel)]="password" name="password" required
                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <button type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Log In
            </button>
        </form>

        <!-- Error Message Display -->
        @if (loginError) {
            <div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
                {{ loginError }}
            </div>
        }

        <div class="text-center text-sm">
            <p class="text-gray-600">
                Don't have an account? 
                <a routerLink="/register" class="font-medium text-indigo-600 hover:text-indigo-500">Register here</a>
            </p>
        </div>
    </div>
</div>
`,
    styles: [`
        /* Using Tailwind utility classes for all styling */
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

        this.auth.login({ username: this.username, password: this.password }).subscribe({
            next: () => {
                // Token is saved synchronously in AuthService, allowing direct navigation.
                this.router.navigate(['/home']);
            },
            error: (err) => {
                console.error('Login error:', err);

                // Handle HTTP 401 response from the backend
                if (err.status === 401) {
                    this.loginError = 'Invalid username or password.';
                } else if (err.error?.message) {
                    this.loginError = err.error.message;
                }
                else {
                    this.loginError = 'Login failed. Please check your connection.';
                }
            }
        });
    }
}