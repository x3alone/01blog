package com._blog._blog.service;

import com._blog._blog.model.Follow;
import com._blog._blog.model.User;
import com._blog._blog.repository.FollowRepository;
import com._blog._blog.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public FollowService(FollowRepository followRepository, UserRepository userRepository, NotificationService notificationService) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void followUser(String followerUsername, Long followingId) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new RuntimeException("User to follow not found"));

        if (follower.getId().equals(following.getId())) {
            throw new RuntimeException("You cannot follow yourself");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(follower.getId(), following.getId())) {
             return; // Already following
        }

        Follow follow = new Follow(follower, following);
        followRepository.save(follow);

        // Trigger Notification
        notificationService.createNotification(
                following,
                follower, // Actor
                follower.getUsername() + " started following you.",
                "FOLLOW",
                follower.getId() // relatedId is the follower's user ID
        );
    }

    @Transactional
    public void unfollowUser(String followerUsername, Long followingId) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new RuntimeException("Follower not found"));
        
        Follow follow = followRepository.findByFollowerIdAndFollowingId(follower.getId(), followingId)
                .orElseThrow(() -> new RuntimeException("Follow relationship not found"));

        followRepository.delete(follow);
    }

    public boolean isFollowing(String followerUsername, Long followingId) {
        User follower = userRepository.findByUsername(followerUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return followRepository.existsByFollowerIdAndFollowingId(follower.getId(), followingId);
    }
}