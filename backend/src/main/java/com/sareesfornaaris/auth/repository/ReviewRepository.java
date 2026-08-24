package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductProductIdAndIsApprovedTrueOrderByCreatedAtDesc(Integer productId);

    List<Review> findByIsApprovedFalseOrderByCreatedAtDesc();

    List<Review> findByUserUserIdOrderByCreatedAtDesc(Integer userId);

    List<Review> findByOrderOrderId(String orderId);

    Optional<Review> findByUserUserIdAndProductProductId(Integer userId, Integer productId);

    Optional<Review> findByUserUserIdAndProductProductIdAndOrderOrderId(Integer userId, Integer productId, String orderId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId AND r.isApproved = true")
    Double calculateApprovedAverageRating(@Param("productId") Integer productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.productId = :productId AND r.isApproved = true")
    Long countApprovedByProductId(@Param("productId") Integer productId);
}
