package com._blog._blog.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // <-- NEW IMPORT
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users") 
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    private String role;

    @Column(nullable = false)
    private boolean isBanned = false; 

    // ------------------------------------------------------------------
    // FIX: ADD THE POST RELATIONSHIP AND BREAK THE CYCLIC DEPENDENCY
    // The previous error of an empty response was due to this missing fix.
    // ------------------------------------------------------------------
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // <-- CRITICAL FIX: Prevents infinite serialization loop (User -> Post -> User -> ...)
    private List<Post> posts;
    // ------------------------------------------------------------------


    public User() {}

    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public boolean isBanned() { return isBanned; }
    public void setBanned(boolean banned) { isBanned = banned; }

    @Override
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public List<Post> getPosts() { return posts; } // Added getter for completeness
    public void setPosts(List<Post> posts) { this.posts = posts; } // Added setter for completeness


    // UserDetails methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // NOTE: This should likely return an authority with "ROLE_" prefix for consistency with @PreAuthorize
        // e.g., return List.of(() -> "ROLE_" + role);
        return List.of(() -> role); // Keeping your original logic
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isBanned;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}