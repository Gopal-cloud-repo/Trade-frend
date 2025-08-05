package com.angelone.trading.service;

import com.angelone.trading.entity.Trade;
import com.angelone.trading.entity.User;
import com.angelone.trading.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradeService {
    
    private final TradeRepository tradeRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final AngelOneApiService angelOneApiService;
    
    @Transactional
    public Trade executeTrade(Trade trade) {
        try {
            // Set execution time
            trade.setExecutedAt(LocalDateTime.now());
            trade.setStatus(Trade.TradeStatus.PENDING);
            
            // Save trade first
            trade = tradeRepository.save(trade);
            
            // Execute trade via Angel One API (if configured)
            boolean executed = angelOneApiService.placeTrade(trade);
            
            if (executed) {
                trade.setStatus(Trade.TradeStatus.OPEN);
                log.info("Trade executed successfully: {}", trade.getId());
                
                // Send notification
                notificationService.sendTradeExecutedNotification(
                        trade.getUser(),
                        trade.getType() + " order for " + trade.getSymbol() + 
                        " executed at ₹" + trade.getPrice()
                );
            } else {
                trade.setStatus(Trade.TradeStatus.REJECTED);
                log.warn("Trade execution failed: {}", trade.getId());
            }
            
            trade = tradeRepository.save(trade);
            
            // Broadcast trade update via WebSocket
            messagingTemplate.convertAndSendToUser(
                    trade.getUser().getEmail(),
                    "/queue/trades",
                    trade
            );
            
            return trade;
            
        } catch (Exception e) {
            log.error("Error executing trade", e);
            trade.setStatus(Trade.TradeStatus.REJECTED);
            return tradeRepository.save(trade);
        }
    }
    
    @Transactional
    public Trade closeTrade(Long tradeId, User user) {
        Trade trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new RuntimeException("Trade not found"));
        
        if (!trade.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to trade");
        }
        
        if (trade.getStatus() != Trade.TradeStatus.OPEN) {
            throw new RuntimeException("Trade is not open");
        }
        
        // Close trade via Angel One API
        boolean closed = angelOneApiService.closeTrade(trade);
        
        if (closed) {
            trade.setStatus(Trade.TradeStatus.CLOSED);
            trade.setClosedAt(LocalDateTime.now());
            
            // Calculate final P&L (this would be updated from real market data)
            // For demo, we'll use a simple calculation
            BigDecimal currentPrice = trade.getCurrentPrice() != null ? 
                    trade.getCurrentPrice() : trade.getPrice();
            
            BigDecimal pnl = calculatePnL(trade, currentPrice);
            trade.setPnl(pnl);
            
            trade = tradeRepository.save(trade);
            
            // Update user's total P&L
            updateUserPnL(user, pnl);
            
            // Send notification
            notificationService.sendTradeExecutedNotification(
                    user,
                    "Position closed for " + trade.getSymbol() + 
                    " with P&L: ₹" + pnl
            );
            
            log.info("Trade closed successfully: {} with P&L: {}", trade.getId(), pnl);
        }
        
        return trade;
    }
    
    public List<Trade> getUserTrades(User user) {
        return tradeRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<Trade> getUserOpenTrades(User user) {
        return tradeRepository.findByUserAndStatusOrderByCreatedAtDesc(user, Trade.TradeStatus.OPEN);
    }
    
    private BigDecimal calculatePnL(Trade trade, BigDecimal currentPrice) {
        BigDecimal priceDiff = currentPrice.subtract(trade.getPrice());
        if (trade.getType() == Trade.TradeType.SELL) {
            priceDiff = priceDiff.negate();
        }
        return priceDiff.multiply(BigDecimal.valueOf(trade.getQuantity()));
    }
    
    private void updateUserPnL(User user, BigDecimal pnl) {
        user.setTotalPnL(user.getTotalPnL().add(pnl));
        // This would be handled by UserService in a real application
    }
}