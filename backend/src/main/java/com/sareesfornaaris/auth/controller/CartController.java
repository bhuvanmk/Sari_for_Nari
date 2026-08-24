package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.AddToCartRequest;
import com.sareesfornaaris.auth.dto.MessageResponse;
import com.sareesfornaaris.auth.entity.CartItem;
import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.OrderItem;
import com.sareesfornaaris.auth.entity.Product;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.CartItemRepository;
import com.sareesfornaaris.auth.repository.OrderItemRepository;
import com.sareesfornaaris.auth.repository.OrderRepository;
import com.sareesfornaaris.auth.repository.ProductRepository;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @PostMapping
    public ResponseEntity<?> addToCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody AddToCartRequest request) {
        
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItem = cartItemRepository.findByUserAndProduct_ProductId(user, request.getProductId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(item);
        }

        Integer totalCount = cartItemRepository.countTotalItemsByUserId(user.getUserId());
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product added to cart successfully!");
        response.put("cartCount", totalCount);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    public ResponseEntity<?> getCartCount(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(Map.of("cartCount", 0));
        }

        Integer totalCount = cartItemRepository.countTotalItemsByUserId(userDetails.getId());
        return ResponseEntity.ok(Map.of("cartCount", totalCount != null ? totalCount : 0));
    }

    @GetMapping
    public ResponseEntity<?> getCartItems(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CartItem> items = cartItemRepository.findByUser(user);
        return ResponseEntity.ok(items);
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<?> updateCartItem(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Integer cartItemId, @RequestBody Map<String, Integer> request) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Not authorized to update this cart item."));
        }

        Integer newQuantity = request.get("quantity");
        if (newQuantity == null || newQuantity < 1) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid quantity."));
        }

        Product product = cartItem.getProduct();
        if (newQuantity > product.getStock()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Cannot add more than available stock. Available: " + product.getStock()));
        }

        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);

        return ResponseEntity.ok(new MessageResponse("Cart item quantity updated successfully!"));
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<?> removeCartItem(@AuthenticationPrincipal UserDetailsImpl userDetails, @PathVariable Integer cartItemId) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Not authorized to delete this cart item."));
        }

        cartItemRepository.delete(cartItem);
        return ResponseEntity.ok(new MessageResponse("Cart item removed successfully!"));
    }

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkoutCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Cart is empty."));
        }

        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .orderId("ORD-" + System.currentTimeMillis())
                .user(user)
                .totalAmount(totalAmount)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (cartItem.getQuantity() > product.getStock()) {
                orderRepository.delete(savedOrder);
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Insufficient stock for product: " + product.getName() + ". Available: " + product.getStock()));
            }

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .pricePerUnit(product.getPrice())
                    .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .quantity(cartItem.getQuantity())
                    .build();

            orderItems.add(orderItem);
        }

        orderItemRepository.saveAll(orderItems);
        cartItemRepository.deleteAll(cartItems);

        return ResponseEntity.ok(savedOrder);
    }
}
