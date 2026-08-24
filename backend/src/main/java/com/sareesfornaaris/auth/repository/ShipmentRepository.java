package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Integer> {
    Optional<Shipment> findByOrder(Order order);
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
}
