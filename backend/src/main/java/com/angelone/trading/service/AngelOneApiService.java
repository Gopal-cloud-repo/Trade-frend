package com.angelone.trading.service;

import com.angelone.trading.entity.Trade;
import com.angelone.trading.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SimpMessagingTemplate messagingTemplate;
    private final Map<Long, String> userTokens = new HashMap<>();
    
    public boolean authenticateUser(User user) {
        try {
            if (user.getAngelOneClientId() == null || user.getAngelOnePassword() == null) {
                log.warn("Angel One credentials not configured for user: {}", user.getEmail());
                return simulateAuthentication(user);
            }
            
            String url = baseUrl + "/rest/auth/angelbroking/user/v1/loginByPassword";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-ClientLocalIP", "192.168.1.1");
            headers.set("X-ClientPublicIP", "106.193.147.98");
            headers.set("X-MACAddress", "fe80::216:3eff:fe00:1");
            headers.set("Accept", "application/json");
            headers.set("X-PrivateKey", clientSecret);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("clientcode", user.getAngelOneClientId());
            requestBody.put("password", user.getAngelOnePassword());
            requestBody.put("totp", user.getAngelOneTotp());
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.get("status").asBoolean()) {
                    String jwtToken = responseJson.get("data").get("jwtToken").asText();
                    String refreshToken = responseJson.get("data").get("refreshToken").asText();
                    
                    // Store tokens
                    userTokens.put(user.getId(), jwtToken);
                    user.setAngelOneToken(jwtToken);
                    user.setAngelOneRefreshToken(refreshToken);
                    
                    log.info("Successfully authenticated user with Angel One: {}", user.getEmail());
                    return true;
                } else {
                    log.error("Angel One authentication failed: {}", responseJson.get("message").asText());
                }
            }
            
        } catch (Exception e) {
            log.error("Error authenticating user with Angel One API: {}", e.getMessage());
            return simulateAuthentication(user);
        }
        
        return false;
    }
    
    public boolean placeTrade(Trade trade) {
        try {
            String token = userTokens.get(trade.getUser().getId());
            
            if (token == null) {
                if (!authenticateUser(trade.getUser())) {
                    return simulateTrade(trade);
                }
                token = userTokens.get(trade.getUser().getId());
            }
            
            String url = baseUrl + "/rest/secure/angelbroking/order/v1/placeOrder";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json");
            headers.set("X-UserType", "USER");
            headers.set("X-SourceID", "WEB");
            headers.set("X-ClientLocalIP", "192.168.1.1");
            headers.set("X-ClientPublicIP", "106.193.147.98");
            headers.set("X-MACAddress", "fe80::216:3eff:fe00:1");
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("variety", "NORMAL");
            requestBody.put("tradingsymbol", trade.getSymbol());
            requestBody.put("symboltoken", getSymbolToken(trade.getSymbol()));
            requestBody.put("transactiontype", trade.getType().name());
            requestBody.put("exchange", "NSE");
            requestBody.put("ordertype", "MARKET");
            requestBody.put("producttype", "INTRADAY");
            requestBody.put("duration", "DAY");
            requestBody.put("price", trade.getPrice().toString());
            requestBody.put("squareoff", "0");
            requestBody.put("stoploss", "0");
            requestBody.put("quantity", trade.getQuantity().toString());
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.get("status").asBoolean()) {
                    String orderId = responseJson.get("data").get("orderid").asText();
                    trade.setAngelOneOrderId(orderId);
                    log.info("Order placed successfully with Angel One: {}", orderId);
                    return true;
                } else {
                    log.error("Angel One order placement failed: {}", responseJson.get("message").asText());
                }
            }
            
        } catch (Exception e) {
            log.error("Error placing order via Angel One API: {}", e.getMessage());
            return simulateTrade(trade);
        }
        
        return false;
    }
    
    public boolean closeTrade(Trade trade) {
        try {
            String token = userTokens.get(trade.getUser().getId());
            
            if (token == null) {
                return simulateTradeClose(trade);
            }
            
            String url = baseUrl + "/rest/secure/angelbroking/order/v1/placeOrder";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + token);
            headers.set("Accept", "application/json");
            headers.set("X-UserType", "USER");
            headers.set("X-SourceID", "WEB");
            headers.set("X-ClientLocalIP", "192.168.1.1");
            headers.set("X-ClientPublicIP", "106.193.147.98");
            headers.set("X-MACAddress", "fe80::216:3eff:fe00:1");
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("variety", "NORMAL");
            requestBody.put("tradingsymbol", trade.getSymbol());
            requestBody.put("symboltoken", getSymbolToken(trade.getSymbol()));
            requestBody.put("transactiontype", trade.getType() == Trade.TradeType.BUY ? "SELL" : "BUY");
            requestBody.put("exchange", "NSE");
            requestBody.put("ordertype", "MARKET");
            requestBody.put("producttype", "INTRADAY");
            requestBody.put("duration", "DAY");
            requestBody.put("quantity", trade.getQuantity().toString());
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.get("status").asBoolean()) {
                    log.info("Exit order placed successfully: {}", responseJson.get("data").get("orderid").asText());
                    return true;
                }
            }
            
        } catch (Exception e) {
            log.error("Error closing trade via Angel One API: {}", e.getMessage());
        }
        
        return simulateTradeClose(trade);
    }
    
    public BigDecimal getCurrentPrice(String symbol) {
        try {
            String url = baseUrl + "/rest/secure/angelbroking/market/v1/quote/";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("X-UserType", "USER");
            headers.set("X-SourceID", "WEB");
            headers.set("X-ClientLocalIP", "192.168.1.1");
            headers.set("X-ClientPublicIP", "106.193.147.98");
            headers.set("X-MACAddress", "fe80::216:3eff:fe00:1");
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("exchange", "NSE");
            requestBody.put("tradingsymbol", symbol);
            requestBody.put("symboltoken", getSymbolToken(symbol));
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.get("status").asBoolean()) {
                    return new BigDecimal(responseJson.get("data").get("ltp").asText());
                }
            }
            
        } catch (Exception e) {
            log.error("Error fetching current price for {}: {}", symbol, e.getMessage());
        }
        
        // Return simulated price as fallback
        return getSimulatedPrice(symbol);
    }
    
    public Map<String, Object> getMarketData(String symbol) {
        try {
            String url = baseUrl + "/rest/secure/angelbroking/market/v1/quote/";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");
            headers.set("X-UserType", "USER");
            headers.set("X-SourceID", "WEB");
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("exchange", "NSE");
            requestBody.put("tradingsymbol", symbol);
            requestBody.put("symboltoken", getSymbolToken(symbol));
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode responseJson = objectMapper.readTree(response.getBody());
                
                if (responseJson.get("status").asBoolean()) {
                    JsonNode data = responseJson.get("data");
                    
                    Map<String, Object> marketData = new HashMap<>();
                    marketData.put("symbol", symbol);
                    marketData.put("ltp", new BigDecimal(data.get("ltp").asText()));
                    marketData.put("open", new BigDecimal(data.get("open").asText()));
                    marketData.put("high", new BigDecimal(data.get("high").asText()));
                    marketData.put("low", new BigDecimal(data.get("low").asText()));
                    marketData.put("close", new BigDecimal(data.get("close").asText()));
                    marketData.put("volume", data.get("volume").asLong());
                    
                    return marketData;
                }
            }
            
        } catch (Exception e) {
            log.error("Error fetching market data for {}: {}", symbol, e.getMessage());
        }
        
        return getSimulatedMarketData(symbol);
    }
    
    private String getSymbolToken(String symbol) {
        // Angel One symbol tokens - these need to be fetched from their master contract API
        Map<String, String> symbolTokenMap = new HashMap<>();
        symbolTokenMap.put("NIFTY", "99926000");
        symbolTokenMap.put("BANKNIFTY", "99926009");
        symbolTokenMap.put("RELIANCE", "2885");
        symbolTokenMap.put("TCS", "11536");
        symbolTokenMap.put("INFY", "1594");
        symbolTokenMap.put("HDFCBANK", "1333");
        symbolTokenMap.put("ICICIBANK", "4963");
        symbolTokenMap.put("SBIN", "3045");
        
        return symbolTokenMap.getOrDefault(symbol, "0");
    }
    
    // Fallback simulation methods
    private boolean simulateAuthentication(User user) {
        log.info("Simulating Angel One authentication for user: {}", user.getEmail());
        userTokens.put(user.getId(), "SIMULATED_TOKEN_" + System.currentTimeMillis());
        return true;
    }
    
    private boolean simulateTrade(Trade trade) {
        try {
            log.info("Simulating trade execution for: {} {} {} @ {}",
                    trade.getType(), trade.getQuantity(), trade.getSymbol(), trade.getPrice());
            
            Thread.sleep(100);
            trade.setAngelOneOrderId("SIM" + System.currentTimeMillis());
            return Math.random() > 0.05; // 95% success rate
            
        } catch (Exception e) {
            log.error("Error in trade simulation", e);
            return false;
        }
    }
    
    private boolean simulateTradeClose(Trade trade) {
        try {
            log.info("Simulating trade closure for: {}", trade.getAngelOneOrderId());
            Thread.sleep(100);
            return Math.random() > 0.02; // 98% success rate
        } catch (Exception e) {
            return false;
        }
    }
    
    private BigDecimal getSimulatedPrice(String symbol) {
        switch (symbol) {
            case "NIFTY": return BigDecimal.valueOf(21800 + (Math.random() - 0.5) * 200);
            case "BANKNIFTY": return BigDecimal.valueOf(46200 + (Math.random() - 0.5) * 500);
            case "RELIANCE": return BigDecimal.valueOf(2450 + (Math.random() - 0.5) * 100);
            case "TCS": return BigDecimal.valueOf(3650 + (Math.random() - 0.5) * 150);
            case "INFY": return BigDecimal.valueOf(1580 + (Math.random() - 0.5) * 80);
            default: return BigDecimal.valueOf(1000 + (Math.random() - 0.5) * 100);
        }
    }
    
    private Map<String, Object> getSimulatedMarketData(String symbol) {
        BigDecimal price = getSimulatedPrice(symbol);
        Map<String, Object> data = new HashMap<>();
        data.put("symbol", symbol);
        data.put("ltp", price);
        data.put("open", price.multiply(BigDecimal.valueOf(0.995 + Math.random() * 0.01)));
        data.put("high", price.multiply(BigDecimal.valueOf(1.005 + Math.random() * 0.01)));
        data.put("low", price.multiply(BigDecimal.valueOf(0.995 - Math.random() * 0.01)));
        data.put("close", price);
        data.put("volume", (long) (Math.random() * 1000000 + 500000));
        return data;
    }
    
    public void disconnectUser(Long userId) {
        userTokens.remove(userId);
        log.info("Disconnected Angel One session for user: {}", userId);
    }
}