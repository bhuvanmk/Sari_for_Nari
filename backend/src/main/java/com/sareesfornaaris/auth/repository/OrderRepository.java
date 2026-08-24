package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Order;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    java.util.List<Order> findByUserOrderByCreatedAtDesc(com.sareesfornaaris.auth.entity.User user);
    java.util.List<Order> findAllByOrderByCreatedAtDesc();
    Optional<Order> findByOrderId(String orderId);
}
