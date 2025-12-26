import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ActivatedRoute } from '@angular/router';
import { UserProfileService, UserProfileDto } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';
import { PostService } from '../services/post.service'; // Import PostService

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
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

  isEditing = signal(false);
  editForm = signal({ aboutMe: '', avatarUrl: '' });

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
    this.postService.getPostsByUserId(userId, 0, 100).subscribe({
      next: (page: any) => { // using any to avoid import issues or strict typing on Page interface here if not imported
        this.posts.set(page.content);
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


  startEdit() {
    const p = this.profile();
    if (p) {
      this.editForm.set({
        aboutMe: p.aboutMe || '',
        avatarUrl: p.avatarUrl || ''
      });
      this.isEditing.set(true);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  saveEdit() {
    this.profileService.updateProfile(this.editForm()).subscribe({
      next: (updatedUser: any) => { // Backend returns User
        const newAvatarUrl = this.editForm().avatarUrl;

        this.profile.update(curr => curr ? {
          ...curr,
          aboutMe: this.editForm().aboutMe,
          avatarUrl: newAvatarUrl
        } : null);

        // Update local persistence if this is the own profile
        if (this.isOwnProfile()) {
          this.authService.updateCurrentUser(newAvatarUrl);
        }

        this.isEditing.set(false);
      },
      error: (err) => console.error('Failed to update profile', err)
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.profileService.uploadAvatar(file).subscribe({
        next: (res: any) => {
          const url = res.secure_url || res.url;
          this.editForm.update(curr => ({ ...curr, avatarUrl: url }));
        },
        error: (err) => console.error('Avatar upload failed', err)
      });
    }
  }
}