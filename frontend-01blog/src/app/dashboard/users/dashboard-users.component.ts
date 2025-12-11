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
    <div class="user-list-container">
      @for (user of users(); track user.id) {
        <div class="user-item">
          <div class="user-info">
            <a [routerLink]="['/profile', user.id]" class="username-text hover:text-indigo-400 transition">
               {{ user.username }}
            </a>
            <p class="role-text">Role: {{ user.role }}</p>
          </div>
          
          <div class="action-buttons-group">
            
            <button 
              (click)="toggleRole(user)" 
              class="action-button role-toggle-btn"
              [class.promoted]="user.role === 'ADMIN'"
            >
              {{ user.role === 'ADMIN' ? 'Demote' : 'Promote' }}
            </button>

            <button 
              (click)="toggleBan(user)" 
              class="action-button ban-toggle-btn"
              [class.banned]="user.isBanned"
            >
              {{ user.isBanned ? 'Unban' : 'Ban' }}
            </button>
          </div>
        </div>
      }
    </div>

    @if (users().length === 0) {
      <div class="no-users-message">
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
        if (target.id === 1) return false;
        if (target.id === this.currentUserId) return false;
        if (target.role === 'ADMIN') {
            return this.currentUserId === 1;
        }
        return true;
    }

    canBan(target: User): boolean {
        if (this.currentUserRole !== 'ADMIN') return false;
        if (target.id === 1) return false;
        if (target.id === this.currentUserId) return false;
        if (target.role === 'ADMIN') {
            return this.currentUserId === 1;
        }
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
                    currentUsers.map(u => (u.id === user.id ? { ...u, isBanned: !u.isBanned } : u))
                );
            },
            error: (err) => alert("Failed to change ban status: " + (err.error?.message || err.message))
        });
    }
}
