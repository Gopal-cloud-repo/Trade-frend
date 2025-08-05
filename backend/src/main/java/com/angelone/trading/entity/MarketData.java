package com.angelone.trading.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "market_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String symbol;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal open;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal high;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal low;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal close;
    
    @Column(nullable = false)
    private Long volume;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal change;
    
    @Column(name = "change_percent", precision = 5, scale = 2)
    private BigDecimal changePercent;
    
    @Column(name = "ema_20", precision = 10, scale = 2)
    private BigDecimal ema20;
    
    @Column(name = "ema_50", precision = 10, scale = 2)
    private BigDecimal ema50;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal rsi;
    
    @Column(name = "time_frame")
    private String timeFrame = "1m";
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}