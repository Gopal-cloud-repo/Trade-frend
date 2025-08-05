package com.angelone.trading.controller;

import com.angelone.trading.dto.TradeRequest;
import com.angelone.trading.entity.Trade;
import com.angelone.trading.entity.User;
import com.angelone.trading.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/trades")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TradeController {
    
    private final TradeService tradeService;
    
    @PostMapping
    public ResponseEntity<Trade> executeTrade(
            @Valid @RequestBody TradeRequest tradeRequest,
            @AuthenticationPrincipal User user) {
        
        Trade trade = new Trade();
        trade.setUser(user);
        trade.setSymbol(tradeRequest.getSymbol());
        trade.setType(tradeRequest.getType());
        trade.setQuantity(tradeRequest.getQuantity());
        trade.setPrice(tradeRequest.getPrice());
        trade.setStopLoss(tradeRequest.getStopLoss());
        trade.setTakeProfit(tradeRequest.getTakeProfit());
        
        Trade executedTrade = tradeService.executeTrade(trade);
        return ResponseEntity.ok(executedTrade);
    }
    
    @GetMapping
    public ResponseEntity<List<Trade>> getUserTrades(@AuthenticationPrincipal User user) {
        List<Trade> trades = tradeService.getUserTrades(user);
        return ResponseEntity.ok(trades);
    }
    
    @GetMapping("/open")
    public ResponseEntity<List<Trade>> getOpenTrades(@AuthenticationPrincipal User user) {
        List<Trade> trades = tradeService.getUserOpenTrades(user);
        return ResponseEntity.ok(trades);
    }
    
    @PostMapping("/{tradeId}/close")
    public ResponseEntity<Trade> closeTrade(
            @PathVariable Long tradeId,
            @AuthenticationPrincipal User user) {
        
        Trade closedTrade = tradeService.closeTrade(tradeId, user);
        return ResponseEntity.ok(closedTrade);
    }
}