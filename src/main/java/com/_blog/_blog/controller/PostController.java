package com._blog._blog.controller;

import com._blog._blog.dto.CreatePostRequest;
import com._blog._blog.dto.PostResponse;
import com._blog._blog.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid; // Added for DTO validation

import java.util.List;

@RestController
@RequestMapping("/api/posts") // Base path for all post operations
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    /**
     * Endpoint to create a new post. Requires JWT authentication.
     */
    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody CreatePostRequest createPostRequest) {
        PostResponse newPost = postService.createPost(createPostRequest);
        return new ResponseEntity<>(newPost, HttpStatus.CREATED);
    }

    /**
     * Endpoint to get all posts. Requires JWT authentication.
     */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        List<PostResponse> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }
}