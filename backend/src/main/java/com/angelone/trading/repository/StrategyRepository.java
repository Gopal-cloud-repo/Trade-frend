package com.angelone.trading.repository;

import com.angelone.trading.entity.Strategy;
import com.angelone.trading.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StrategyRepository extends JpaRepository<Strategy, Long> {
    List<Strategy> findByUserOrderByCreatedAtDesc(User user);
    List<Strategy> findByUserAndIsActiveTrue(User user);
    List<Strategy> findByIsActiveTrue();
}