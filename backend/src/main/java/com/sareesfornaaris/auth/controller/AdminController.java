package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.MessageResponse;
import com.sareesfornaaris.auth.entity.*;
import com.sareesfornaaris.auth.repository.*;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private AddressRepository addressRepository;

    private boolean isAdmin(UserDetailsImpl userDetails) {
        if (userDetails == null) return false;
        return userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // ==========================================
    // WORKSTREAM 1: PRODUCT MANAGEMENT
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }
        List<Product> products = productRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    @Transactional
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> data,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        try {
            String name = (String) data.get("name");
            String description = (String) data.get("description");
            BigDecimal price = new BigDecimal(data.get("price").toString());
            Integer stock = Integer.parseInt(data.get("stock").toString());
            Integer categoryId = Integer.parseInt(data.get("categoryId").toString());
            Integer subcategoryId = Integer.parseInt(data.get("subcategoryId").toString());
            String imageUrl = (String) data.get("imageUrl");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Product name is required."));
            }
            if (price.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(new MessageResponse("Price must be greater than 0."));
            }
            if (stock < 0) {
                return ResponseEntity.badRequest().body(new MessageResponse("Stock cannot be negative."));
            }

            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found ID: " + categoryId));
            SubCategory subcategory = subCategoryRepository.findById(subcategoryId)
                    .orElseThrow(() -> new RuntimeException("Subcategory not found ID: " + subcategoryId));

            Product product = Product.builder()
                    .name(name)
                    .description(description)
                    .price(price)
                    .stock(stock)
                    .category(category)
                    .subcategory(subcategory)
                    .isActive(true)
                    .images(new ArrayList<>())
                    .build();

            if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                ProductImage img = ProductImage.builder()
                        .product(product)
                        .imageUrl(imageUrl.trim())
                        .build();
                product.getImages().add(img);
            }

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to create product: " + e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<?> updateProduct(@PathVariable Integer id,
                                           @RequestBody Map<String, Object> data,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Product not found ID: " + id));

            if (data.containsKey("name")) product.setName((String) data.get("name"));
            if (data.containsKey("description")) product.setDescription((String) data.get("description"));
            if (data.containsKey("price")) product.setPrice(new BigDecimal(data.get("price").toString()));
            if (data.containsKey("stock")) product.setStock(Integer.parseInt(data.get("stock").toString()));

            if (data.containsKey("categoryId")) {
                Integer categoryId = Integer.parseInt(data.get("categoryId").toString());
                Category category = categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new RuntimeException("Category not found ID: " + categoryId));
                product.setCategory(category);
            }

            if (data.containsKey("subcategoryId")) {
                Integer subcategoryId = Integer.parseInt(data.get("subcategoryId").toString());
                SubCategory subcategory = subCategoryRepository.findById(subcategoryId)
                        .orElseThrow(() -> new RuntimeException("Subcategory not found ID: " + subcategoryId));
                product.setSubcategory(subcategory);
            }

            if (data.containsKey("imageUrl")) {
                String imageUrl = (String) data.get("imageUrl");
                if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                    if (product.getImages() != null && !product.getImages().isEmpty()) {
                        product.getImages().get(0).setImageUrl(imageUrl.trim());
                    } else {
                        ProductImage img = ProductImage.builder()
                                .product(product)
                                .imageUrl(imageUrl.trim())
                                .build();
                        product.getImages().add(img);
                    }
                }
            }

            Product updated = productRepository.save(product);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to update product: " + e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id,
                                              @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Product not found."));
        }

        // Soft-delete: preserve order history integrity
        product.setIsActive(false);
        productRepository.save(product);

        return ResponseEntity.ok(new MessageResponse("Product soft-deleted successfully. Historical orders preserved."));
    }

    // ==========================================
    // WORKSTREAM 2 & 4: USER MANAGEMENT & CUSTOMER DETAILS
    // ==========================================

    @GetMapping("/customers")
    public ResponseEntity<?> getCustomers(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        Page<User> usersPage = userRepository.findByRole(Role.USER, PageRequest.of(page, size, Sort.by("userId").descending()));

        List<Map<String, Object>> customers = usersPage.getContent().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("userId", user.getUserId());
            map.put("username", user.getUsername());
            map.put("email", user.getEmail());
            map.put("role", user.getRole().name());
            map.put("isVerified", user.getIsVerified());
            map.put("isActive", user.getIsActive() != null ? user.getIsActive() : true);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("customers", customers);
        response.put("currentPage", usersPage.getNumber());
        response.put("totalItems", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/sellers")
    public ResponseEntity<?> getSellers(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        Page<User> usersPage = userRepository.findByRole(Role.SELLER, PageRequest.of(page, size, Sort.by("userId").descending()));

        List<Map<String, Object>> sellers = usersPage.getContent().stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("userId", user.getUserId());
            map.put("username", user.getUsername());
            map.put("email", user.getEmail());
            map.put("role", user.getRole().name());
            map.put("isVerified", user.getIsVerified());
            map.put("isActive", user.getIsActive() != null ? user.getIsActive() : true);
            return map;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("sellers", sellers);
        response.put("currentPage", usersPage.getNumber());
        response.put("totalItems", usersPage.getTotalElements());
        response.put("totalPages", usersPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id,
                                        @RequestBody Map<String, String> data,
                                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found."));
        }

        if (data.containsKey("username")) user.setUsername(data.get("username"));
        if (data.containsKey("email")) user.setEmail(data.get("email"));
        if (data.containsKey("role")) {
            try {
                user.setRole(Role.valueOf(data.get("role").toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid role: " + data.get("role")));
            }
        }

        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User details updated successfully."));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Integer id,
                                              @RequestBody Map<String, Boolean> data,
                                              @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("User not found."));
        }

        Boolean isActive = data.getOrDefault("isActive", true);
        user.setIsActive(isActive);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User status updated to: " + (isActive ? "Active" : "Deactivated")));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<?> getCustomerProfile(@PathVariable Integer id,
                                               @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Customer not found."));
        }

        List<Address> addresses = addressRepository.findByUser(user);
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);

        BigDecimal lifetimeSpend = orders.stream()
                .filter(o -> !"Cancelled".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getUserId());
        result.put("username", user.getUsername());
        result.put("email", user.getEmail());
        result.put("role", user.getRole().name());
        result.put("isVerified", user.getIsVerified());
        result.put("isActive", user.getIsActive() != null ? user.getIsActive() : true);
        result.put("addresses", addresses);
        result.put("orders", orders);
        result.put("lifetimeSpend", lifetimeSpend);
        result.put("totalOrdersCount", orders.size());

        return ResponseEntity.ok(result);
    }

    // ==========================================
    // WORKSTREAM 3: REVENUE REPORTS
    // ==========================================

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueReport(@RequestParam(defaultValue = "daily") String period,
                                              @RequestParam(required = false) String date,
                                              @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        List<Order> allOrders = orderRepository.findAllByOrderByCreatedAtDesc();

        // Filter out cancelled orders
        List<Order> validOrders = allOrders.stream()
                .filter(o -> !"Cancelled".equalsIgnoreCase(o.getStatus()))
                .collect(Collectors.toList());

        LocalDate targetDate;
        try {
            targetDate = (date != null && !date.trim().isEmpty()) ? LocalDate.parse(date) : LocalDate.now();
        } catch (Exception e) {
            targetDate = LocalDate.now();
        }

        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalOrderCount = 0;
        List<Map<String, Object>> breakdown = new ArrayList<>();

        if ("daily".equalsIgnoreCase(period)) {
            LocalDate finalTargetDate = targetDate;
            List<Order> dayOrders = validOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().toLocalDate().equals(finalTargetDate))
                    .collect(Collectors.toList());

            totalOrderCount = dayOrders.size();
            totalRevenue = dayOrders.stream().map(Order::getTotalAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

            // Group by hour for daily view
            Map<Integer, BigDecimal> hourlyRev = new HashMap<>();
            Map<Integer, Integer> hourlyCount = new HashMap<>();
            for (int h = 0; h < 24; h++) {
                hourlyRev.put(h, BigDecimal.ZERO);
                hourlyCount.put(h, 0);
            }
            for (Order o : dayOrders) {
                int hour = o.getCreatedAt().getHour();
                hourlyRev.put(hour, hourlyRev.get(hour).add(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO));
                hourlyCount.put(hour, hourlyCount.get(hour) + 1);
            }
            for (int h = 0; h < 24; h++) {
                Map<String, Object> item = new HashMap<>();
                item.put("label", String.format("%02d:00", h));
                item.put("revenue", hourlyRev.get(h));
                item.put("orders", hourlyCount.get(h));
                breakdown.add(item);
            }

        } else if ("monthly".equalsIgnoreCase(period)) {
            YearMonth yearMonth = YearMonth.from(targetDate);
            List<Order> monthOrders = validOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && YearMonth.from(o.getCreatedAt()).equals(yearMonth))
                    .collect(Collectors.toList());

            totalOrderCount = monthOrders.size();
            totalRevenue = monthOrders.stream().map(Order::getTotalAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

            int daysInMonth = yearMonth.lengthOfMonth();
            Map<Integer, BigDecimal> dailyRev = new HashMap<>();
            Map<Integer, Integer> dailyCount = new HashMap<>();
            for (int d = 1; d <= daysInMonth; d++) {
                dailyRev.put(d, BigDecimal.ZERO);
                dailyCount.put(d, 0);
            }
            for (Order o : monthOrders) {
                int day = o.getCreatedAt().getDayOfMonth();
                dailyRev.put(day, dailyRev.get(day).add(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO));
                dailyCount.put(day, dailyCount.get(day) + 1);
            }
            for (int d = 1; d <= daysInMonth; d++) {
                Map<String, Object> item = new HashMap<>();
                item.put("label", String.format("Day %d", d));
                item.put("revenue", dailyRev.get(d));
                item.put("orders", dailyCount.get(d));
                breakdown.add(item);
            }

        } else if ("yearly".equalsIgnoreCase(period)) {
            int year = targetDate.getYear();
            List<Order> yearOrders = validOrders.stream()
                    .filter(o -> o.getCreatedAt() != null && o.getCreatedAt().getYear() == year)
                    .collect(Collectors.toList());

            totalOrderCount = yearOrders.size();
            totalRevenue = yearOrders.stream().map(Order::getTotalAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

            String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
            Map<Integer, BigDecimal> monthlyRev = new HashMap<>();
            Map<Integer, Integer> monthlyCount = new HashMap<>();
            for (int m = 1; m <= 12; m++) {
                monthlyRev.put(m, BigDecimal.ZERO);
                monthlyCount.put(m, 0);
            }
            for (Order o : yearOrders) {
                int month = o.getCreatedAt().getMonthValue();
                monthlyRev.put(month, monthlyRev.get(month).add(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO));
                monthlyCount.put(month, monthlyCount.get(month) + 1);
            }
            for (int m = 1; m <= 12; m++) {
                Map<String, Object> item = new HashMap<>();
                item.put("label", months[m - 1]);
                item.put("revenue", monthlyRev.get(m));
                item.put("orders", monthlyCount.get(m));
                breakdown.add(item);
            }
        }

        BigDecimal avgOrderValue = totalOrderCount > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalOrderCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> response = new HashMap<>();
        response.put("period", period);
        response.put("selectedDate", targetDate.toString());
        response.put("totalRevenue", totalRevenue);
        response.put("totalOrders", totalOrderCount);
        response.put("averageOrderValue", avgOrderValue);
        response.put("breakdown", breakdown);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (!isAdmin(userDetails)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access Denied: Admin role required."));
        }

        List<com.sareesfornaaris.auth.entity.Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();

        List<Map<String, Object>> result = orders.stream().map(order -> {
            Map<String, Object> map = new HashMap<>();
            map.put("orderId", order.getOrderId());
            map.put("totalAmount", order.getTotalAmount());
            map.put("status", order.getStatus());
            map.put("paymentMethod", order.getPaymentMethod());
            map.put("paymentStatus", order.getPaymentStatus());
            map.put("addressSnapshot", order.getAddressSnapshot());
            map.put("createdAt", order.getCreatedAt());
            map.put("items", order.getItems());
            map.put("statusHistory", order.getStatusHistory());
            if (order.getUser() != null) {
                Map<String, Object> userMap = new HashMap<>();
                userMap.put("userId", order.getUser().getUserId());
                userMap.put("username", order.getUser().getUsername());
                userMap.put("email", order.getUser().getEmail());
                map.put("user", userMap);
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
