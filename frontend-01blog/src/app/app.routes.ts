import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { HomeComponent } from './home/home.component';
import { MakePostFormComponent } from './posts/make-post-form.component'; 
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  // Redirect root path to the home route
  { path: '', redirectTo: 'home', pathMatch: 'full' }, 
  
  // Public Routes (Authentication is handled within the AppComponent, but these are defined for routing)
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },

  // Home Route - typically shows the post feed
  { path: 'home', component: HomeComponent }, 
  
  // Authenticated Routes - Protected access
  { path: 'post/new', component: MakePostFormComponent, canActivate: [authGuard] }, // Route for creating a new post

  // Fallback route (redirects any unknown path to home)
  { path: '**', redirectTo: 'home' }
];