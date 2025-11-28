import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { HomeComponent } from './home/home.component';
import { CreatePostComponent } from './posts/make-post-form.component'; // New Import
// import { PostDetailComponent } from './posts/post-detail/post-detail.component'; // New Import
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Redirect root to home
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Public Routes (or routes that handle unauthenticated access internally)
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },

  // Authenticated Routes - guarded by authGuard
  { path: 'home', component: HomeComponent, canActivate: [authGuard] }, 
  { path: 'post/new', component: CreatePostComponent, canActivate: [authGuard] }, // Route for creating a new post
  // { path: 'post/:id', component: PostDetailComponent, canActivate: [authGuard] }, // Route for viewing post details (e.g., /post/123xyz)

  // Fallback route
  { path: '**', redirectTo: 'home' }
];