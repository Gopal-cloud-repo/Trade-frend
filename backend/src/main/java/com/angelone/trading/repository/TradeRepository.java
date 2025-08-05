package com.angelone.trading.repository;

import com.angelone.trading.entity.Trade;
import com.angelone.trading.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Long> {
    List<Trade> findByUserOrderByCreatedAtDesc(User user);
    List<Trade> findByUserAndStatusOrderByCreatedAtDesc(User user, Trade.TradeStatus status);
    
    @Query("SELECT t FROM Trade t WHERE t.user = :user AND t.createdAt >= :startDate")
    List<Trade> findByUserAndCreatedAtAfter(@Param("user") User user, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(t) FROM Trade t WHERE t.user = :user AND t.status = :status")
    Long countByUserAndStatus(@Param("user") User user, @Param("status") Trade.TradeStatus status);
}