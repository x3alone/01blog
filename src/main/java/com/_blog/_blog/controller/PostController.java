package com._blog._blog.controller;

import com._blog._blog.dto.CreatePostRequest;
import com._blog._blog.dto.PostResponse;
import com._blog._blog.service.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/posts") // Base path: http://localhost:8080/api/posts
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    /**
     * Endpoint to create a new post.
     * URL: POST http://localhost:8080/api/posts
     */
    @PostMapping // REMOVED ("/get") to make it standard REST
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody CreatePostRequest createPostRequest) {
        System.out.println("Received create post request: " + createPostRequest.getTitle());
        PostResponse newPost = postService.createPost(createPostRequest);
        return new ResponseEntity<>(newPost, HttpStatus.CREATED);
    }

    /**
     * Endpoint to get all posts.
     * URL: GET http://localhost:8080/api/posts
     */
    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        List<PostResponse> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }
}