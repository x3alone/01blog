package com._blog._blog.service;

import com._blog._blog.model.User;
import com._blog._blog.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com._blog._blog.repository.FollowRepository;
import com._blog._blog.dto.UserProfileDto;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    public UserService(UserRepository userRepository, FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public void promoteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        user.setRole("ADMIN");
        userRepository.save(user);
    }

    // Ban (or Unban) a user
    public void banUser(Long userId) {
        User user = userRepository.findById(userId)
             .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Toggle ban status (if true = false. if false = true)
        user.setBanned(!user.isBanned());

        // Prevent banning self (rec)
        // user.setBanned(true);
        // userRepository.save(user);
        
        userRepository.save(user);


    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // gets user profile including follow counts and status.
    //profileOwnerId: the user whose profile is being viewed
    //currentUserId: the user who is currently logged in (can be null if not logged in)
    //UserProfileDto: the DTO containing profile info
    public UserProfileDto getUserProfile(Long profileOwnerId, Long currentUserId) {
        // 1. Get the user whose profile is being viewed
        User profileOwner = userRepository.findById(profileOwnerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found."));
        
        // 2. Calculate Follow Counts
        long followersCount = followRepository.countByFollowing(profileOwner);
        long followingCount = followRepository.countByFollower(profileOwner);
        
        // 3. Determine Follow Status (only if a user is logged in)
        boolean isFollowedByCurrentUser = false;
        
        if (currentUserId != null) {
            Optional<User> currentUserOptional = userRepository.findById(currentUserId);
            
            if (currentUserOptional.isPresent()) {
                User currentUser = currentUserOptional.get();
                isFollowedByCurrentUser = followRepository.findByFollowerAndFollowing(currentUser, profileOwner).isPresent();
            }
        }
        
        // 4. Map to DTO
        return new UserProfileDto(
                profileOwner.getId(),
                profileOwner.getUsername(),
                profileOwner.getRole(),
                followersCount,
                followingCount,
                isFollowedByCurrentUser
        );
    }
}
