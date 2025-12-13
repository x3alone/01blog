package com._blog._blog.controller;

import com._blog._blog.dto.CommentResponse;
import com._blog._blog.dto.CreateCommentRequest;
import com._blog._blog.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommentResponse> addComment(
            @RequestParam("content") String content,
            @RequestParam("postId") Long postId,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            Principal principal) {
        
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent(content);
        request.setPostId(postId);

        CommentResponse response = commentService.addCommentWithMedia(request, file, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(@PathVariable Long postId) {
        List<CommentResponse> comments = commentService.getCommentsByPost(postId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        commentService.deleteComment(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
