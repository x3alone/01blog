import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { HomeComponent } from './home/home.component';
import { MakePostFormComponent } from './posts/make-post-form.component';
import { authGuard } from './guards/auth.guard';
import { UserProfileComponent } from './profile/UserProfileComponent';
import { DashboardComponent } from './dashboard/dashboard.component';


import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Redirect root path to the home route
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Public Routes - Add logic to redirect if already logged in? 
  // For now simple routing.
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },

  // Home Route - typically shows the post feed
  { path: 'home', component: HomeComponent },

  // Authenticated Routes - Protected access
  { path: 'post/new', component: MakePostFormComponent, canActivate: [authGuard] }, // Route for creating a new post
  { path: 'user/:id', component: UserProfileComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, adminGuard], // Protected
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', loadComponent: () => import('./dashboard/users/dashboard-users.component').then(m => m.DashboardUsersComponent) },
      { path: 'reports', loadComponent: () => import('./dashboard/reports/dashboard-reports.component').then(m => m.DashboardReportsComponent) }
    ]
  },


  // Error Routes
  { path: 'error', loadComponent: () => import('./pages/error/error.component').then(m => m.ErrorComponent) },
  { path: 'unauthorized', redirectTo: 'error?code=403', pathMatch: 'full' },

  // Fallback route (Redirect to 404 Error Page)
  { path: '**', redirectTo: 'error?code=404' }
];