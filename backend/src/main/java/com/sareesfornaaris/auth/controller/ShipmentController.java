package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.MessageResponse;
import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.Shipment;
import com.sareesfornaaris.auth.entity.ShipmentTracking;
import com.sareesfornaaris.auth.repository.OrderRepository;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import com.sareesfornaaris.auth.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    @Autowired
    private ShipmentService shipmentService;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getShipmentTracking(@PathVariable String orderId,
                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !order.getUser().getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Unauthorized to view shipment."));
        }

        Optional<Shipment> shipmentOpt = shipmentService.getShipmentByOrder(order);
        if (shipmentOpt.isEmpty()) {
            // Auto-provision initial shipment state if not present
            Shipment newShipment = shipmentService.createOrUpdateShipment(order, "Express Logistics", "TRK-" + System.currentTimeMillis(), "Central Warehouse", "LABEL_CREATED");
            List<ShipmentTracking> history = shipmentService.getTrackingHistory(newShipment);
            return ResponseEntity.ok(Map.of("shipment", newShipment, "tracking", history));
        }

        Shipment shipment = shipmentOpt.get();
        List<ShipmentTracking> trackingHistory = shipmentService.getTrackingHistory(shipment);
        return ResponseEntity.ok(Map.of("shipment", shipment, "tracking", trackingHistory));
    }

    @PostMapping("/admin/{orderId}/update")
    public ResponseEntity<?> adminUpdateShipment(@PathVariable String orderId,
                                                 @RequestBody Map<String, String> body,
                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null || userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Admin access required."));
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String courier = body.get("courierName");
        String trackingNum = body.get("trackingNumber");
        String location = body.get("currentLocation");
        String status = body.get("status");

        Shipment updated = shipmentService.createOrUpdateShipment(order, courier, trackingNum, location, status);
        List<ShipmentTracking> trackingHistory = shipmentService.getTrackingHistory(updated);

        return ResponseEntity.ok(Map.of(
                "message", "Shipment details updated successfully",
                "shipment", updated,
                "tracking", trackingHistory
        ));
    }
}
