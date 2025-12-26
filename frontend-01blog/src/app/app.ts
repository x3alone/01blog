import { Component, OnInit, inject, signal, computed, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { NotificationService, BlogNotification } from './services/notification.service';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, HttpClientModule, RouterModule, ToastComponent, ConfirmationModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = '01blog';
  public authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  // Layout Signals
  loggedIn = signal(false);
  currentUsername = signal('');
  currentUserId = signal<number | null>(null);
  currentUserAvatar = signal<string | null>(null);

  // Notification Signals
  notifications = signal<BlogNotification[]>([]);
  unreadCount = signal(0);
  showNotifications = signal(false);

  ngOnInit() {
    this.authService.authState$.subscribe(() => {
      this.checkLoginStatus();
    });
  }

  checkLoginStatus() {
    if (this.authService.isAuthenticated()) {
      this.loggedIn.set(true);
      this.currentUsername.set(this.authService.getUsername() || '');
      this.currentUserId.set(this.authService.getCurrentUserId());
      this.currentUserAvatar.set(this.authService.getUserAvatar());

      // Load Notifications
      this.loadNotifications();
      this.loadUnreadCount();
    } else {
      this.loggedIn.set(false);
      this.currentUserId.set(null);
      this.currentUserAvatar.set(null);
      this.notifications.set([]);
      this.unreadCount.set(0);
    }
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  // Grouped Notification Type
  groupedNotifications = signal<any[]>([]);

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.processNotifications(data);
      },
      error: (e) => console.error('Failed to load notifications', e)
    });
  }

  processNotifications(data: BlogNotification[]) {
    // Sort by createdAt desc
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Update notifications signal with all notifications (no grouping, no limit)
    this.notifications.set(data);
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count),
      error: (e) => console.error('Failed to count unread', e)
    });
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) {
      // Load and Mark as Read
      this.loadNotifications();
      this.notificationService.markAllAsRead().subscribe({
        next: () => {
          this.unreadCount.set(0); // Clear badge immediately
        },
        error: (e) => console.error('Failed to mark read', e)
      });
    }
  }

  // Listen for clicks to close dropdown
  private eRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.showNotifications()) {
      const target = event.target as HTMLElement;
      // Close if click is outside .notif-wrapper (which contains both button and dropdown)
      if (!target.closest('.notif-wrapper')) {
        this.showNotifications.set(false);
      }
    }
  }

  logout() {
    this.authService.logout();
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }
}