package com.angelone.trading.service;

import com.angelone.trading.entity.MarketData;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class TechnicalAnalysisService {
    
    public BigDecimal calculateEMA(List<MarketData> data, int period) {
        if (data.size() < period) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal multiplier = BigDecimal.valueOf(2.0 / (period + 1));
        
        // Calculate SMA for the first EMA value
        BigDecimal sma = data.subList(data.size() - period, data.size())
                .stream()
                .map(MarketData::getClose)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(period), 4, RoundingMode.HALF_UP);
        
        BigDecimal ema = sma;
        
        // Calculate EMA for remaining values
        for (int i = data.size() - period - 1; i >= 0; i--) {
            BigDecimal price = data.get(i).getClose();
            ema = price.multiply(multiplier).add(ema.multiply(BigDecimal.ONE.subtract(multiplier)));
        }
        
        return ema.setScale(2, RoundingMode.HALF_UP);
    }
    
    public BigDecimal calculateRSI(List<MarketData> data, int period) {
        if (data.size() < period + 1) {
            return BigDecimal.valueOf(50); // Neutral RSI
        }
        
        BigDecimal avgGain = BigDecimal.ZERO;
        BigDecimal avgLoss = BigDecimal.ZERO;
        
        // Calculate initial average gain and loss
        for (int i = data.size() - period; i < data.size(); i++) {
            BigDecimal change = data.get(i - 1).getClose().subtract(data.get(i).getClose());
            if (change.compareTo(BigDecimal.ZERO) > 0) {
                avgGain = avgGain.add(change);
            } else {
                avgLoss = avgLoss.add(change.abs());
            }
        }
        
        avgGain = avgGain.divide(BigDecimal.valueOf(period), 4, RoundingMode.HALF_UP);
        avgLoss = avgLoss.divide(BigDecimal.valueOf(period), 4, RoundingMode.HALF_UP);
        
        if (avgLoss.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.valueOf(100);
        }
        
        BigDecimal rs = avgGain.divide(avgLoss, 4, RoundingMode.HALF_UP);
        BigDecimal rsi = BigDecimal.valueOf(100).subtract(
                BigDecimal.valueOf(100).divide(BigDecimal.ONE.add(rs), 2, RoundingMode.HALF_UP)
        );
        
        return rsi;
    }
    
    public boolean isEMACrossover(List<MarketData> data, int fastPeriod, int slowPeriod) {
        if (data.size() < Math.max(fastPeriod, slowPeriod) + 1) {
            return false;
        }
        
        BigDecimal currentFastEMA = calculateEMA(data, fastPeriod);
        BigDecimal currentSlowEMA = calculateEMA(data, slowPeriod);
        
        // Get previous EMAs
        List<MarketData> previousData = data.subList(1, data.size());
        BigDecimal previousFastEMA = calculateEMA(previousData, fastPeriod);
        BigDecimal previousSlowEMA = calculateEMA(previousData, slowPeriod);
        
        // Check for bullish crossover (fast EMA crosses above slow EMA)
        return previousFastEMA.compareTo(previousSlowEMA) <= 0 && 
               currentFastEMA.compareTo(currentSlowEMA) > 0;
    }
    
    public boolean isRSIOversold(BigDecimal rsi, int threshold) {
        return rsi.compareTo(BigDecimal.valueOf(threshold)) < 0;
    }
    
    public boolean isRSIOverbought(BigDecimal rsi, int threshold) {
        return rsi.compareTo(BigDecimal.valueOf(threshold)) > 0;
    }
}