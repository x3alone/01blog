import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserService, User } from '../services/admin-user.service'; // Import the new service
import { AuthService } from '../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Added RouterLink for potential navigation to user profiles
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
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
    // Fetch real data from the backend
    this.adminUserService.getAllUsers().subscribe({
      next: (data) => this.users.set(data),
      error: (err) => console.error("Failed to load users:", err)
    });
  }

  canPromote(target: User): boolean {
    // 1. Only Admins can promote
    if (this.currentUserRole !== 'ADMIN') return false;
    // 2. Can't promote/demote Super Admin (ID 1)
    if (target.id === 1) return false;
    // 3. Can't promote/demote Self
    if (target.id === this.currentUserId) return false;

    // 4. "Demotion" Logic:
    // If target is already ADMIN:
    if (target.role === 'ADMIN') {
      // Only Super Admin (ID 1) can demote other Admins
      return this.currentUserId === 1;
    }

    return true; // Can promote (USER -> ADMIN)
  }

  canBan(target: User): boolean {
    // 1. Only Admins
    if (this.currentUserRole !== 'ADMIN') return false;
    // 2. Can't ban Super Admin
    if (target.id === 1) return false;
    // 3. Can't ban Self
    if (target.id === this.currentUserId) return false;
    // 4. If target is ADMIN, only Super Admin can ban them
    if (target.role === 'ADMIN') {
      return this.currentUserId === 1;
    }

    return true;
  }

  toggleRole(user: User) {
    if (!this.canPromote(user)) return;

    const newRole: 'USER' | 'ADMIN' = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

    // Decide which API method to call
    const action$ = newRole === 'ADMIN'
      ? this.adminUserService.updateUserRole(user.id, newRole) // Promote
      : this.adminUserService.demoteUser(user.id); // Demote (Need to ensure AdminUserService has this)

    action$.subscribe({
      next: () => {
        // Optimistically update
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