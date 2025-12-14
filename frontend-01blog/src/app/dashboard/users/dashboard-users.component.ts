import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserService, User } from '../../services/admin-user.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="data-list">
      @for (user of users(); track user.id) {
        <div class="list-item">
          <div class="item-info">
            <a [routerLink]="['/profile', user.id]" class="main-text hover:text-indigo-400 transition" style="text-decoration: none;">
               {{ user.username }}
            </a>
            <p class="sub-text">Role: {{ user.role }}</p>
          </div>
          
          <div class="actions" style="display: flex; gap: 10px;">
            
            @if (canPromote(user)) {
            <button 
              (click)="toggleRole(user)" 
              class="action-btn"
              [class.promote-btn]="user.role !== 'ADMIN'"
              [class.demote-btn]="user.role === 'ADMIN'"
            >
              {{ user.role === 'ADMIN' ? 'Demote' : 'Promote' }}
            </button>
            }

            @if (canBan(user)) {
            <button 
              (click)="toggleBan(user)" 
              class="action-btn ban-toggle-btn"
              [class.ban-btn]="!user.banned"
              [class.promote-btn]="user.banned" 
              style="margin-left: 5px;"
            >
              {{ user.banned ? 'Unban' : 'Ban' }}
            </button>
            }
          </div>
        </div>
      }
    </div>

    @if (users().length === 0) {
      <div class="no-users-message" style="text-align: center; color: #fff; margin-top: 20px;">
        No users found in the system.
      </div>
    }
  `,
  styleUrls: ['../dashboard.component.scss'] // Re-use styles
})
export class DashboardUsersComponent implements OnInit {
  private adminUserService = inject(AdminUserService);
  private authService = inject(AuthService);

  users = signal<User[]>([]);
  currentUserId: number | null = null;
  currentUserRole: string | null = null;

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId();
    this.currentUserRole = this.authService.getUserRole();
    this.loadUsers();
  }

  loadUsers() {
    this.adminUserService.getAllUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error("Failed to load users:", err)
    });
  }

  canPromote(target: User): boolean {
    if (this.currentUserRole !== 'ADMIN') return false;
    // Cannot promote/demote self
    if (target.id === this.currentUserId) return false;
    // Cannot act on Super Admin (ID 1)
    if (target.id === 1) return false;

    // Can promote any USER to ADMIN
    // Can demote any ADMIN (except ID 1) to USER
    return true;
  }

  canBan(target: User): boolean {
    if (this.currentUserRole !== 'ADMIN') return false;
    // Cannot ban self
    if (target.id === this.currentUserId) return false;
    // Cannot ban Super Admin
    if (target.id === 1) return false;

    return true;
  }

  toggleRole(user: User) {
    if (!this.canPromote(user)) return;

    const newRole: 'USER' | 'ADMIN' = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const action$ = newRole === 'ADMIN'
      ? this.adminUserService.updateUserRole(user.id, newRole)
      : this.adminUserService.demoteUser(user.id);

    action$.subscribe({
      next: () => {
        this.users.update(currentUsers =>
          currentUsers.map(u => (u.id === user.id ? { ...u, role: newRole } : u))
        );
      },
      error: (err) => alert("Failed to change role: " + (err.error?.message || err.message))
    });
  }

  toggleBan(user: User) {
    if (!this.canBan(user)) return;

    this.adminUserService.toggleBan(user.id).subscribe({
      next: () => {
        this.users.update(currentUsers =>
          currentUsers.map(u => (u.id === user.id ? { ...u, banned: !u.banned } : u))
        );
      },
      error: (err) => alert("Failed to change ban status: " + (err.error?.message || err.message))
    });
  }
}
