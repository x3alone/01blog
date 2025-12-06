package com._blog._blog.controller;

import com._blog._blog.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    /**
     * Follow a user.
     * URL: POST /api/follows/{followingId}
     *
     * @param followingId The ID of the user to be followed.
     * @param userDetails The currently authenticated user (the follower).
     * @return 200 OK or 404 NOT FOUND if either user doesn't exist.
     */
    @PostMapping("/{followingId}")
    public ResponseEntity<Void> followUser(
            @PathVariable Long followingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // You must have a way to get the current user's ID from the UserDetails implementation.
        // Assuming your UserDetails implementation returns the User's ID as the username (Long ID as String).
        // If not, you'll need to fetch the User entity based on the username string.
        Long followerId;
        try {
            followerId = Long.parseLong(userDetails.getUsername());
        } catch (NumberFormatException e) {
            // Handle case where username is not the ID (e.g., if username is "alice")
            // You would need an AuthService or UserService method to find ID by username.
            throw new RuntimeException("Authenticated user details format is incorrect (expected ID).");
        }

        followService.followUser(followerId, followingId);
        return ResponseEntity.ok().build();
    }

    /**
     * Unfollow a user.
     * URL: DELETE /api/follows/{followingId}
     *
     * @param followingId The ID of the user to be unfollowed.
     * @param userDetails The currently authenticated user (the follower).
     * @return 200 OK or 404 NOT FOUND if the relationship doesn't exist.
     */
    @DeleteMapping("/{followingId}")
    public ResponseEntity<Void> unfollowUser(
            @PathVariable Long followingId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long followerId;
        try {
            followerId = Long.parseLong(userDetails.getUsername());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Authenticated user details format is incorrect (expected ID).");
        }

        followService.unfollowUser(followerId, followingId);
        return ResponseEntity.ok().build();
    }
}