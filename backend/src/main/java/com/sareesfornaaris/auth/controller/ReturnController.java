package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.MessageResponse;
import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.Product;
import com.sareesfornaaris.auth.entity.ReturnRequest;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.OrderRepository;
import com.sareesfornaaris.auth.repository.ProductRepository;
import com.sareesfornaaris.auth.repository.ReturnRequestRepository;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/returns")
public class ReturnController {

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/my-returns")
    public ResponseEntity<?> getMyReturns(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ReturnRequest> list = returnRequestRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> createReturnRequest(@RequestBody Map<String, Object> body,
                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        String orderId = (String) body.get("orderId");
        Integer productId = body.get("productId") != null ? Integer.parseInt(body.get("productId").toString()) : null;
        String type = (String) body.getOrDefault("type", "RETURN");
        String reason = (String) body.get("reason");
        String comments = (String) body.get("comments");
        String imageUrl = (String) body.get("imageUrl");

        if (orderId == null || productId == null || reason == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Missing required fields: orderId, productId, reason."));
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Unauthorized to request return for this order."));
        }

        if (!"DELIVERED".equalsIgnoreCase(order.getStatus())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Returns can only be requested for delivered orders. Current status: " + order.getStatus()));
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepository.findById(userDetails.getId()).get();

        ReturnRequest req = ReturnRequest.builder()
                .order(order)
                .product(product)
                .user(user)
                .type(type)
                .reason(reason)
                .comments(comments)
                .imageUrl(imageUrl)
                .status("REQUESTED")
                .build();

        ReturnRequest saved = returnRequestRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllReturnsForAdmin(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null || userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Admin access required."));
        }

        List<ReturnRequest> list = returnRequestRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(list);
    }

    @PutMapping("/admin/{returnId}/status")
    public ResponseEntity<?> updateReturnStatus(@PathVariable Integer returnId,
                                                @RequestBody Map<String, String> body,
                                                @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null || userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Admin access required."));
        }

        ReturnRequest req = returnRequestRepository.findById(returnId)
                .orElseThrow(() -> new RuntimeException("Return request not found"));

        String newStatus = body.get("status");
        if (newStatus != null && !newStatus.trim().isEmpty()) {
            req.setStatus(newStatus);
            returnRequestRepository.save(req);
            return ResponseEntity.ok(Map.of("message", "Return status updated to " + newStatus, "returnId", returnId, "status", newStatus));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("Invalid status provided."));
    }
}
