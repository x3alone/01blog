import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UserProfileService, UserProfileDto } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';
import { PostService } from '../services/post.service'; // Import PostService

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './user-profile.component.html', // Pointing to the separate HTML file
  styleUrl: './user-profile.component.scss'     // Pointing to the separate SCSS file
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private profileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private postService = inject(PostService); // Inject PostService

  profile = signal<UserProfileDto | null>(null);
  posts = signal<any[]>([]); // Store user posts here
  isLoading = signal(true);
  isOwnProfile = signal(false);

  // Helper signals for template
  currentUser = signal<string>('');

  ngOnInit() {
    const username = this.authService.getUsername();
    this.currentUser.set(username || '');

    this.route.paramMap.subscribe(params => {
      const userId = Number(params.get('id'));
      if (userId) {
        this.loadProfile(userId);
        this.loadUserPosts(userId);
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

  loadUserPosts(userId: number) {
    // Temporary: Fetch all posts and filter (Backend should ideally have getPostsByUser)
    this.postService.getAllPosts().subscribe({
      next: (allPosts) => {
        // Filter posts where userId matches
        const userPosts = allPosts.filter(p => p.userId === userId);
        this.posts.set(userPosts);
      },
      error: (err) => console.error('Failed to load posts', err)
    });
  }

  checkIfOwnProfile(profileUsername: string) {
    const currentUsername = this.authService.getUsername();
    this.isOwnProfile.set(currentUsername === profileUsername);
  }

  // Template Helpers
  profileId() {
    return this.profile()?.id;
  }

  isFollowing(): boolean {
    return this.profile()?.isFollowedByCurrentUser ?? false;
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