package com._blog._blog.controller;

import com._blog._blog.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Promote a user to ADMIN.
     * Only accessible by existing ADMINs.
     */
    @PutMapping("/{id}/promote")
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<Void> promoteUser(@PathVariable Long id) {
        userService.promoteToAdmin(id);
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