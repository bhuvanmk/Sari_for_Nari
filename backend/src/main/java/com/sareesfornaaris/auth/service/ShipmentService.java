package com.sareesfornaaris.auth.service;

import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.Shipment;
import com.sareesfornaaris.auth.entity.ShipmentTracking;
import com.sareesfornaaris.auth.repository.OrderRepository;
import com.sareesfornaaris.auth.repository.ShipmentRepository;
import com.sareesfornaaris.auth.repository.ShipmentTrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ShipmentService {

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ShipmentTrackingRepository shipmentTrackingRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Optional<Shipment> getShipmentByOrder(Order order) {
        return shipmentRepository.findByOrder(order);
    }

    public List<ShipmentTracking> getTrackingHistory(Shipment shipment) {
        return shipmentTrackingRepository.findByShipmentOrderByTimestampAsc(shipment);
    }

    @Transactional
    public Shipment createOrUpdateShipment(Order order, String courierName, String trackingNumber, String currentLocation, String status) {
        Shipment shipment = shipmentRepository.findByOrder(order).orElseGet(() -> Shipment.builder()
                .order(order)
                .courierName(courierName != null ? courierName : "Express Logistics")
                .trackingNumber(trackingNumber != null ? trackingNumber : "TRK-" + System.currentTimeMillis())
                .currentLocation("Central Warehouse")
                .status("LABEL_CREATED")
                .estimatedDelivery(LocalDateTime.now().plusDays(4))
                .build());

        if (courierName != null) shipment.setCourierName(courierName);
        if (trackingNumber != null) shipment.setTrackingNumber(trackingNumber);
        if (currentLocation != null) shipment.setCurrentLocation(currentLocation);
        if (status != null) shipment.setStatus(status);

        Shipment savedShipment = shipmentRepository.save(shipment);

        // Update Order level courier details
        order.setCourierName(savedShipment.getCourierName());
        order.setTrackingNumber(savedShipment.getTrackingNumber());
        if (order.getEstimatedDeliveryDate() == null) {
            order.setEstimatedDeliveryDate(savedShipment.getEstimatedDelivery());
        }
        orderRepository.save(order);

        // Add tracking checkpoint entry
        ShipmentTracking trackingPoint = ShipmentTracking.builder()
                .shipment(savedShipment)
                .stage(savedShipment.getStatus())
                .location(savedShipment.getCurrentLocation())
                .description("Shipment status updated to " + savedShipment.getStatus() + " at " + savedShipment.getCurrentLocation())
                .timestamp(LocalDateTime.now())
                .build();
        shipmentTrackingRepository.save(trackingPoint);

        return savedShipment;
    }
}
