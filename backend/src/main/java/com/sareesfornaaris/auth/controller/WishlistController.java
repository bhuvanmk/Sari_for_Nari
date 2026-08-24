package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.entity.Product;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.entity.Wishlist;
import com.sareesfornaaris.auth.repository.ProductRepository;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<?> getWishlist(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        User user = userRepository.findByEmail(authentication.getName())
                .or(() -> userRepository.findByUsername(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Wishlist> items = wishlistRepository.findByUser(user);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<?> addToWishlist(@RequestBody Map<String, Integer> payload, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        Integer productId = payload.get("productId");
        if (productId == null) return ResponseEntity.badRequest().body("productId is required");

        User user = userRepository.findByEmail(authentication.getName())
                .or(() -> userRepository.findByUsername(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!wishlistRepository.existsByUserAndProduct_ProductId(user, productId)) {
            Wishlist item = Wishlist.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistRepository.save(item);
        }

        return ResponseEntity.ok(Map.of("message", "Item added to wishlist successfully"));
    }

    @DeleteMapping("/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromWishlist(@PathVariable Integer productId, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");

        User user = userRepository.findByEmail(authentication.getName())
                .or(() -> userRepository.findByUsername(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        wishlistRepository.deleteByUserAndProduct_ProductId(user, productId);
        return ResponseEntity.ok(Map.of("message", "Item removed from wishlist"));
    }
}
