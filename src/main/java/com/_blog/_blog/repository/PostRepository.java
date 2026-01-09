package com._blog._blog.repository;

import com._blog._blog.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    // For Admins (or global view) - though findAll(Pageable) works, we want explicit ordering if not passed in Pageable, 
    // but Pageable usually handles sort. We can just use findAll(Pageable) for admins.

    // For Guests (only public posts)
    org.springframework.data.domain.Page<Post> findByHiddenFalseOrderByCreatedAtDesc(org.springframework.data.domain.Pageable pageable);

    // For Logged-in Users (public posts + their own hidden posts)
    org.springframework.data.domain.Page<Post> findByHiddenFalseOrUserUsernameOrderByCreatedAtDesc(String username, org.springframework.data.domain.Pageable pageable);

    // Find by User ID (for profile) - All posts (for owner/admin)
    org.springframework.data.domain.Page<Post> findByUserIdOrderByCreatedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);

    // Find by User ID - Public only (for visitors)
    org.springframework.data.domain.Page<Post> findByUserIdAndHiddenFalseOrderByCreatedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);

    // Custom Feed Query: Followed Public Posts + My All Posts
    @org.springframework.data.jpa.repository.Query("SELECT p FROM Post p WHERE (p.user.id IN :userIds AND p.hidden = false) OR (p.user.id = :currentUserId) ORDER BY p.createdAt DESC")
    org.springframework.data.domain.Page<Post> findFeedPosts(java.util.List<Long> userIds, Long currentUserId, org.springframework.data.domain.Pageable pageable);
}