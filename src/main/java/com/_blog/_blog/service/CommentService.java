package com._blog._blog.service;

import com._blog._blog.dto.CommentResponse;
import com._blog._blog.dto.CreateCommentRequest;
import com._blog._blog.model.Comment;
import com._blog._blog.model.Post;
import com._blog._blog.model.User;
import com._blog._blog.repository.CommentRepository;
import com._blog._blog.repository.PostRepository;
import com._blog._blog.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    private final MediaService mediaService;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository, UserRepository userRepository, MediaService mediaService, NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.mediaService = mediaService;
        this.notificationService = notificationService;
    }

    public CommentResponse addCommentWithMedia(CreateCommentRequest request, org.springframework.web.multipart.MultipartFile file, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setUser(user);
        comment.setPost(post);
        // createdAt is set in constructor
        
        // Save first to generate ID
        Comment savedComment = commentRepository.save(comment);

        // Handle File Upload
        if (file != null && !file.isEmpty()) {
            try {
                // Name: comment{id}_{timestamp}
                String customName = "comment" + savedComment.getId() + "_" + System.currentTimeMillis();
                java.util.Map uploadResult = mediaService.uploadFile(file, "01blog/comments", customName);

                savedComment.setMediaUrl((String) uploadResult.get("secure_url"));
                savedComment.setPublicId((String) uploadResult.get("public_id"));
                savedComment.setMediaType((String) uploadResult.get("resource_type"));

                savedComment = commentRepository.save(savedComment);
            } catch (java.io.IOException e) {
                System.err.println("Comment Media Upload Error: " + e.getMessage());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload media for comment");
            }
        }

        // Trigger Notification if commenter is not the post owner
        if (!savedComment.getUser().getId().equals(post.getUser().getId())) {
            notificationService.createNotification(
                    post.getUser(),
                    savedComment.getUser(), // Actor
                    savedComment.getUser().getUsername() + " commented on your post.",
                    "COMMENT",
                    post.getId()
            );
        }

        return new CommentResponse(
                savedComment.getId(),
                savedComment.getContent(),
                savedComment.getUser().getUsername(),
                savedComment.getCreatedAt(),
                savedComment.getMediaUrl(),
                savedComment.getMediaType(),
                savedComment.getUser().getAvatarUrl() // New: Avatar URL
        );
    }

    public List<CommentResponse> getCommentsByPost(Long postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return comments.stream()
                .map(comment -> new CommentResponse(
                        comment.getId(),
                        comment.getContent(),
                        comment.getUser().getUsername(),
                        comment.getCreatedAt(),
                        comment.getMediaUrl(),
                        comment.getMediaType(),
                        comment.getUser().getAvatarUrl()
                ))
                .collect(Collectors.toList());
    }

    public void deleteComment(Long id, String username) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getUser().getUsername().equals(username)) {
            // Check if user is admin - simplified check for now, ideally pass Authentication or check roles
            // For now, strictly enforce ownership or rely on controller to check admin role
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to delete this comment");
        }

        if (comment.getPublicId() != null && !comment.getPublicId().isEmpty()) {
            try {
                mediaService.deleteFile(comment.getPublicId());
            } catch (java.io.IOException e) {
                System.err.println("Warning: Failed to delete media for Comment ID: " + id);
            }
        }

        commentRepository.delete(comment);
    }
}
