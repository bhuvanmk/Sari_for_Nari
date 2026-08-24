package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.PaymentHistory;
import com.sareesfornaaris.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Integer> {
    List<PaymentHistory> findByUserOrderByCreatedAtDesc(User user);
    List<PaymentHistory> findByOrder(Order order);
    List<PaymentHistory> findAllByOrderByCreatedAtDesc();
}
