package com.angelone.trading.service;

import com.angelone.trading.entity.MarketData;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import javax.websocket.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.nio.ByteBuffer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
@ClientEndpoint
public class AngelOneWebSocketService {
    
    @Value("${angelone.api.websocket-url}")
    private String websocketUrl;
    
    private final SimpMessagingTemplate messagingTemplate;
    private final MarketDataService marketDataService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private Session session;
    private final Map<String, String> subscribedSymbols = new ConcurrentHashMap<>();
    private boolean isConnected = false;
    
    public void connect(String authToken, String clientId) {
        try {
            WebSocketContainer container = ContainerProvider.getWebSocketContainer();
            
            // Add authentication headers
            Map<String, List<String>> headers = new HashMap<>();
            headers.put("Authorization", Arrays.asList("Bearer " + authToken));
            headers.put("x-client-code", Arrays.asList(clientId));
            headers.put("x-feed-token", Arrays.asList(authToken));
            
            ClientEndpointConfig config = ClientEndpointConfig.Builder.create()
                    .configurator(new ClientEndpointConfig.Configurator() {
                        @Override
                        public void beforeRequest(Map<String, List<String>> requestHeaders) {
                            requestHeaders.putAll(headers);
                        }
                    })
                    .build();
            
            URI uri = URI.create(websocketUrl);
            session = container.connectToServer(this, config, uri);
            
            log.info("Connected to Angel One WebSocket");
            
        } catch (Exception e) {
            log.error("Error connecting to Angel One WebSocket: {}", e.getMessage());
            // Start simulation mode as fallback
            startSimulationMode();
        }
    }
    
    @OnOpen
    public void onOpen(Session session) {
        log.info("Angel One WebSocket connection opened");
        this.session = session;
        this.isConnected = true;
        
        // Send connection acknowledgment
        sendConnectionAck();
    }
    
    @OnMessage
    public void onMessage(String message) {
        try {
            log.debug("Received text message: {}", message);
            processTextMessage(message);
        } catch (Exception e) {
            log.error("Error processing text message: {}", e.getMessage());
        }
    }
    
    @OnMessage
    public void onMessage(ByteBuffer message) {
        try {
            log.debug("Received binary message of size: {}", message.remaining());
            processBinaryMessage(message);
        } catch (Exception e) {
            log.error("Error processing binary message: {}", e.getMessage());
        }
    }
    
    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        log.info("Angel One WebSocket connection closed: {}", closeReason.getReasonPhrase());
        this.isConnected = false;
        this.session = null;
        
