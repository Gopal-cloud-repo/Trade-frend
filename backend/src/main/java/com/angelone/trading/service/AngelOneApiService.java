package com.angelone.trading.service;

import com.angelbroking.smartapi.SmartConnect;
import com.angelbroking.smartapi.http.exceptions.SmartAPIException;
import com.angelbroking.smartapi.models.*;
import com.angelone.trading.entity.Trade;
import com.angelone.trading.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AngelOneApiService {
    
    @Value("${angelone.api.base-url}")
    private String baseUrl;
    
    @Value("${angelone.api.client-id}")
    private String clientId;
    
    @Value("${angelone.api.client-secret}")
    private String clientSecret;
    
    private final Map<Long, SmartConnect> userConnections = new HashMap<>();
    
    public boolean authenticateUser(User user) {
        try {
            if (user.getAngelOneClientId() == null || user.getAngelOnePassword() == null) {
                log.warn("Angel One credentials not configured for user: {}", user.getEmail());
                return false;
            }
            
            SmartConnect smartConnect = new SmartConnect();
            smartConnect.setApiKey(user.getAngelOneClientId());
            
            User loginRequest = new User();
            loginRequest.setClientcode(user.getAngelOneClientId());
            loginRequest.setPassword(user.getAngelOnePassword());
            loginRequest.setTotp(user.getAngelOneTotp());
            
            UserLogin userLogin = smartConnect.generateSession(loginRequest);
            
            if (userLogin != null && userLogin.getJwtToken() != null) {
                smartConnect.setAccessToken(userLogin.getJwtToken());
                smartConnect.setUserId(user.getAngelOneClientId());
                
                // Store connection for this user
                userConnections.put(user.getId(), smartConnect);
                
                // Update user tokens in database
                user.setAngelOneToken(userLogin.getJwtToken());
                user.setAngelOneRefreshToken(userLogin.getRefreshToken());
                
                log.info("Successfully authenticated user with Angel One: {}", user.getEmail());
                return true;
            }
            
        } catch (SmartAPIException | IOException e) {
            log.error("Error authenticating user with Angel One API: {}", e.getMessage());
        }
        
        return false;
    }
    
    public boolean placeTrade(Trade trade) {
        try {
            SmartConnect smartConnect = userConnections.get(trade.getUser().getId());
            
            if (smartConnect == null) {
                // Try to authenticate user first
                if (!authenticateUser(trade.getUser())) {
                    log.error("User not authenticated with Angel One: {}", trade.getUser().getEmail());
                    return simulateTrade(trade);
                }
                smartConnect = userConnections.get(trade.getUser().getId());
            }
            
            OrderParams orderParams = new OrderParams();
            orderParams.setVariety("NORMAL");
            orderParams.setTradingsymbol(trade.getSymbol());
            orderParams.setSymboltoken(getSymbolToken(trade.getSymbol()));
            orderParams.setTransactiontype(trade.getType().name());
            orderParams.setExchange("NSE");
            orderParams.setOrdertype("MARKET");
            orderParams.setProducttype("INTRADAY");
            orderParams.setDuration("DAY");
            orderParams.setPrice(trade.getPrice().toString());
            orderParams.setSquareoff("0");
            orderParams.setStoploss("0");
            orderParams.setQuantity(trade.getQuantity().toString());
            
            Order order = smartConnect.placeOrder(orderParams);
            
            if (order != null && order.getOrderid() != null) {
                trade.setAngelOneOrderId(order.getOrderid());
                log.info("Order placed successfully with Angel One: {}", order.getOrderid());
                return true;
            }
            
        } catch (SmartAPIException | IOException e) {
            log.error("Error placing order via Angel One API: {}", e.getMessage());
            // Fallback to simulation for demo
            return simulateTrade(trade);
        }
        
        return false;
    }
    
    private boolean simulateTrade(Trade trade) {
        try {
            
            log.info("Simulating trade execution for: {} {} {} @ {}",
                    trade.getType(), trade.getQuantity(), trade.getSymbol(), trade.getPrice());
            
            // Simulate API call delay
            Thread.sleep(100);
            
            // Generate mock order ID
            trade.setAngelOneOrderId("AO" + System.currentTimeMillis());
            
            // For demo, assume 95% success rate
            return Math.random() > 0.05;
            
        } catch (Exception e) {
            log.error("Error placing trade via Angel One API", e);
            return false;
        }
    }
    
    public boolean closeTrade(Trade trade) {
        try {
            SmartConnect smartConnect = userConnections.get(trade.getUser().getId());
            
            if (smartConnect != null && trade.getAngelOneOrderId() != null) {
                // Create exit order
                OrderParams orderParams = new OrderParams();
                orderParams.setVariety("NORMAL");
                orderParams.setTradingsymbol(trade.getSymbol());
                orderParams.setSymboltoken(getSymbolToken(trade.getSymbol()));
                orderParams.setTransactiontype(trade.getType() == Trade.TradeType.BUY ? "SELL" : "BUY");
                orderParams.setExchange("NSE");
                orderParams.setOrdertype("MARKET");
                orderParams.setProducttype("INTRADAY");
                orderParams.setDuration("DAY");
                orderParams.setQuantity(trade.getQuantity().toString());
                
                Order order = smartConnect.placeOrder(orderParams);
                
                if (order != null && order.getOrderid() != null) {
                    log.info("Exit order placed successfully: {}", order.getOrderid());
                    return true;
                }
            }
            
            // Fallback to simulation
            log.info("Simulating trade closure for: {}", trade.getAngelOneOrderId());
            // Simulate API call delay
            Thread.sleep(100);
            
            // For demo, assume 98% success rate for closing trades
            return Math.random() > 0.02;
            
        } catch (Exception e) {
            log.error("Error closing trade via Angel One API", e);
            return false;
        }
    }
    
    public BigDecimal getCurrentPrice(String symbol) {
        try {
            // This would fetch real-time price from Angel One API
            // For now, return a simulated price
            return BigDecimal.valueOf(Math.random() * 1000 + 100);
        } catch (Exception e) {
            log.error("Error fetching current price for {}: {}", symbol, e.getMessage());
            return BigDecimal.ZERO;
        }
    }
    
    private String getSymbolToken(String symbol) {
        // This should map trading symbols to Angel One symbol tokens
        // For demo purposes, return a mock token
        Map<String, String> symbolTokenMap = new HashMap<>();
        symbolTokenMap.put("NIFTY", "99926000");
        symbolTokenMap.put("BANKNIFTY", "99926009");
        symbolTokenMap.put("RELIANCE", "2885");
        symbolTokenMap.put("TCS", "11536");
        symbolTokenMap.put("INFY", "1594");
        
        return symbolTokenMap.getOrDefault(symbol, "0");
    }
    
    public void disconnectUser(Long userId) {
        userConnections.remove(userId);
        log.info("Disconnected Angel One session for user: {}", userId);
    }
    
    // Additional methods for Angel One API integration would go here:
    // - getMarketData()
    // - getPositions()
    // - getOrderBook()
    // - etc.
}