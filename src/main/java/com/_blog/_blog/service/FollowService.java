package com._blog._blog.service;

import com._blog._blog.model.Follow;
import com._blog._blog.model.User;
import com._blog._blog.repository.FollowRepository;
import com._blog._blog.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public FollowService(FollowRepository followRepository, UserRepository userRepository) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates a follow relationship between two users.
     * @param followerId The ID of the user initiating the follow.
     * @param followingId The ID of the user being followed.
     */
    @Transactional
    public void followUser(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User cannot follow themselves.");
        }

        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follower not found."));

        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User to follow not found."));

        // Check if relationship already exists
        if (followRepository.findByFollowerAndFollowing(follower, following).isPresent()) {
            // Already following, no action needed, or you could throw a BAD_REQUEST here.
            return;
        }

        Follow follow = new Follow(follower, following);
        followRepository.save(follow);
    }

    /**
     * Removes a follow relationship between two users.
     * @param followerId The ID of the user who is unfollowing.
     * @param followingId The ID of the user being unfollowed.
     */
    @Transactional
    public void unfollowUser(Long followerId, Long followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follower not found."));

        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User to unfollow not found."));

        Follow follow = followRepository.findByFollowerAndFollowing(follower, following)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follow relationship not found."));

        followRepository.delete(follow);
    }

    /**
     * Checks if one user follows another.
     */
    public boolean isFollowing(Long followerId, Long followingId) {
        User follower = userRepository.findById(followerId).orElse(null);
        User following = userRepository.findById(followingId).orElse(null);
        
        if (follower == null || following == null) {
            return false;
        }

        return followRepository.findByFollowerAndFollowing(follower, following).isPresent();
    }
}