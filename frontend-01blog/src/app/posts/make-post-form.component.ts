import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PostService, CreatePostRequest, Post } from '../services/post.service';

@Component({
  selector: 'app-make-post-form',
  standalone: true,
  // Imports must be explicitly listed
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 border border-gray-700">
        <h2 class="text-xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">What's on your mind?</h2>

        <!-- Reactive Form: Binds to postForm FormGroup and calls submitPost() on submission -->
        <form [formGroup]="postForm" (ngSubmit)="submitPost()" class="space-y-4">

            <!-- Title Input -->
            <div>
                <input
                    id="title"
                    type="text"
                    formControlName="title"
                    placeholder="Title (Keep it short and catchy!)"
                    class="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-lg py-2 px-4 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 placeholder-gray-400"
                    maxlength="80"
                />
                <!-- Validation Feedback for Title -->
                @if (postForm.get('title')?.invalid && (postForm.get('title')?.dirty || postForm.get('title')?.touched)) {
                    <p class="mt-1 text-sm text-red-400">
                        @if (postForm.get('title')?.errors?.['required']) {
                            Title is required.
                        }
                        @if (postForm.get('title')?.errors?.['maxlength']) {
                            Title cannot exceed 80 characters.
                        }
                    </p>
                }
            </div>

            <!-- Content/Body Textarea -->
            <div>
                <textarea
                    id="content"
                    formControlName="content"
                    placeholder="Share your thoughts, articles, or insights here..."
                    rows="4"
                    class="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-lg py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 placeholder-gray-400 resize-none"
                    maxlength="1000"
                ></textarea>
                <!-- Validation Feedback for Content -->
                @if (postForm.get('content')?.invalid && (postForm.get('content')?.dirty || postForm.get('content')?.touched)) {
                    <p class="mt-1 text-sm text-red-400">
                        @if (postForm.get('content')?.errors?.['required']) {
                            Content is required.
                        }
                        @if (postForm.get('content')?.errors?.['maxlength']) {
                            Content cannot exceed 1000 characters.
                        }
                    </p>
                }
            </div>

            <!-- Submission Feedback & Button -->
            <div class="flex flex-col sm:flex-row justify-between items-center pt-2">

                <!-- Submission Status Message -->
                @if (submitStatus() && !isLoading()) {
                    <p [ngClass]="{'text-green-400': !isError(), 'text-red-400': isError()}"
                       class="text-sm font-medium mb-2 sm:mb-0">
                        {{ submitStatus() }}
                    </p>
                }

                <!-- Submit Button -->
                <button
                    type="submit"
                    [disabled]="!postForm.valid || isLoading()"
                    class="w-full sm:w-auto px-6 py-2 rounded-full font-bold transition duration-300 shadow-lg
                           text-white
                           bg-indigo-600 hover:bg-indigo-500
                           disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    @if (isLoading()) {
                        <div class="flex items-center">
                            <svg class="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Publishing...
                        </div>
                    } @else {
                        Publish Article
                    }
                </button>
            </div>

        </form>
    </div>
  `
})
export class MakePostFormComponent { // <-- EXPORT is here
  private fb = inject(FormBuilder);
  private postService = inject(PostService);

  // Output event to notify the parent component (AppComponent) that a post was created
  @Output() postCreated = new EventEmitter<Post>();

  // State signals
  isLoading = signal(false);
  submitStatus = signal<string | null>(null);
  isError = signal(false);

  // Reactive Form Group
  postForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    content: ['', [Validators.required, Validators.maxLength(1000)]]
  });

  /**
   * Handles the submission of the new post.
   */
  submitPost() {
    this.submitStatus.set(null);
    this.isError.set(false);

    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      this.submitStatus.set('Please fill out the required fields.');
      this.isError.set(true);
      return;
    }

    this.isLoading.set(true);

    const request: CreatePostRequest = this.postForm.value;

    this.postService.createPost(request).subscribe({
      next: (post) => {
        this.submitStatus.set('Post created successfully!');
        this.isError.set(false);
        this.isLoading.set(false);
        this.postForm.reset();

        // Emit the created post to the parent to trigger a feed refresh
        this.postCreated.emit(post);

        // Clear the success message after a delay
        setTimeout(() => this.submitStatus.set(null), 3000);
      },
      error: (err) => {
        console.error('Post creation failed:', err);
        this.submitStatus.set(err.error?.message || 'Failed to publish article. Check backend connection.');
        this.isError.set(true);
        this.isLoading.set(false);
      }
    });
  }
}