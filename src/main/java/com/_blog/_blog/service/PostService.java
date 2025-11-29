package com._blog._blog.service;

import com._blog._blog.dto.CreatePostRequest;
import com._blog._blog.dto.PostResponse;
import com._blog._blog.model.Post;
import com._blog._blog.model.User;
import com._blog._blog.repository.PostRepository;
import com._blog._blog.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a new post for the currently authenticated user.
     */
    @Transactional
    public PostResponse createPost(CreatePostRequest request) {
        // 1. Get the username of the currently authenticated user from the Security Context
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Fetch the full User object to link the post
        // Use IllegalStateException for unexpected security issues
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database. Cannot create post."));

        // 3. Create and populate the Post entity
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setUser(user);

        // 4. Save to database
        post = postRepository.save(post);
        
        // 5. Convert to DTO and return
        return mapToDto(post);
    }

    /**
     * Retrieves all posts, ordered by creation date (newest first).
     */
    @Transactional(readOnly = true)
    public List<PostResponse> getAllPosts() {
        // This method is now publicly accessible via SecurityConfig
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to map Post entity to PostResponse DTO.
     */
    private PostResponse mapToDto(Post post) {
        return new PostResponse(
            post.getId(),
            post.getTitle(),
            post.getContent(),
            post.getUser().getUsername(), // Safely get username from the associated User
            post.getCreatedAt()
        );
    }
}