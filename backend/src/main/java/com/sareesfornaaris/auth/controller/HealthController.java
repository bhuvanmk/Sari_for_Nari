package com.sareesfornaaris.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public ResponseEntity<?> rootHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Sarees For Naaris API",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/api/health")
    public ResponseEntity<?> apiHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Sarees For Naaris API",
                "timestamp", System.currentTimeMillis()
        ));
    }
}
