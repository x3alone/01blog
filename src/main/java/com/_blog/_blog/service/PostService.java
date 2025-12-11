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
import com._blog._blog.dto.UpdatePostRequest; // Import the new DTO
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

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
     * Updates a post. Only the author can update their post.
     */
    @Transactional
    public PostResponse updatePost(Long id, UpdatePostRequest request) {
        // 1. Find the post
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // 2. Get current user
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // 3. Check permission: ONLY the author can edit
        if (!post.getUser().getUsername().equals(currentUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to edit this post");
        }

        // 4. Update fields
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        // 5. Save and return
        Post updatedPost = postRepository.save(post);
        return mapToDto(updatedPost);
    }

    /**
     * Deletes a post. The author OR an Admin can delete.
     */
    @Transactional
    public void deletePost(Long id) {
        // 1. Find the post
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // 2. Get current user details
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // 3. Check permission: Author OR Admin
        if (!post.getUser().getUsername().equals(currentUsername) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this post");
        }

        // 4. Delete
        postRepository.delete(post);
    }

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