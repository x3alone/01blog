package com._blog._blog.repository;

import com._blog._blog.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Used for login to retrieve a single user.
    // The previous error was caused because the database had duplicates, 
    // making this query return more than one result.
    Optional<User> findByUsername(String username);

    // Used during registration to check if a username is already taken.
    boolean existsByUsername(String username);
}