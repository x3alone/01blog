package com._blog._blog.service;

import com._blog._blog.model.User;
import com._blog._blog.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Collections;
import java.util.Optional;

/**
 * Custom implementation of Spring Security's UserDetailsService interface.
 * This class is responsible for fetching user details (username, password, roles)
 * from the database during the authentication process.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Locates the user based on the username.
     * @param username the username identifying the user whose data is required.
     * @return a fully populated UserDetails object (Spring Security's User).
     * @throws UsernameNotFoundException if the user could not be found or the user has no GrantedAuthority.
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        // Throw exception if user is not found
        User user = userOptional.orElseThrow(() -> 
            new UsernameNotFoundException("User not found with username: " + username)
        );

        // Map the user's role (e.g., "USER", "ADMIN") to Spring Security's GrantedAuthority
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            getAuthorities(user.getRole())
        );
    }

    /**
     * Converts a simple role string into a collection of GrantedAuthority objects.
     */
    private Collection<? extends GrantedAuthority> getAuthorities(String role) {
        // Roles should typically be prefixed with 'ROLE_' in Spring Security
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }
}
