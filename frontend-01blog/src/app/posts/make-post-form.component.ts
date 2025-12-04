import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../services/post.service';
import { Router } from '@angular/router'; // NEW IMPORT

@Component({
  selector: 'app-make-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700">
      <h2 class="text-xl font-semibold text-indigo-400 mb-4">Create a New Post</h2>
      <form (ngSubmit)="submitPost()">
        <div class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-400 mb-1">Title</label>
            <input
              id="title"
              type="text"
              [(ngModel)]="title"
              name="title"
              required
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label for="content" class="block text-sm font-medium text-gray-400 mb-1">Content</label>
            <textarea
              id="content"
              [(ngModel)]="content"
              name="content"
              rows="5"
              required
              class="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
        </div>
        
        <button
          type="submit"
          [disabled]="loading()"
          class="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md transition duration-300 disabled:opacity-50"
        >
          {{ loading() ? 'Posting...' : 'Publish Post' }}
        </button>
      </form>
    </div>
  `,
})
export class MakePostFormComponent {
  private postService = inject(PostService);
  private router = inject(Router); // NEW INJECTION

  title = '';
  content = '';
  loading = signal(false);

  // We no longer need the postCreated output, we use the Router instead.
  // postCreated = output<void>(); 

  submitPost() {
    this.loading.set(true);
    this.postService.createPost({ title: this.title, content: this.content }).subscribe({
      next: () => {
        this.loading.set(false);
        this.title = '';
        this.content = '';
        // FIX: Navigate back to the home page after creation
//         this.router.navigate(['/home']); 
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Post creation failed:', err);
        // If the error is 403 (Forbidden), we could redirect to login here
      }
    });
  }
}