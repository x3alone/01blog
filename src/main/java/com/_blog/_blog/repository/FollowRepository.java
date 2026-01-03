package com._blog._blog.repository;

import com._blog._blog.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);
    long countByFollowingId(Long userId); // Count followers
    long countByFollowerId(Long userId);  // Count following

    @org.springframework.data.jpa.repository.Query("SELECT f.following.id FROM Follow f WHERE f.follower.id = :followerId")
    java.util.List<Long> findFollowingIds(Long followerId);

    @org.springframework.data.jpa.repository.Query("SELECT f.follower.id FROM Follow f WHERE f.following.id = :followingId")
    java.util.List<Long> findFollowerIds(Long followingId);
}