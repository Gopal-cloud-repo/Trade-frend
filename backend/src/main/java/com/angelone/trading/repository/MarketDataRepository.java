package com.angelone.trading.repository;

import com.angelone.trading.entity.MarketData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarketDataRepository extends JpaRepository<MarketData, Long> {
    @Query("SELECT m FROM MarketData m WHERE m.symbol = :symbol AND m.timeFrame = :timeFrame ORDER BY m.timestamp DESC")
    List<MarketData> findBySymbolAndTimeFrameOrderByTimestampDesc(@Param("symbol") String symbol, @Param("timeFrame") String timeFrame);
    
    @Query("SELECT m FROM MarketData m WHERE m.symbol = :symbol AND m.timeFrame = :timeFrame AND m.timestamp >= :startTime ORDER BY m.timestamp DESC")
    List<MarketData> findBySymbolAndTimeFrameAndTimestampAfter(@Param("symbol") String symbol, @Param("timeFrame") String timeFrame, @Param("startTime") LocalDateTime startTime);
    
    Optional<MarketData> findTopBySymbolAndTimeFrameOrderByTimestampDesc(String symbol, String timeFrame);
}