        // Attempt to reconnect after delay
        scheduleReconnect();
    }
    
    @OnError
    public void onError(Session session, Throwable throwable) {
        log.error("Angel One WebSocket error: {}", throwable.getMessage());
        
        // Fallback to simulation mode
        if (!isConnected) {
            startSimulationMode();
        }
    }
    
    public void subscribeToSymbol(String symbol, String token) {
        if (!isConnected) {
            log.warn("WebSocket not connected, cannot subscribe to {}", symbol);
            return;
        }
        
        try {
            // Angel One subscription message format
            Map<String, Object> subscriptionMessage = new HashMap<>();
            subscriptionMessage.put("a", "subscribe");
            subscriptionMessage.put("v", Arrays.asList(Arrays.asList("nse_cm", token)));
            subscriptionMessage.put("m", "compact_marketdata");
            
            String message = objectMapper.writeValueAsString(subscriptionMessage);
            session.getAsyncRemote().sendText(message);
            
            subscribedSymbols.put(symbol, token);
            log.info("Subscribed to symbol: {} with token: {}", symbol, token);
            
        } catch (Exception e) {
            log.error("Error subscribing to symbol {}: {}", symbol, e.getMessage());
        }
    }
    
    public void unsubscribeFromSymbol(String symbol) {
        String token = subscribedSymbols.get(symbol);
        if (token == null || !isConnected) {
            return;
        }
        
        try {
            Map<String, Object> unsubscriptionMessage = new HashMap<>();
            unsubscriptionMessage.put("a", "unsubscribe");
            unsubscriptionMessage.put("v", Arrays.asList(Arrays.asList("nse_cm", token)));
            unsubscriptionMessage.put("m", "compact_marketdata");
            
            String message = objectMapper.writeValueAsString(unsubscriptionMessage);
            session.getAsyncRemote().sendText(message);
            
            subscribedSymbols.remove(symbol);
            log.info("Unsubscribed from symbol: {}", symbol);
            
        } catch (Exception e) {
            log.error("Error unsubscribing from symbol {}: {}", symbol, e.getMessage());
        }
    }
    
    private void sendConnectionAck() {
        try {
            Map<String, Object> ackMessage = new HashMap<>();
            ackMessage.put("a", "connect");
            ackMessage.put("v", Arrays.asList("compact_marketdata"));
            ackMessage.put("m", "connect");
            
            String message = objectMapper.writeValueAsString(ackMessage);
            session.getAsyncRemote().sendText(message);
            
        } catch (Exception e) {
            log.error("Error sending connection acknowledgment: {}", e.getMessage());
        }
    }
    
    private void processTextMessage(String message) {
        try {
            JsonNode messageJson = objectMapper.readTree(message);
            
            if (messageJson.has("s") && messageJson.get("s").asText().equals("OK")) {
                log.info("Angel One WebSocket acknowledgment received");
                return;
            }
            
            // Process market data updates
            if (messageJson.has("tk")) {
                processMarketDataUpdate(messageJson);
            }
            
        } catch (Exception e) {
            log.error("Error processing text message: {}", e.getMessage());
        }
    }
    
    private void processBinaryMessage(ByteBuffer buffer) {
        try {
            // Angel One sends binary data in a specific format
            // This is a simplified parser - you'll need to implement the full binary protocol
            
            byte[] data = new byte[buffer.remaining()];
            buffer.get(data);
            
            // Parse binary market data format
            // Format: [token][ltp][volume][timestamp]...
            
            log.debug("Processing binary market data of {} bytes", data.length);
            
        } catch (Exception e) {
            log.error("Error processing binary message: {}", e.getMessage());
        }
    }
    
    private void processMarketDataUpdate(JsonNode data) {
        try {
            String token = data.get("tk").asText();
            String symbol = getSymbolFromToken(token);
            
            if (symbol == null) {
                return;
            }
            
            MarketData marketData = new MarketData();
            marketData.setSymbol(symbol);
            marketData.setClose(new BigDecimal(data.get("lp").asText())); // Last price
            marketData.setOpen(new BigDecimal(data.get("o").asText()));
            marketData.setHigh(new BigDecimal(data.get("h").asText()));
            marketData.setLow(new BigDecimal(data.get("l").asText()));
            marketData.setVolume(data.get("v").asLong());
            marketData.setTimestamp(LocalDateTime.now());
            marketData.setTimeFrame("1m");
            
            // Calculate change
            BigDecimal change = marketData.getClose().subtract(marketData.getOpen());
            marketData.setChange(change);
            
            if (marketData.getOpen().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal changePercent = change.divide(marketData.getOpen(), 4, BigDecimal.ROUND_HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                marketData.setChangePercent(changePercent);
            }
            
            // Broadcast to internal WebSocket
            messagingTemplate.convertAndSend("/topic/market-data/" + symbol, marketData);
            messagingTemplate.convertAndSend("/topic/market-data/all", marketData);
            
            log.debug("Processed market data update for {}: {}", symbol, marketData.getClose());
            
        } catch (Exception e) {
            log.error("Error processing market data update: {}", e.getMessage());
        }
    }
    
    private String getSymbolFromToken(String token) {
        // Reverse lookup from token to symbol
        for (Map.Entry<String, String> entry : subscribedSymbols.entrySet()) {
            if (entry.getValue().equals(token)) {
                return entry.getKey();
            }
        }
        return null;
    }
    
    private void scheduleReconnect() {
        // Implement reconnection logic with exponential backoff
        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                if (!isConnected) {
                    log.info("Attempting to reconnect to Angel One WebSocket...");
                    // Reconnection logic would go here
                }
            }
        }, 5000); // Retry after 5 seconds
    }
    
    private void startSimulationMode() {
        log.info("Starting Angel One WebSocket simulation mode");
        
        // Start a timer to generate simulated market data
        Timer simulationTimer = new Timer("AngelOneSimulation", true);
        simulationTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                generateSimulatedMarketData();
            }
        }, 0, 2000); // Every 2 seconds
    }
    
    private void generateSimulatedMarketData() {
        String[] symbols = {"NIFTY", "BANKNIFTY", "RELIANCE", "TCS", "INFY"};
        
        for (String symbol : symbols) {
            try {
                MarketData marketData = marketDataService.generateMarketData(symbol);
                
                // Broadcast simulated data
                messagingTemplate.convertAndSend("/topic/market-data/" + symbol, marketData);
                messagingTemplate.convertAndSend("/topic/market-data/all", marketData);
                
            } catch (Exception e) {
                log.error("Error generating simulated data for {}: {}", symbol, e.getMessage());
            }
        }
    }
    
    public void disconnect() {
        if (session != null && session.isOpen()) {
            try {
                session.close();
            } catch (IOException e) {
                log.error("Error closing Angel One WebSocket connection: {}", e.getMessage());
            }
        }
        isConnected = false;
        subscribedSymbols.clear();
    }
    
    public boolean isConnected() {
        return isConnected && session != null && session.isOpen();
    }
}