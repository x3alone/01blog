import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserProfileService, UserProfileDto } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html', // Pointing to the separate HTML file
  styleUrl: './user-profile.component.scss'     // Pointing to the separate SCSS file
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(UserProfileService);
  private authService = inject(AuthService);

  profile = signal<UserProfileDto | null>(null);
  isLoading = signal(true);
  isOwnProfile = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const userId = Number(params.get('id'));
      if (userId) {
        this.loadProfile(userId);
      }
    });
  }

  loadProfile(userId: number) {
    this.isLoading.set(true);
    this.profileService.getProfile(userId).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.isLoading.set(false);
        this.checkIfOwnProfile(data.username);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoading.set(false);
      }
    });
  }

  checkIfOwnProfile(profileUsername: string) {
    const currentUsername = this.authService.getUsername();
    this.isOwnProfile.set(currentUsername === profileUsername);
  }

  toggleFollow() {
    const p = this.profile();
    if (!p) return;

    if (p.isFollowedByCurrentUser) {
      // Logic for Unfollow
      this.profileService.unfollowUser(p.id).subscribe(() => {
        // Optimistically update UI
        this.profile.update(curr => curr ? { 
          ...curr, 
          isFollowedByCurrentUser: false, 
          followersCount: curr.followersCount - 1 
        } : null);
      });
    } else {
      // Logic for Follow
      this.profileService.followUser(p.id).subscribe(() => {
        // Optimistically update UI
        this.profile.update(curr => curr ? { 
          ...curr, 
          isFollowedByCurrentUser: true, 
          followersCount: curr.followersCount + 1 
        } : null);
      });
    }
  }
}