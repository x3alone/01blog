package com._blog._blog.controller;

import com._blog._blog.dto.CreatePostRequest;
import com._blog._blog.dto.PostResponse;
import com._blog._blog.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Page;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    
    // Create Post with optional Image/Video
     // USES: Multipart form data (not JSON body directly)
     
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        // Manually build the DTO from params
        CreatePostRequest request = new CreatePostRequest();
        request.setTitle(title);
        request.setContent(content);

        // Call the NEW method in PostService
        PostResponse newPost = postService.createPostWithMedia(request, file);
        
        return new ResponseEntity<>(newPost, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "removeMedia", required = false, defaultValue = "false") boolean removeMedia
    ) {
        // Manually build/pass params to service
        // (Alternatively, could update PostService to take these raw params or a new DTO)
        // For simplicity/consistency with createPost, passing to new/updated service method
        
        PostResponse updatedPost = postService.updatePostWithMedia(id, title, content, file, removeMedia);

        return ResponseEntity.ok(updatedPost);
    }

    @PutMapping("/{id}/hide")
    public ResponseEntity<Void> toggleHide(@PathVariable Long id) {
        postService.toggleHide(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> toggleLike(@PathVariable Long id) {
        postService.toggleLike(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<PostResponse> posts = postService.getAllPosts(page, size);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostResponse>> getPostsByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<PostResponse> posts = postService.getPostsByUserId(userId, page, size);
        return ResponseEntity.ok(posts);
    }
}