package com.angelone.trading.controller;

import com.angelone.trading.entity.MarketData;
import com.angelone.trading.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/market-data")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MarketDataController {
    
    private final MarketDataService marketDataService;
    
    @GetMapping("/historical/{symbol}")
    public ResponseEntity<List<MarketData>> getHistoricalData(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1m") String timeFrame,
            @RequestParam(defaultValue = "100") int limit) {
        
        List<MarketData> data = marketDataService.getHistoricalData(symbol, timeFrame, limit);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/latest/{symbol}")
    public ResponseEntity<MarketData> getLatestData(@PathVariable String symbol) {
        MarketData data = marketDataService.getLatestData(symbol);
        return data != null ? ResponseEntity.ok(data) : ResponseEntity.notFound().build();
    }
    
    @GetMapping("/public/symbols")
    public ResponseEntity<List<String>> getAvailableSymbols() {
        List<String> symbols = List.of("NIFTY", "BANKNIFTY", "SENSEX", "RELIANCE", "TCS", "INFY");
        return ResponseEntity.ok(symbols);
    }
}