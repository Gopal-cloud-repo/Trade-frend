package com.angelone.trading.controller;

import com.angelone.trading.dto.StrategyRequest;
import com.angelone.trading.entity.Strategy;
import com.angelone.trading.entity.User;
import com.angelone.trading.repository.StrategyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/strategies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StrategyController {
    
    private final StrategyRepository strategyRepository;
    
    @PostMapping
    public ResponseEntity<Strategy> createStrategy(
            @Valid @RequestBody StrategyRequest strategyRequest,
            @AuthenticationPrincipal User user) {
        
        Strategy strategy = new Strategy();
        strategy.setUser(user);
        strategy.setName(strategyRequest.getName());
        strategy.setType(strategyRequest.getType());
        strategy.setTimeFrame(strategyRequest.getTimeFrame());
        strategy.setEmaFast(strategyRequest.getEmaFast());
        strategy.setEmaSlow(strategyRequest.getEmaSlow());
        strategy.setRsiPeriod(strategyRequest.getRsiPeriod());
        strategy.setStopLossPercentage(strategyRequest.getStopLossPercentage());
        strategy.setTakeProfitPercentage(strategyRequest.getTakeProfitPercentage());
        strategy.setMaxCapitalPercentage(strategyRequest.getMaxCapitalPercentage());
        
        Strategy savedStrategy = strategyRepository.save(strategy);
        return ResponseEntity.ok(savedStrategy);
    }
    
    @GetMapping
    public ResponseEntity<List<Strategy>> getUserStrategies(@AuthenticationPrincipal User user) {
        List<Strategy> strategies = strategyRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(strategies);
    }
    
    @PutMapping("/{strategyId}")
    public ResponseEntity<Strategy> updateStrategy(
            @PathVariable Long strategyId,
            @Valid @RequestBody StrategyRequest strategyRequest,
            @AuthenticationPrincipal User user) {
        
        Strategy strategy = strategyRepository.findById(strategyId)
                .orElseThrow(() -> new RuntimeException("Strategy not found"));
        
        if (!strategy.getUser().getId().equals(user.getId())) {
            return ResponseEntity.forbidden().build();
        }
        
        strategy.setName(strategyRequest.getName());
        strategy.setType(strategyRequest.getType());
        strategy.setTimeFrame(strategyRequest.getTimeFrame());
        strategy.setEmaFast(strategyRequest.getEmaFast());
        strategy.setEmaSlow(strategyRequest.getEmaSlow());
        strategy.setRsiPeriod(strategyRequest.getRsiPeriod());
        strategy.setStopLossPercentage(strategyRequest.getStopLossPercentage());
        strategy.setTakeProfitPercentage(strategyRequest.getTakeProfitPercentage());
        strategy.setMaxCapitalPercentage(strategyRequest.getMaxCapitalPercentage());
        
        Strategy updatedStrategy = strategyRepository.save(strategy);
        return ResponseEntity.ok(updatedStrategy);
    }
    
    @PostMapping("/{strategyId}/toggle")
    public ResponseEntity<Strategy> toggleStrategy(
            @PathVariable Long strategyId,
            @AuthenticationPrincipal User user) {
        
        Strategy strategy = strategyRepository.findById(strategyId)
                .orElseThrow(() -> new RuntimeException("Strategy not found"));
        
        if (!strategy.getUser().getId().equals(user.getId())) {
            return ResponseEntity.forbidden().build();
        }
        
        strategy.setIsActive(!strategy.getIsActive());
        Strategy updatedStrategy = strategyRepository.save(strategy);
        return ResponseEntity.ok(updatedStrategy);
    }
    
    @DeleteMapping("/{strategyId}")
    public ResponseEntity<Void> deleteStrategy(
            @PathVariable Long strategyId,
            @AuthenticationPrincipal User user) {
        
        Strategy strategy = strategyRepository.findById(strategyId)
                .orElseThrow(() -> new RuntimeException("Strategy not found"));
        
        if (!strategy.getUser().getId().equals(user.getId())) {
            return ResponseEntity.forbidden().build();
        }
        
        strategyRepository.delete(strategy);
        return ResponseEntity.ok().build();
    }
}