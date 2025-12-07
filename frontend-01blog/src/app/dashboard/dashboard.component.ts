import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserService, User } from '../services/admin-user.service'; // Import the new service
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

  users = signal<User[]>([]);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // Fetch real data from the backend
    this.adminUserService.getAllUsers().subscribe({
        next: (data) => this.users.set(data),
        error: (err) => console.error("Failed to load users:", err)
    });
  }

  toggleRole(user: User) {
    const newRole: 'USER' | 'ADMIN' = user.role === 'ADMIN' ? 'USER' : 'ADMIN';

    // Call the backend API
    // NOTE: If promoting, your existing backend Promote method works. 
    // If demoting, you need a Demote method in your Spring Service/Controller.
    this.adminUserService.updateUserRole(user.id, newRole).subscribe({
        next: () => {
            // Optimistically update the local signal on success
            this.users.update(currentUsers =>
                currentUsers.map(u => (u.id === user.id ? { ...u, role: newRole } : u))
            );
        },
        error: (err) => alert("Failed to change role: " + err.message)
    });
  }

  toggleBan(user: User) {
    this.adminUserService.toggleBan(user.id).subscribe({
        next: () => {
            // Optimistically update the local signal
            this.users.update(currentUsers =>
                currentUsers.map(u => (u.id === user.id ? { ...u, isBanned: !u.isBanned } : u))
            );
        },
        error: (err) => alert("Failed to change ban status: " + err.message)
    });
  }
}