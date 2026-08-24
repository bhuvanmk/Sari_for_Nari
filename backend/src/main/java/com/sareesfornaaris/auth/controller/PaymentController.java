package com.sareesfornaaris.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.sareesfornaaris.auth.dto.MessageResponse;
import com.sareesfornaaris.auth.entity.CartItem;
import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.OrderItem;
import com.sareesfornaaris.auth.entity.OrderStatusHistory;
import com.sareesfornaaris.auth.entity.PaymentHistory;
import com.sareesfornaaris.auth.entity.Product;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.CartItemRepository;
import com.sareesfornaaris.auth.repository.OrderItemRepository;
import com.sareesfornaaris.auth.repository.OrderRepository;
import com.sareesfornaaris.auth.repository.OrderStatusHistoryRepository;
import com.sareesfornaaris.auth.repository.ProductRepository;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${RAZORPAY_KEY_ID:rzp_test_TKRCcwoUzNdkk5}")
    private String razorpayKeyId;

    @Value("${RAZORPAY_KEY_SECRET:HjTAF8bl7toiKMqjjgJtGAFZ}")
    private String razorpayKeySecret;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Autowired
    private com.sareesfornaaris.auth.repository.PaymentHistoryRepository paymentHistoryRepository;

    @Autowired
    private com.sareesfornaaris.auth.service.InvoiceService invoiceService;

    @Autowired
    private com.sareesfornaaris.auth.service.ShipmentService shipmentService;

    @Autowired
    private com.sareesfornaaris.auth.service.EmailNotificationService emailNotificationService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createRazorpayOrder(@RequestBody Map<String, Object> data,
                                                  @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthorized"));
        }

        try {
            System.out.println("=== Payment Create Order Request ===");
            System.out.println("Request data: " + data);
            System.out.println("User: " + userDetails.getUsername());

            Object amountObj = data.get("amount");
            System.out.println("Amount object: " + amountObj + ", type: " + (amountObj != null ? amountObj.getClass().getName() : "null"));
            
            if (amountObj == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Amount is required"));
            }
            
            Double amountDouble = Double.parseDouble(amountObj.toString());
            System.out.println("Parsed amount: " + amountDouble);
            int amountInPaise = (int) Math.round(amountDouble * 100);
            System.out.println("Amount in paise: " + amountInPaise);

            String receipt = data.containsKey("receipt") ? data.get("receipt").toString() : "txn_" + System.currentTimeMillis();

            System.out.println("Creating Razorpay client with key: " + razorpayKeyId.substring(0, Math.min(10, razorpayKeyId.length())) + "...");
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", receipt);

            com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequest);
            System.out.println("Razorpay order created: " + razorpayOrder.get("id"));

            return ResponseEntity.ok(Map.of(
                    "id", razorpayOrder.get("id") != null ? razorpayOrder.get("id").toString() : null,
                    "currency", razorpayOrder.get("currency") != null ? razorpayOrder.get("currency").toString() : null,
                    "amount", razorpayOrder.get("amount") != null ? razorpayOrder.get("amount").toString() : null,
                    "key", razorpayKeyId
            ));
        } catch (RazorpayException e) {
            System.err.println("Razorpay error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Razorpay error: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Payment initialization error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new MessageResponse("Payment initialization failed: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    @Transactional
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data,
                                            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthorized"));
        }

        String razorpayOrderId = data.get("razorpay_order_id");
        String razorpayPaymentId = data.get("razorpay_payment_id");
        String razorpaySignature = data.get("razorpay_signature");
        String addressSnapshot = data.get("address_snapshot");
        String paymentMethod = data.getOrDefault("payment_method", "ONLINE");

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isSignatureValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isSignatureValid) {
                return ResponseEntity.badRequest().body(new MessageResponse("Payment verification failed: Invalid signature"));
            }

            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<CartItem> cartItems = cartItemRepository.findByUser(user);
            if (cartItems.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Cart is empty"));
            }

            BigDecimal totalAmount = cartItems.stream()
                    .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            for (CartItem cartItem : cartItems) {
                Product product = cartItem.getProduct();
                if (cartItem.getQuantity() > product.getStock()) {
                    return ResponseEntity.badRequest().body(new MessageResponse(
                            "Error: Insufficient stock for product: " + product.getName() + ". Available: " + product.getStock()));
                }
            }

            Order order = Order.builder()
                    .orderId("ORD-" + System.currentTimeMillis())
                    .user(user)
                    .totalAmount(totalAmount)
                    .status("Order Placed")
                    .paymentMethod(paymentMethod)
                    .paymentStatus("PAID")
                    .addressSnapshot(addressSnapshot)
                    .billingAddressSnapshot(addressSnapshot)
                    .estimatedDeliveryDate(LocalDateTime.now().plusDays(5))
                    .createdAt(LocalDateTime.now())
                    .build();

            Order savedOrder = orderRepository.save(order);

            // Record initial status history
            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(savedOrder)
                    .status("Order Placed")
                    .changedAt(LocalDateTime.now())
                    .changedByUserId(user.getUserId())
                    .build();
            orderStatusHistoryRepository.save(history);

            List<OrderItem> orderItems = new ArrayList<>();
            for (CartItem cartItem : cartItems) {
                Product product = cartItem.getProduct();
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

            // Record Payment History entry
            try {
                PaymentHistory paymentHistory = PaymentHistory.builder()
                        .order(savedOrder)
                        .user(user)
                        .transactionId(razorpayPaymentId)
                        .paymentMethod("RAZORPAY")
                        .paymentStatus("PAID")
                        .amount(totalAmount)
                        .build();
                paymentHistoryRepository.save(paymentHistory);
            } catch (Exception ex) {
                System.err.println("Failed to log payment history: " + ex.getMessage());
            }

            // Auto-provision Invoice, Shipment, and Email Notification
            try {
                if (invoiceService != null) {
                    invoiceService.getOrCreateInvoice(savedOrder);
                }
                if (shipmentService != null) {
                    shipmentService.createOrUpdateShipment(savedOrder, "Express Logistics", "TRK-" + System.currentTimeMillis(), "Central Warehouse", "LABEL_CREATED");
                }
                if (emailNotificationService != null) {
                    emailNotificationService.sendOrderConfirmationEmail(savedOrder);
                }
            } catch (Exception ex) {
                System.err.println("Non-critical post order provisioning warning: " + ex.getMessage());
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Payment verified and order created successfully",
                    "orderId", savedOrder.getOrderId(),
                    "status", "Order Placed",
                    "paymentId", razorpayPaymentId
            ));

        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Verification failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Order creation failed: " + e.getMessage()));
        }
    }

    @PostMapping("/handle-webhook")
    public ResponseEntity<?> handleWebhook(@RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
                                           @RequestBody String payload) {
        try {
            boolean isValidSignature = Utils.verifyWebhookSignature(payload, signature, razorpayKeySecret);
            if (!isValidSignature) {
                return ResponseEntity.badRequest().body("Invalid webhook signature");
            }
            
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> webhookData = mapper.readValue(payload, Map.class);
            String event = (String) webhookData.get("event");
            
            if ("payment.failed".equals(event)) {
                Map<String, Object> paymentData = (Map<String, Object>) webhookData.get("payload");
                Map<String, Object> payment = (Map<String, Object>) paymentData.get("payment");
                
                String orderId = (String) payment.get("order_id");
                
                orderRepository.findById(orderId).ifPresent(order -> {
                    if ("CONFIRMED".equals(order.getStatus())) {
                        order.setStatus("CANCELLED");
                        order.setPaymentStatus("FAILED");
                        orderRepository.save(order);
                    }
                });
            }
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook processing failed: " + e.getMessage());
        }
    }
}