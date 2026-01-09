package com._blog._blog.controller;

import com._blog._blog.service.UserService;
import com._blog._blog.service.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com._blog._blog.dto.UserProfileDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    // Public endpoint: allows viewing any user profile ( Public Profile Viewing)
    @GetMapping("/{profileOwnerId}")
    public ResponseEntity<UserProfileDto> getUserProfile(
            @PathVariable Long profileOwnerId,
            @AuthenticationPrincipal String username) {

        Long currentUserId = null;
        if (username != null && !username.equals("anonymousUser")) {
             try {
                User currentUser = userService.getUserByUsername(username);
                currentUserId = currentUser.getId();
             } catch (Exception e) {
             }
        }

        UserProfileDto profileDto = userService.getUserProfile(profileOwnerId, currentUserId);
        return ResponseEntity.ok(profileDto);
    }
    // Admin-only endpoint: retrieves all users for dashboard ( Admin-Only Routes)
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')") 
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Admin promotes user to ADMIN role; prevents self-promotion via service layer ( Role-based Access Control)
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

    //Admin bans user; prevents self-banning via service layer ( Admin Ban Users)
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
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
             return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed."));
        }

        try {
            User user = userService.getUserByUsername(username);
            String customName = "avatar_" + user.getId() + "_" + System.currentTimeMillis();
            Map uploadResult = mediaService.uploadFile(file, "avatars", customName);
            
            String url = (String) uploadResult.get("url");
            String secureUrl = (String) uploadResult.get("secure_url");
            
            userService.updateProfile(user.getId(), null, secureUrl);

            return ResponseEntity.ok(uploadResult);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Search Users Endpoint
    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDto>> searchUsers(@RequestParam("query") String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
}
