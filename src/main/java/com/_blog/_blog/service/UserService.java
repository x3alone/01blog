package com._blog._blog.service;

import com._blog._blog.model.User;
import com._blog._blog.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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

        // Prevent banning yourself (optional but recommended)
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
}
