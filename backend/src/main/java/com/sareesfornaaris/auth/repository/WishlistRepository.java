package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    List<Wishlist> findByUser(User user);
    Optional<Wishlist> findByUserAndProduct_ProductId(User user, Integer productId);
    void deleteByUserAndProduct_ProductId(User user, Integer productId);
    boolean existsByUserAndProduct_ProductId(User user, Integer productId);
}
