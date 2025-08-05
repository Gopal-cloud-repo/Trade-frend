package com.angelone.trading.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "strategies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Strategy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StrategyType type;
    
    @Column(name = "is_active")
    private Boolean isActive = false;
    
    @Column(name = "time_frame")
    private String timeFrame = "15m";
    
    // EMA Parameters
    @Column(name = "ema_fast")
    private Integer emaFast = 20;
    
    @Column(name = "ema_slow")
    private Integer emaSlow = 50;
    
    // RSI Parameters
    @Column(name = "rsi_period")
    private Integer rsiPeriod = 14;
    
    @Column(name = "rsi_oversold")
    private Integer rsiOversold = 30;
    
    @Column(name = "rsi_overbought")
    private Integer rsiOverbought = 70;
    
    // Risk Management
    @Column(name = "stop_loss_percentage", precision = 5, scale = 2)
    private BigDecimal stopLossPercentage = BigDecimal.valueOf(2.0);
    
    @Column(name = "take_profit_percentage", precision = 5, scale = 2)
    private BigDecimal takeProfitPercentage = BigDecimal.valueOf(4.0);
    
    @Column(name = "max_capital_percentage", precision = 5, scale = 2)
    private BigDecimal maxCapitalPercentage = BigDecimal.valueOf(10.0);
    
    // Performance Metrics
    @Column(name = "total_trades")
    private Integer totalTrades = 0;
    
    @Column(name = "winning_trades")
    private Integer winningTrades = 0;
    
    @Column(name = "average_pnl", precision = 15, scale = 2)
    private BigDecimal averagePnL = BigDecimal.ZERO;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @OneToMany(mappedBy = "strategy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Trade> trades;
    
    public enum StrategyType {
        EMA_CROSSOVER, RSI, MACD, CUSTOM
    }
    
    public BigDecimal getWinRate() {
        if (totalTrades == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(winningTrades)
                .divide(BigDecimal.valueOf(totalTrades), 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}