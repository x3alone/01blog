import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
// NOTE: MakePostFormComponent is removed from imports as it is only used in a route
// which is rendered by <router-outlet>.

@Component({
    selector: 'app-root',
    standalone: true,
    // RouterOutlet and RouterLink are needed in the template.
    // DatePipe and MakePostFormComponent are removed as they are not used here.
    imports: [CommonModule, HttpClientModule, FormsModule, RouterOutlet, RouterLink], 
    template: `
        <div class="min-h-screen bg-gray-900 text-white font-inter">
            <header class="bg-gray-800 shadow-md sticky top-0 z-10">
                <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-indigo-400">
                        <a [routerLink]="['/home']">{{ title() }}</a>
                    </h1>
                    
                    <div class="flex items-center space-x-4">
                        @if (loggedIn()) {
                            <span class="text-sm font-medium text-gray-300 hidden sm:inline">
                                Welcome, {{ currentUsername() }}!
                            </span>
                            <button
                                [routerLink]="['/post/new']"
                                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition duration-300 text-sm"
                            >
                                + New Post
                            </button>
                            <button
                                (click)="logout()"
                                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition duration-300 text-sm"
                            >
                                Logout
                            </button>
                        } @else {
                            <p class="text-gray-400 text-sm hidden sm:inline">Please log in.</p>
                            <a [routerLink]="['/login']" 
                                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition duration-300 text-sm"
                            >
                                Login
                            </a>
                            <a [routerLink]="['/register']" 
                                class="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg shadow-md transition duration-300 text-sm hidden sm:inline"
                            >
                                Register
                            </a>
                        }
                    </div>
                </div>
            </header>

            <main class="max-w-4xl mx-auto px-4 py-8">
                <router-outlet></router-outlet> 
            </main>
        </div>
    `,
    styles: [`
        .post-card:hover {
            transform: translateY(-2px);
        }
    `]
})
export class AppComponent implements OnInit {
    // Service Injections
    private authService = inject(AuthService);
    private router = inject(Router);

    // State Management
    title = signal('MicroBlog Central');
    loggedIn = signal(false);

    // State for the currently logged-in user
    currentUsername = signal('');

    ngOnInit(): void {
        // Setup a check on init and potentially subscribe to auth changes if using a Subject/BehaviorSubject in AuthService
        this.checkAuthStatus();
    }

    checkAuthStatus() {
        this.loggedIn.set(this.authService.isAuthenticated());

        if (this.loggedIn()) {
            const lastUsername = localStorage.getItem('microblog_last_user');
            this.currentUsername.set(lastUsername || 'Authenticated User');
        } else {
            this.currentUsername.set('');
        }
    }

    logout() {
        this.authService.logout();
        this.loggedIn.set(false);
        this.currentUsername.set('');
        localStorage.removeItem('microblog_last_user');
        
        // Navigate to login after logout
        this.router.navigate(['/login']);
    }
}