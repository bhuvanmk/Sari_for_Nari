package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.MessageResponse;
import com.sareesfornaaris.auth.dto.ReviewRequest;
import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.Product;
import com.sareesfornaaris.auth.entity.Review;
import com.sareesfornaaris.auth.entity.Role;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.OrderRepository;
import com.sareesfornaaris.auth.repository.ProductRepository;
import com.sareesfornaaris.auth.repository.ReviewRepository;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    // List of words triggering automated moderation flag
    private static final List<String> MODERATION_KEYWORDS = Arrays.asList(
            "spam", "scam", "fake product", "counterfeit", "http://", "https://", "free money", "casino", "abuse"
    );

    /**
     * Submit batch reviews for products in an order.
     * Enforces Delivery-Gated verification (order status must be DELIVERED).
     */
    @PostMapping("/reviews/batch")
    public ResponseEntity<?> submitBatchReviews(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody List<ReviewRequest> reviewRequests) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: User unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> savedReviews = new ArrayList<>();

        for (ReviewRequest req : reviewRequests) {
            Product product = productRepository.findById(req.getProductId())
                    .orElse(null);
            Order order = orderRepository.findById(req.getOrderId())
                    .orElse(null);

            if (product == null || order == null) {
                continue;
            }

            // Verify order belongs to requesting user
            if (!order.getUser().getUserId().equals(user.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Error: Order does not belong to the requesting user."));
            }

            // Delivery-Gated Verification Check (Allow ADMIN role to bypass for testing if needed)
            if (!"DELIVERED".equalsIgnoreCase(order.getStatus()) && user.getRole() != Role.ADMIN) {
                return ResponseEntity.badRequest().body(new MessageResponse(
                        "Error: Reviews can only be submitted after the order has been delivered. Current status: " + order.getStatus()));
            }

            // Automated Content Validation & Moderation Check
            boolean needsModeration = false;
            String comment = req.getComment() != null ? req.getComment() : "";
            for (String keyword : MODERATION_KEYWORDS) {
                if (comment.toLowerCase().contains(keyword)) {
                    needsModeration = true;
                    break;
                }
            }

            String photosStr = (req.getPhotoUrls() != null && !req.getPhotoUrls().isEmpty()) 
                    ? String.join(",", req.getPhotoUrls()) : null;

            Optional<Review> existingOpt = reviewRepository.findByUserUserIdAndProductProductIdAndOrderOrderId(
                    user.getUserId(), product.getProductId(), order.getOrderId());

            Review review;
            if (existingOpt.isPresent()) {
                review = existingOpt.get();
                review.setRating(req.getRating());
                review.setComment(req.getComment());
                review.setPhotoUrls(photosStr);
                review.setIsApproved(!needsModeration);
            } else {
                review = Review.builder()
                        .user(user)
                        .product(product)
                        .order(order)
                        .rating(req.getRating())
                        .comment(req.getComment())
                        .photoUrls(photosStr)
                        .isApproved(!needsModeration)
                        .helpfulCount(0)
                        .reportedCount(0)
                        .build();
            }

            Review saved = reviewRepository.save(review);
            savedReviews.add(mapReviewToResponse(saved));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Reviews submitted successfully.");
        response.put("reviews", savedReviews);

        return ResponseEntity.ok(response);
    }

    /**
     * Update an existing review (editable at any time).
     */
    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<?> updateReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest req) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: User unauthenticated."));
        }

        Review review = reviewRepository.findById(reviewId)
                .orElse(null);

        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Error: Review not found."));
        }

        if (!review.getUser().getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error: You can only edit your own reviews."));
        }

        // Automated Content Validation
        boolean needsModeration = false;
        String comment = req.getComment() != null ? req.getComment() : "";
        for (String keyword : MODERATION_KEYWORDS) {
            if (comment.toLowerCase().contains(keyword)) {
                needsModeration = true;
                break;
            }
        }

        String photosStr = (req.getPhotoUrls() != null && !req.getPhotoUrls().isEmpty()) 
                ? String.join(",", req.getPhotoUrls()) : review.getPhotoUrls();

        review.setRating(req.getRating());
        review.setComment(req.getComment());
        review.setPhotoUrls(photosStr);
        review.setIsApproved(!needsModeration);

        Review updated = reviewRepository.save(review);
        return ResponseEntity.ok(mapReviewToResponse(updated));
    }

    /**
     * Delete an existing review.
     */
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long reviewId) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: User unauthenticated."));
        }

        Review review = reviewRepository.findById(reviewId)
                .orElse(null);

        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Error: Review not found."));
        }

        if (!review.getUser().getUserId().equals(userDetails.getId()) && userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Error: You can only delete your own reviews."));
        }

        reviewRepository.delete(review);
        return ResponseEntity.ok(new MessageResponse("Review deleted successfully."));
    }

    /**
     * Vote a review as Helpful.
     */
    @PostMapping("/reviews/{reviewId}/helpful")
    public ResponseEntity<?> voteHelpful(@PathVariable Long reviewId) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Error: Review not found."));
        }

        review.setHelpfulCount(review.getHelpfulCount() + 1);
        reviewRepository.save(review);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Helpful vote recorded.");
        res.put("helpfulCount", review.getHelpfulCount());
        return ResponseEntity.ok(res);
    }

    /**
     * Report a review for abuse or inappropriate content.
     */
    @PostMapping("/reviews/{reviewId}/report")
    public ResponseEntity<?> reportReview(@PathVariable Long reviewId) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Error: Review not found."));
        }

        review.setReportedCount(review.getReportedCount() + 1);
        if (review.getReportedCount() >= 3) {
            review.setIsApproved(false); // Route to Admin Moderation Queue
        }
        reviewRepository.save(review);

        return ResponseEntity.ok(new MessageResponse("Review reported for moderation. Thank you for keeping our community safe."));
    }

    /**
     * Seller / Admin Official Response to a customer review.
     */
    @PostMapping("/reviews/{reviewId}/reply")
    public ResponseEntity<?> replyToReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> body) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: User unauthenticated."));
        }

        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Error: Review not found."));
        }

        String reply = body.get("sellerReply");
        if (reply == null || reply.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Reply content cannot be empty."));
        }

        review.setSellerReply(reply);
        review.setSellerRepliedAt(LocalDateTime.now());
        Review updated = reviewRepository.save(review);

        return ResponseEntity.ok(mapReviewToResponse(updated));
    }

    /**
     * Get all published/approved reviews for a product.
     */
    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<?> getProductReviews(@PathVariable Integer productId) {
        List<Review> reviews = reviewRepository.findByProductProductIdAndIsApprovedTrueOrderByCreatedAtDesc(productId);
        Double avgRating = reviewRepository.calculateApprovedAverageRating(productId);
        Long totalReviews = reviewRepository.countApprovedByProductId(productId);

        List<Map<String, Object>> mappedList = new ArrayList<>();
        for (Review r : reviews) {
            mappedList.add(mapReviewToResponse(r));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("productId", productId);
        response.put("averageRating", avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        response.put("totalReviews", totalReviews != null ? totalReviews : 0);
        response.put("reviews", mappedList);

        return ResponseEntity.ok(response);
    }

    /**
     * Admin Endpoint: Get pending reviews requiring moderation.
     */
    @GetMapping("/admin/reviews/pending")
    public ResponseEntity<?> getPendingReviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: User unauthenticated."));
        }

        List<Review> pendingReviews = reviewRepository.findByIsApprovedFalseOrderByCreatedAtDesc();
        List<Map<String, Object>> mappedList = new ArrayList<>();
        for (Review r : pendingReviews) {
            mappedList.add(mapReviewToResponse(r));
        }

        return ResponseEntity.ok(mappedList);
    }

    /**
     * Admin Endpoint: Approve a review from Moderation Queue.
     */
    @PutMapping("/admin/reviews/{reviewId}/approve")
    public ResponseEntity<?> approveReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long reviewId) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: User unauthenticated."));
        }

        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse("Error: Review not found."));
        }

        review.setIsApproved(true);
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(mapReviewToResponse(saved));
    }

    /**
     * Get all reviews submitted by current user.
     */
    @GetMapping("/reviews/my")
    public ResponseEntity<?> getMyReviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Error: User unauthenticated."));
        }

        List<Review> reviews = reviewRepository.findByUserUserIdOrderByCreatedAtDesc(userDetails.getId());
        List<Map<String, Object>> mappedList = new ArrayList<>();
        for (Review r : reviews) {
            mappedList.add(mapReviewToResponse(r));
        }

        return ResponseEntity.ok(mappedList);
    }

    private Map<String, Object> mapReviewToResponse(Review r) {
        Map<String, Object> map = new HashMap<>();
        map.put("reviewId", r.getReviewId());
        map.put("userId", r.getUser().getUserId());
        map.put("userName", r.getUser().getUsername());
        map.put("productId", r.getProduct().getProductId());
        map.put("productName", r.getProduct().getName());
        map.put("orderId", r.getOrder().getOrderId());
        map.put("rating", r.getRating());
        map.put("comment", r.getComment());
        map.put("photoUrls", r.getPhotoUrls() != null ? Arrays.asList(r.getPhotoUrls().split(",")) : new ArrayList<>());
        map.put("isApproved", r.getIsApproved());
        map.put("helpfulCount", r.getHelpfulCount());
        map.put("reportedCount", r.getReportedCount());
        map.put("sellerReply", r.getSellerReply());
        map.put("sellerRepliedAt", r.getSellerRepliedAt());
        map.put("createdAt", r.getCreatedAt());
        map.put("updatedAt", r.getUpdatedAt());
        return map;
    }
}
