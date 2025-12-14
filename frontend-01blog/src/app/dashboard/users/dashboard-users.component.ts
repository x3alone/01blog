import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserService, User } from '../../services/admin-user.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmationService } from '../../services/confirmation.service';
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
            
            @if (isAdmin()) {
            <button 
              (click)="toggleRole(user)" 
              class="action-btn"
              [class.promote-btn]="user.role !== 'ADMIN'"
              [class.demote-btn]="user.role === 'ADMIN'"
              [disabled]="user.id === currentUserId"
              [style.opacity]="user.id === currentUserId ? '0.5' : '1'"
              [style.cursor]="user.id === currentUserId ? 'not-allowed' : 'pointer'"
            >
              {{ user.role === 'ADMIN' ? 'Demote' : 'Promote' }}
            </button>
            
            <button 
              (click)="toggleBan(user)" 
              class="action-btn ban-toggle-btn"
              [class.ban-btn]="!user.banned"
              [class.promote-btn]="user.banned" 
              style="margin-left: 5px;"
              [disabled]="user.id === currentUserId"
              [style.opacity]="user.id === currentUserId ? '0.5' : '1'"
              [style.cursor]="user.id === currentUserId ? 'not-allowed' : 'pointer'"
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
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

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
      error: (err) => {
        console.error("Failed to load users:", err);
        this.toastService.show("Failed to load users.", 'error');
      }
    });
  }

  isAdmin(): boolean {
    return this.currentUserRole === 'ADMIN';
  }

  isSelfOrHeigher(target: User): boolean {
    // Self or Super Admin (ID 1)
    return target.id === this.currentUserId || target.id === 1;
  }

  toggleRole(user: User) {
    if (user.id === this.currentUserId) return;

    const newRole: 'USER' | 'ADMIN' = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    const action = newRole === 'ADMIN' ? 'Promote' : 'Demote';

    this.confirmationService.confirm(`${action} this user to ${newRole}?`, `${action} User`)
      .subscribe(confirmed => {
        if (confirmed) {
          const action$ = newRole === 'ADMIN'
            ? this.adminUserService.updateUserRole(user.id, newRole)
            : this.adminUserService.demoteUser(user.id);

          action$.subscribe({
            next: () => {
              this.users.update(currentUsers =>
                currentUsers.map(u => (u.id === user.id ? { ...u, role: newRole } : u))
              );
              this.toastService.show(`User ${action.toLowerCase()}d successfully.`, 'success');
            },
            error: (err) => this.toastService.show("Failed to change role: " + (err.error?.message || err.message), 'error')
          });
        }
      });
  }

  toggleBan(user: User) {
    if (user.id === this.currentUserId) return;

    const action = user.banned ? 'Unban' : 'Ban';

    this.confirmationService.confirm(`${action} this user?`, `${action} User`)
      .subscribe(confirmed => {
        if (confirmed) {
          this.adminUserService.toggleBan(user.id).subscribe({
            next: () => {
              this.users.update(currentUsers =>
                currentUsers.map(u => (u.id === user.id ? { ...u, banned: !u.banned } : u))
              );
              this.toastService.show(`User ${action.toLowerCase()}ned successfully.`, 'success');
            },
            error: (err) => this.toastService.show("Failed to change ban status: " + (err.error?.message || err.message), 'error')
          });
        }
      });
  }
}
