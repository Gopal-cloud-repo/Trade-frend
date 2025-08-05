package com.angelone.trading.service;

import com.angelone.trading.entity.MarketData;
import com.angelone.trading.repository.MarketDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataService {
    
    private final MarketDataRepository marketDataRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final TechnicalAnalysisService technicalAnalysisService;
    
    private final Random random = new Random();
    private final List<String> symbols = Arrays.asList("NIFTY", "BANKNIFTY", "SENSEX", "RELIANCE", "TCS", "INFY");
    
    @Scheduled(fixedRate = 5000) // Every 5 seconds
    public void generateAndBroadcastMarketData() {
        try {
            for (String symbol : symbols) {
                MarketData marketData = generateMarketData(symbol);
                marketDataRepository.save(marketData);
                
                // Broadcast to WebSocket subscribers
                messagingTemplate.convertAndSend("/topic/market-data/" + symbol, marketData);
                messagingTemplate.convertAndSend("/topic/market-data/all", marketData);
            }
            log.debug("Generated and broadcasted market data for {} symbols", symbols.size());
        } catch (Exception e) {
            log.error("Error generating market data", e);
        }
    }
    
    private MarketData generateMarketData(String symbol) {
        // Get the last price for this symbol
        MarketData lastData = marketDataRepository
                .findTopBySymbolAndTimeFrameOrderByTimestampDesc(symbol, "1m")
                .orElse(null);
        
        BigDecimal basePrice = getBasePrice(symbol);
        if (lastData != null) {
            basePrice = lastData.getClose();
        }
        
        // Generate realistic price movement
        double changePercent = (random.nextGaussian() * 0.5); // Normal distribution with 0.5% std dev
        BigDecimal change = basePrice.multiply(BigDecimal.valueOf(changePercent / 100));
        BigDecimal newPrice = basePrice.add(change);
        
        // Ensure price doesn't go negative
        if (newPrice.compareTo(BigDecimal.ZERO) <= 0) {
            newPrice = basePrice.multiply(BigDecimal.valueOf(0.99));
        }
        
        // Generate OHLC data
        BigDecimal high = newPrice.add(newPrice.multiply(BigDecimal.valueOf(random.nextDouble() * 0.01)));
        BigDecimal low = newPrice.subtract(newPrice.multiply(BigDecimal.valueOf(random.nextDouble() * 0.01)));
        BigDecimal open = lastData != null ? lastData.getClose() : newPrice;
        
        MarketData marketData = new MarketData();
        marketData.setSymbol(symbol);
        marketData.setOpen(open);
        marketData.setHigh(high);
        marketData.setLow(low);
        marketData.setClose(newPrice);
        marketData.setVolume((long) (random.nextInt(1000000) + 500000));
        marketData.setChange(change);
        marketData.setChangePercent(BigDecimal.valueOf(changePercent).setScale(2, RoundingMode.HALF_UP));
        marketData.setTimeFrame("1m");
        marketData.setTimestamp(LocalDateTime.now());
        
        // Calculate technical indicators
        List<MarketData> historicalData = marketDataRepository
                .findBySymbolAndTimeFrameOrderByTimestampDesc(symbol, "1m");
        
        if (historicalData.size() >= 20) {
            BigDecimal ema20 = technicalAnalysisService.calculateEMA(historicalData, 20);
            marketData.setEma20(ema20);
        }
        
        if (historicalData.size() >= 50) {
            BigDecimal ema50 = technicalAnalysisService.calculateEMA(historicalData, 50);
            marketData.setEma50(ema50);
        }
        
        if (historicalData.size() >= 14) {
            BigDecimal rsi = technicalAnalysisService.calculateRSI(historicalData, 14);
            marketData.setRsi(rsi);
        }
        
        return marketData;
    }
    
    private BigDecimal getBasePrice(String symbol) {
        switch (symbol) {
            case "NIFTY": return BigDecimal.valueOf(21800);
            case "BANKNIFTY": return BigDecimal.valueOf(46200);
            case "SENSEX": return BigDecimal.valueOf(72400);
            case "RELIANCE": return BigDecimal.valueOf(2450);
            case "TCS": return BigDecimal.valueOf(3650);
            case "INFY": return BigDecimal.valueOf(1580);
            default: return BigDecimal.valueOf(1000);
        }
    }
    
    public List<MarketData> getHistoricalData(String symbol, String timeFrame, int limit) {
        List<MarketData> data = marketDataRepository
                .findBySymbolAndTimeFrameOrderByTimestampDesc(symbol, timeFrame);
        
        return data.size() > limit ? data.subList(0, limit) : data;
    }
    
    public MarketData getLatestData(String symbol) {
        return marketDataRepository
                .findTopBySymbolAndTimeFrameOrderByTimestampDesc(symbol, "1m")
                .orElse(null);
    }
}