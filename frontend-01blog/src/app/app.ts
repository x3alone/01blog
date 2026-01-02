import {
  Component,
  OnInit,
  inject,
  signal,
  HostListener,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NotificationService, BlogNotification } from './services/notification.service';
import { ToastComponent } from './components/toast/toast.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterModule, ToastComponent, ConfirmationModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = '01blog';
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private eRef = inject(ElementRef);

  // Layout signals
  loggedIn = signal(false);
  currentUsername = signal('');
  currentUserId = signal<number | null>(null);
  currentUserAvatar = signal<string | null>(null);

  // Notifications
  notifications = signal<BlogNotification[]>([]);
  unreadCount = signal(0);
  showNotifications = signal(false);

  ngOnInit() {
    this.authService.authState$.subscribe(() => this.checkLoginStatus());
  }

  checkLoginStatus() {
    if (this.authService.isAuthenticated() && !this.authService.isBanned()) {
      this.loggedIn.set(true);
      this.currentUsername.set(this.authService.getUsername() || '');
      this.currentUserId.set(this.authService.getCurrentUserId());
      this.currentUserAvatar.set(this.authService.getUserAvatar());
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
    return this.authService.isAdmin();
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (data) =>
        this.notifications.set(
          data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        )
    });
  }

  loadUnreadCount() {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => this.unreadCount.set(count)
    });
  }

  toggleNotifications() {
    this.showNotifications.update((v) => !v);
    if (this.showNotifications()) {
      this.loadNotifications();
      this.notificationService.markAllAsRead().subscribe({ next: () => this.unreadCount.set(0) });
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.showNotifications()) {
      const target = event.target as HTMLElement;
      if (!target.closest('.notif-wrapper')) this.showNotifications.set(false);
    }
  }

  logout() {
    this.authService.logout();
    this.loggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
