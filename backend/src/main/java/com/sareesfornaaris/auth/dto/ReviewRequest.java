package com.sareesfornaaris.auth.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {

    private Long reviewId; // Optional for edit

    @NotNull(message = "Product ID is required")
    private Integer productId;

    @NotNull(message = "Order ID is required")
    private String orderId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer rating;

    private String comment;

    private List<String> photoUrls; // List of customer photo URLs
}
