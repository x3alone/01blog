package com._blog._blog.controller;

import com._blog._blog.service.FollowService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Void> followUser(@PathVariable Long userId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        followService.followUser(principal.getName(), userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long userId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        followService.unfollowUser(principal.getName(), userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/check")
    public ResponseEntity<Map<String, Boolean>> isFollowing(@PathVariable Long userId, Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        boolean isFollowing = followService.isFollowing(principal.getName(), userId);
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }
}