package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.ReturnRequest;
import com.sareesfornaaris.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Integer> {
    List<ReturnRequest> findByUserOrderByCreatedAtDesc(User user);
    List<ReturnRequest> findByOrder(Order order);
    List<ReturnRequest> findAllByOrderByCreatedAtDesc();
}
