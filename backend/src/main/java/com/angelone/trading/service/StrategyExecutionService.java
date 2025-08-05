package com.angelone.trading.service;

import com.angelone.trading.entity.MarketData;
import com.angelone.trading.entity.Strategy;
import com.angelone.trading.entity.Trade;
import com.angelone.trading.entity.User;
import com.angelone.trading.repository.MarketDataRepository;
import com.angelone.trading.repository.StrategyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StrategyExecutionService {
    
    private final StrategyRepository strategyRepository;
    private final MarketDataRepository marketDataRepository;
    private final TechnicalAnalysisService technicalAnalysisService;
    private final TradeService tradeService;
    private final NotificationService notificationService;
    
    @Scheduled(fixedRate = 10000) // Every 10 seconds
    public void executeActiveStrategies() {
        try {
            List<Strategy> activeStrategies = strategyRepository.findByIsActiveTrue();
            
            for (Strategy strategy : activeStrategies) {
                executeStrategy(strategy);
            }
            
            log.debug("Executed {} active strategies", activeStrategies.size());
        } catch (Exception e) {
            log.error("Error executing strategies", e);
        }
    }
    
    private void executeStrategy(Strategy strategy) {
        try {
            switch (strategy.getType()) {
                case EMA_CROSSOVER:
                    executeEMACrossoverStrategy(strategy);
                    break;
                case RSI:
                    executeRSIStrategy(strategy);
                    break;
                default:
                    log.warn("Strategy type {} not implemented", strategy.getType());
            }
        } catch (Exception e) {
            log.error("Error executing strategy {}: {}", strategy.getName(), e.getMessage());
        }
    }
    
    private void executeEMACrossoverStrategy(Strategy strategy) {
        // For demo purposes, we'll use NIFTY as the default symbol
        String symbol = "NIFTY";
        
        List<MarketData> historicalData = marketDataRepository
                .findBySymbolAndTimeFrameOrderByTimestampDesc(symbol, strategy.getTimeFrame());
        
        if (historicalData.size() < Math.max(strategy.getEmaFast(), strategy.getEmaSlow()) + 1) {
            return; // Not enough data
        }
        
        boolean isCrossover = technicalAnalysisService.isEMACrossover(
                historicalData, strategy.getEmaFast(), strategy.getEmaSlow());
        
        if (isCrossover) {
            MarketData currentData = historicalData.get(0);
            
            // Create a buy trade
            Trade trade = new Trade();
            trade.setUser(strategy.getUser());
            trade.setStrategy(strategy);
            trade.setSymbol(symbol);
            trade.setType(Trade.TradeType.BUY);
            trade.setQuantity(calculatePositionSize(strategy, currentData.getClose()));
            trade.setPrice(currentData.getClose());
            trade.setStopLoss(calculateStopLoss(currentData.getClose(), strategy.getStopLossPercentage()));
            trade.setTakeProfit(calculateTakeProfit(currentData.getClose(), strategy.getTakeProfitPercentage()));
            
            tradeService.executeTrade(trade);
            
            // Send notification
            notificationService.sendStrategyTriggeredNotification(
                    strategy.getUser(),
                    strategy.getName(),
                    "EMA Crossover signal detected for " + symbol
            );
            
            log.info("EMA Crossover strategy {} triggered for {}", strategy.getName(), symbol);
        }
    }
    
    private void executeRSIStrategy(Strategy strategy) {
        String symbol = "NIFTY";
        
        List<MarketData> historicalData = marketDataRepository
                .findBySymbolAndTimeFrameOrderByTimestampDesc(symbol, strategy.getTimeFrame());
        
        if (historicalData.size() < strategy.getRsiPeriod() + 1) {
            return;
        }
        
        BigDecimal rsi = technicalAnalysisService.calculateRSI(historicalData, strategy.getRsiPeriod());
        MarketData currentData = historicalData.get(0);
        
        boolean shouldBuy = technicalAnalysisService.isRSIOversold(rsi, strategy.getRsiOversold());
        boolean shouldSell = technicalAnalysisService.isRSIOverbought(rsi, strategy.getRsiOverbought());
        
        if (shouldBuy || shouldSell) {
            Trade trade = new Trade();
            trade.setUser(strategy.getUser());
            trade.setStrategy(strategy);
            trade.setSymbol(symbol);
            trade.setType(shouldBuy ? Trade.TradeType.BUY : Trade.TradeType.SELL);
            trade.setQuantity(calculatePositionSize(strategy, currentData.getClose()));
            trade.setPrice(currentData.getClose());
            trade.setStopLoss(calculateStopLoss(currentData.getClose(), strategy.getStopLossPercentage()));
            trade.setTakeProfit(calculateTakeProfit(currentData.getClose(), strategy.getTakeProfitPercentage()));
            
            tradeService.executeTrade(trade);
            
            String action = shouldBuy ? "Buy" : "Sell";
            notificationService.sendStrategyTriggeredNotification(
                    strategy.getUser(),
                    strategy.getName(),
                    action + " signal detected for " + symbol + " (RSI: " + rsi + ")"
            );
            
            log.info("RSI strategy {} triggered {} for {} (RSI: {})", 
                    strategy.getName(), action, symbol, rsi);
        }
    }
    
    private Integer calculatePositionSize(Strategy strategy, BigDecimal price) {
        User user = strategy.getUser();
        BigDecimal maxCapital = user.getAccountBalance()
                .multiply(strategy.getMaxCapitalPercentage())
                .divide(BigDecimal.valueOf(100));
        
        return maxCapital.divide(price, 0, BigDecimal.ROUND_DOWN).intValue();
    }
    
    private BigDecimal calculateStopLoss(BigDecimal price, BigDecimal stopLossPercentage) {
        return price.multiply(BigDecimal.ONE.subtract(stopLossPercentage.divide(BigDecimal.valueOf(100))));
    }
    
    private BigDecimal calculateTakeProfit(BigDecimal price, BigDecimal takeProfitPercentage) {
        return price.multiply(BigDecimal.ONE.add(takeProfitPercentage.divide(BigDecimal.valueOf(100))));
    }
}