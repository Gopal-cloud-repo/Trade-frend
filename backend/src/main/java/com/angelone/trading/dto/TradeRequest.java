package com.angelone.trading.dto;

import com.angelone.trading.entity.Trade;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

@Data
public class TradeRequest {
    @NotBlank
    private String symbol;
    
    @NotNull
    private Trade.TradeType type;
    
    @NotNull
    @Positive
    private Integer quantity;
    
    @NotNull
    @Positive
    private BigDecimal price;
    
    private BigDecimal stopLoss;
    private BigDecimal takeProfit;
}