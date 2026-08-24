package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Integer> {
    List<OrderStatusHistory> findByOrderOrderByChangedAtAsc(Order order);
}
