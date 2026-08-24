package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Shipment;
import com.sareesfornaaris.auth.entity.ShipmentTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentTrackingRepository extends JpaRepository<ShipmentTracking, Integer> {
    List<ShipmentTracking> findByShipmentOrderByTimestampAsc(Shipment shipment);
}
