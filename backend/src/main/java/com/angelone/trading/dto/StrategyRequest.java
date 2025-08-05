package com.angelone.trading.dto;

import com.angelone.trading.entity.Strategy;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

@Data
public class StrategyRequest {
    @NotBlank
    private String name;
    
    @NotNull
    private Strategy.StrategyType type;
    
    @NotBlank
    private String timeFrame;
    
    private Integer emaFast = 20;
    private Integer emaSlow = 50;
    private Integer rsiPeriod = 14;
    
    @NotNull
    @Positive
    private BigDecimal stopLossPercentage;
    
    @NotNull
    @Positive
    private BigDecimal takeProfitPercentage;
    
    @NotNull
    @Positive
    private BigDecimal maxCapitalPercentage;
}