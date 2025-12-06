package com._blog._blog.repository;

import com._blog._blog.model.Follow;
import com._blog._blog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    /**
     * Checks if a user is already following another user.
     * @param follower The user who is doing the following.
     * @param following The user who is being followed.
     * @return An Optional containing the Follow entity if the relationship exists.
     */
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);

    /**
     * Counts the number of users following a specific user (Followers count).
     * @param following The user being followed.
     * @return The count of followers.
     */
    long countByFollowing(User following);

    /**
     * Counts the number of users a specific user is following (Following count).
     * @param follower The user who is doing the following.
     * @return The count of users followed.
     */
    long countByFollower(User follower);

    /**
     * Finds all users being followed by a specific user (Following list).
     * @param follower The user who is doing the following.
     * @return A list of Follow entities.
     */
    List<Follow> findByFollower(User follower);

    /**
     * Finds all users following a specific user (Followers list).
     * @param following The user being followed.
     * @return A list of Follow entities.
     */
    List<Follow> findByFollowing(User following);
}