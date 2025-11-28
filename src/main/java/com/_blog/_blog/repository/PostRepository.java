package com._blog._blog.repository;

import com._blog._blog.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // Custom method to find all posts, ordered by creation date descending (newest first)
    List<Post> findAllByOrderByCreatedAtDesc();
}