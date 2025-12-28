package com._blog._blog.service;

import com._blog._blog.dto.CreatePostRequest;
import com._blog._blog.dto.PostResponse;
import com._blog._blog.dto.UpdatePostRequest;
import com._blog._blog.model.Post;
import com._blog._blog.model.User;
import com._blog._blog.repository.PostRepository;
import com._blog._blog.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile; // IMPORTANT: Need this import
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException; // IMPORTANT: Need this import
import java.util.List;
import java.util.Map; // IMPORTANT: Need this import
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MediaService mediaService;
    private final NotificationService notificationService;

    public PostService(PostRepository postRepository, UserRepository userRepository, MediaService mediaService, NotificationService notificationService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.mediaService = mediaService;
        this.notificationService = notificationService;
    }

    // ... (rest of methods unchanged until toggleLike) ...
    // Note: I will use a larger replacement chunk or carefully target toggleLike + Constructor if they are far apart.
    // Since I can't easily jump around, I will do constructor first, then toggleLike in separate call if needed. 
    // Wait, replacing constructor and field definition first.




    // RENAMED and IMPLEMENTED method to match PostController
    @Transactional
    public PostResponse createPostWithMedia(CreatePostRequest request, MultipartFile file) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found."));

        // 1. Create Post Object
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setUser(user);
        
        // Ensure new fields are initialized to null/default before save
        post.setMediaUrl(null);
        post.setPublicId(null);
        post.setMediaType(null);

        // 2. Save first to generate the Post ID (needed for naming)
        Post savedPost = postRepository.save(post);

        // 3. Handle File Upload if exists
        if (file != null && !file.isEmpty()) {
            try {
                // Naming pattern: user{id}_post{id}_{timestamp}
                String customName = "user" + user.getId() + "_post" + savedPost.getId() + "_" + System.currentTimeMillis();
                
                // Upload to "01blog/posts" folder
                Map uploadResult = mediaService.uploadFile(file, "01blog/posts", customName);
                
                // 4. Update Post with Cloudinary Data
                savedPost.setMediaUrl((String) uploadResult.get("secure_url"));
                savedPost.setPublicId((String) uploadResult.get("public_id"));
                savedPost.setMediaType((String) uploadResult.get("resource_type")); 
                
                // Save again with media info
                savedPost = postRepository.save(savedPost);
            } catch (IOException e) {
                // Log and throw a controlled error
                System.err.println("Cloudinary Upload Error: " + e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload media");
            }
        }

        return mapToDto(savedPost);
    }
    
    // DELETE METHOD: Updated to handle media deletion
    @Transactional
    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!post.getUser().getUsername().equals(currentUsername) && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this post");
        }
        
        // 1. Delete media for ALL comments associated with this post
        for (com._blog._blog.model.Comment comment : post.getComments()) {
            if (comment.getPublicId() != null && !comment.getPublicId().isEmpty()) {
                try {
                    mediaService.deleteFile(comment.getPublicId());
                } catch (IOException e) {
                    System.err.println("Warning: Failed to delete media for Comment ID: " + comment.getId());
                }
            }
        }

        // 2. Delete media for the post itself
        if (post.getPublicId() != null && !post.getPublicId().isEmpty()) {
            try {
                mediaService.deleteFile(post.getPublicId());
            } catch (IOException e) {
                // Log the failure, but still delete the DB record
                System.err.println("Warning: Failed to delete media from Cloudinary for Post ID: " + id + ". Error: " + e.getMessage());
            }
        }

        postRepository.delete(post);
    }
    @Transactional
    public void toggleHide(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can hide posts");
        }
        
        post.setHidden(!post.isHidden());
        postRepository.save(post);
    }

    // Existing updatePost method...
    // Updated updatePost method to handle media
    @Transactional
    public PostResponse updatePostWithMedia(Long id, String title, String content, MultipartFile file, boolean removeMedia) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!post.getUser().getUsername().equals(currentUsername)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to edit this post");
        }

        // 1. Handle Media Removal or Replacement
        if (removeMedia || (file != null && !file.isEmpty())) {
            // If there's existing media, delete it from Cloudinary
            if (post.getPublicId() != null && !post.getPublicId().isEmpty()) {
                try {
                    mediaService.deleteFile(post.getPublicId());
                } catch (IOException e) {
                    System.err.println("Warning: Failed to delete old media: " + e.getMessage());
                }
                // Clear fields
                post.setMediaUrl(null);
                post.setPublicId(null);
                post.setMediaType(null);
            }
        }

        // 2. Handle New File Upload
        if (file != null && !file.isEmpty()) {
            try {
                String customName = "user" + post.getUser().getId() + "_post" + post.getId() + "_" + System.currentTimeMillis();
                Map uploadResult = mediaService.uploadFile(file, "01blog/posts", customName);
                
                post.setMediaUrl((String) uploadResult.get("secure_url"));
                post.setPublicId((String) uploadResult.get("public_id"));
                post.setMediaType((String) uploadResult.get("resource_type"));
            } catch (IOException e) {
                 throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload new media");
            }
        }

        // 3. Update Text Content
        post.setTitle(title);
        post.setContent(content);

        Post updatedPost = postRepository.save(post);
        return mapToDto(updatedPost);
    }
    

    // Existing createPost method (without media) should be REMOVED or MODIFIED, 
    // as it is redundant and can cause confusion. Since the Controller uses the new method, 
    // we can remove the old one:
    /* REMOVE THIS METHOD:
    @Transactional
    public PostResponse createPost(CreatePostRequest request) { ... }
    */

 /**
     * Retrieves all posts, ordered by creation date (newest first).
     */
    // Updated getAllPosts to support pagination
    @Transactional(readOnly = true)
    public Page<PostResponse> getAllPosts(int page, int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String currentUsername = (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) ? auth.getName() : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postsPage;

        if (isAdmin) {
            postsPage = postRepository.findAll(pageable);
        } else if (currentUsername != null) {
            // Logged in user: See public posts OR their own hidden posts
            // We need to use a query that handles this OR condition cleanly
            // The derived query findByHiddenFalseOrUserUsername... should work if naming is correct
            // But verify sort precedence. passing pageable with sort is safest.
            postsPage = postRepository.findByHiddenFalseOrUserUsernameOrderByCreatedAtDesc(currentUsername, pageable);
        } else {
            // Guest: Only not hidden
            postsPage = postRepository.findByHiddenFalseOrderByCreatedAtDesc(pageable);
        }

        return postsPage.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getPostsByUserId(Long userId, int page, int size) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String currentUsername = (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) ? auth.getName() : null;

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Post> postsPage;

        boolean isOwner = false;
        if (currentUsername != null) {
             User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
             if (currentUser != null && currentUser.getId().equals(userId)) {
                 isOwner = true;
             }
        }

        if (isAdmin || isOwner) {
            postsPage = postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        } else {
            postsPage = postRepository.findByUserIdAndHiddenFalseOrderByCreatedAtDesc(userId, pageable);
        }

        return postsPage.map(this::mapToDto);
    }

    /**
     * Helper method to map Post entity to PostResponse DTO.
     */
    @Transactional
    public void toggleLike(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found"));
        
        if (post.getLikes().contains(user)) {
            post.getLikes().remove(user);
        } else {
            post.getLikes().add(user);
            // Send Notification
            if (!post.getUser().getId().equals(user.getId())) {
                 notificationService.createNotification(
                    post.getUser(),
                    user,
                    user.getUsername() + " liked your post.",
                    "LIKE",
                    post.getId()
                 );
            }
        }
        postRepository.save(post);
    }

    /**
     * Helper method to map Post entity to PostResponse DTO.
     */
    private PostResponse mapToDto(Post post) {
        String currentUsername = null;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
             currentUsername = auth.getName();
        }

        boolean likedByCurrentUser = false;
        if (currentUsername != null) {
            // Check if current user is in the likes set.
            // Note: This relies on User equals/hashCode being based on ID or ID check.
            // Ideally we check by ID match.
            String finalCurrentUsername = currentUsername;
            likedByCurrentUser = post.getLikes().stream().anyMatch(u -> u.getUsername().equals(finalCurrentUsername));
        }

        return new PostResponse(
            post.getId(),
            post.getTitle(),
            post.getContent(),
            post.getUser().getId(),
            post.getUser().getUsername(),
            post.getCreatedAt(),
            post.getMediaUrl(),
            post.getMediaType(),
            post.getUser().getAvatarUrl(),
            post.isHidden(),
            (long) post.getLikes().size(),
            likedByCurrentUser
        );
    }
}