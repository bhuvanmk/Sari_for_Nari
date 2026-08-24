package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.CartItem;
import com.sareesfornaaris.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct_ProductId(User user, Integer productId);

    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM CartItem c WHERE c.user.userId = :userId")
    Integer countTotalItemsByUserId(@Param("userId") Integer userId);
}
