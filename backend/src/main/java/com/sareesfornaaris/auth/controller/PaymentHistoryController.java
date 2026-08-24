package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.MessageResponse;
import com.sareesfornaaris.auth.entity.PaymentHistory;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.PaymentHistoryRepository;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments-history")
public class PaymentHistoryController {

    @Autowired
    private PaymentHistoryRepository paymentHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/my-payments")
    public ResponseEntity<?> getMyPayments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<PaymentHistory> list = paymentHistoryRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(list);
    }
}
