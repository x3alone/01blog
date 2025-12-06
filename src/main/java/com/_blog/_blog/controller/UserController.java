package com._blog._blog.controller;

import com._blog._blog.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com._blog._blog.dto.UserProfileDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    //public endpoint, url GET /api/users/{profileOwnerId}
    //profileOwnerId profile being viewed 
    //currentUserId - the user making the request (can be null if unauthenticated)
    // returns UserProfileDto with follow counts and status
    @GetMapping("/{profileOwnerId}")
    public ResponseEntity<UserProfileDto> getUserProfile(
            @PathVariable Long profileOwnerId,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Determine the current user's ID. If null, they are unauthenticated.
        Long currentUserId = null;
        if (userDetails != null) {
            try {
                // Assuming your UserDetails username is the User ID as a String
                currentUserId = Long.parseLong(userDetails.getUsername());
            } catch (NumberFormatException e) {
                // Log or handle if the username is not the ID.
                // For this example, we proceed with currentUserId = null.
            }
        }

        UserProfileDto profileDto = userService.getUserProfile(profileOwnerId, currentUserId);
        return ResponseEntity.ok(profileDto);
    }

    /**
     * Promote a user to ADMIN.
     * Only accessible by existing ADMINs.
     */
    @PutMapping("/{id}/promote")
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<Void> promoteUser(@PathVariable Long id) {
        userService.promoteUser(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Ban a user.
     * Only accessible by ADMINs.
     */
    @PutMapping("/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> banUser(@PathVariable Long id) {
        userService.banUser(id);
        return ResponseEntity.ok().build();
    }
}
