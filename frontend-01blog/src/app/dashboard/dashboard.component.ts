import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="dashboard-shell">
      <h2 class="dashboard-title">Admin Dashboard</h2>

      <div class="dashboard-nav">
        <a routerLink="users" routerLinkActive="active" class="nav-tab">Manage Users</a>
        <a routerLink="reports" routerLinkActive="active" class="nav-tab">Reported Posts</a>
      </div>

      <div class="dashboard-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent { }