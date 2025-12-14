package com._blog._blog.controller;

import com._blog._blog.service.UserService;
import com._blog._blog.service.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com._blog._blog.dto.UserProfileDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com._blog._blog.model.User;
import java.util.List;
import java.util.Map;
import java.io.IOException;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final MediaService mediaService;

    public UserController(UserService userService, MediaService mediaService) {
        this.userService = userService;
        this.mediaService = mediaService;
    }

    //public endpoint, url GET /api/users/{profileOwnerId}
    //profileOwnerId profile being viewed 
    //currentUserId - the user making the request (can be null if unauthenticated)
    // returns UserProfileDto with follow counts and status
    @GetMapping("/{profileOwnerId}")
    public ResponseEntity<UserProfileDto> getUserProfile(
            @PathVariable Long profileOwnerId,
            @AuthenticationPrincipal String username) {

        // Determine the current user's ID. 
        Long currentUserId = null;
        if (username != null && !username.equals("anonymousUser")) {
             try {
                User currentUser = userService.getUserByUsername(username);
                currentUserId = currentUser.getId();
             } catch (Exception e) {
                // User might have a token but wrong username, or deleted. Treat as guest.
             }
        }

        UserProfileDto profileDto = userService.getUserProfile(profileOwnerId, currentUserId);
        return ResponseEntity.ok(profileDto);
    }
    //NEW END PONTS FOR ADMIN
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')") 
            public ResponseEntity<List<User>> getAllUsers() {
            List<User> users = userService.getAllUsers();
            System.out.println("Fetched users: \n\n");
    return ResponseEntity.ok(users);
}

    /**
     * Promote a user to ADMIN.
     * Only accessible by existing ADMINs.
     */
    @PutMapping("/{id}/promote")
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<Void> promoteUser(@PathVariable Long id, @AuthenticationPrincipal String username) {
        Long currentUserId = userService.getUserByUsername(username).getId();
        userService.promoteUser(id, currentUserId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/demote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> demoteUser(@PathVariable Long id, @AuthenticationPrincipal String username) {
         Long currentUserId = userService.getUserByUsername(username).getId();
         userService.demoteUser(id, currentUserId);
         return ResponseEntity.ok().build();
    }

    /**
     * Ban a user.
     * Only accessible by ADMINs.
     */
    @PutMapping("/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> banUser(@PathVariable Long id, @AuthenticationPrincipal String username) {
        Long currentUserId = userService.getUserByUsername(username).getId();
        userService.banUser(id, currentUserId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(
            @RequestBody Map<String, String> payload, 
            @AuthenticationPrincipal String username) {
        
        User user = userService.getUserByUsername(username);
        String aboutMe = payload.get("aboutMe");
        String avatarUrl = payload.get("avatarUrl");
        
        User updatedUser = userService.updateProfile(user.getId(), aboutMe, avatarUrl);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/avatar")
    public ResponseEntity<Map> uploadAvatar(
            @RequestParam("file") MultipartFile file, 
            @AuthenticationPrincipal String username) {
        try {
            User user = userService.getUserByUsername(username);
            // Upload to Cloudinary. Folder can be "avatars". public_id can be "avatar_{userId}_{timestamp}"
            String customName = "avatar_" + user.getId() + "_" + System.currentTimeMillis();
            Map uploadResult = mediaService.uploadFile(file, "avatars", customName);
            
            String url = (String) uploadResult.get("url");
            String secureUrl = (String) uploadResult.get("secure_url"); // Prefer secure_url
            
            // Optionally update the user profile immediately, though frontend sends separate update
            userService.updateProfile(user.getId(), null, secureUrl);

            return ResponseEntity.ok(uploadResult);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
