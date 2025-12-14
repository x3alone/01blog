import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { NotificationService, BlogNotification } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, HttpClientModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = '01blog';
  public authService = inject(AuthService);
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
    const groups: any[] = [];
    const map = new Map<string, BlogNotification[]>();

    // Group by Type + RelatedId
    data.forEach(n => {
      const key = `${n.type}-${n.relatedId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(n);
    });

    map.forEach((list, key) => {
      const latest = list[0];
      const count = list.length;

      if (count === 1) {
        groups.push(latest);
      } else {
        // Create a summary notification
        let message = '';
        const actorName = latest.actor ? latest.actor.username : 'Someone';

        if (latest.type === 'COMMENT') {
          message = `${actorName} and ${count - 1} others commented on your post.`;
        } else if (latest.type === 'FOLLOW') {
          message = `${actorName} and ${count - 1} others started following you.`;
        } else if (latest.type === 'LIKE') {
          message = `${actorName} and ${count - 1} others liked your post.`;
        } else {
          message = `${count} new notifications regarding ${latest.type.toLowerCase()}.`;
        }

        groups.push({
          ...latest,
          message: message, // Override message
          isGroup: true,
          count: count
        });
      }
    });

    // Sort by createdAt desc
    groups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Take max 5 groups if needed, user said "max 5 notification line"
    // But maybe they meant max 5 lines visible, scroll for more.
    // "so by max i get 5 notification line in that toggle drop drown i have"
    // I will limit the display to 5 items for now.
    this.notifications.set(groups.slice(0, 5));
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

  logout() {
    this.authService.logout();
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }
}