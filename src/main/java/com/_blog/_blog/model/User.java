package com._blog._blog.model;

import com.fasterxml.jackson.annotation.JsonIgnore; 
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("isBanned") // Force JSON field name to match frontend
    private boolean isBanned = false; 

    @Column(unique = true) // Email should be unique, but maybe nullable for existing users? 
    // User requested "must provide", so let's make it nullable=false for new ones, but strict enforcement might break existing data if we don't migrate.
    // I'll make it nullable=true by default in DB but enforced in App to avoid startup crashes on existing rows.
    private String email;

    private String firstName;
    private String lastName;
    private java.time.LocalDate dateOfBirth;
    private String avatarUrl;
    private String nickname;
    private String aboutMe;

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

    // New Getters & Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public java.time.LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(java.time.LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getAboutMe() { return aboutMe; }
    public void setAboutMe(String aboutMe) { this.aboutMe = aboutMe; }


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