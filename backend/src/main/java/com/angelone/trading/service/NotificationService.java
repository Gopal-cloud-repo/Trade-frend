package com.angelone.trading.service;

import com.angelone.trading.entity.Notification;
import com.angelone.trading.entity.User;
import com.angelone.trading.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    public void sendTradeExecutedNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(Notification.NotificationType.TRADE_EXECUTED);
        notification.setTitle("Trade Executed");
        notification.setMessage(message);
        notification.setPriority(Notification.Priority.HIGH);
        
        notification = notificationRepository.save(notification);
        
        // Send via WebSocket
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                notification
        );
        
        log.info("Trade executed notification sent to user: {}", user.getEmail());
    }
    
    public void sendStrategyTriggeredNotification(User user, String strategyName, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(Notification.NotificationType.STRATEGY_TRIGGERED);
        notification.setTitle("Strategy Alert: " + strategyName);
        notification.setMessage(message);
        notification.setPriority(Notification.Priority.MEDIUM);
        
        notification = notificationRepository.save(notification);
        
        // Send via WebSocket
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                notification
        );
        
        log.info("Strategy triggered notification sent to user: {}", user.getEmail());
    }
    
    public void sendRiskAlertNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(Notification.NotificationType.RISK_ALERT);
        notification.setTitle("Risk Alert");
        notification.setMessage(message);
        notification.setPriority(Notification.Priority.HIGH);
        
        notification = notificationRepository.save(notification);
        
        // Send via WebSocket
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                notification
        );
        
        log.info("Risk alert notification sent to user: {}", user.getEmail());
    }
    
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }
    
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to notification");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    public void markAllAsRead(User user) {
        List<Notification> unreadNotifications = getUnreadNotifications(user);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }
}