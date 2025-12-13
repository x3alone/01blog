package com._blog._blog.service;

import com._blog._blog.model.Notification;
import com._blog._blog.model.User;
import com._blog._blog.repository.NotificationRepository;
import com._blog._blog.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void createNotification(User recipient, User actor, String message, String type, Long relatedId) {
        Notification notification = new Notification(recipient, actor, message, type, relatedId);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
    }

    public long getUnreadCount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }
}
