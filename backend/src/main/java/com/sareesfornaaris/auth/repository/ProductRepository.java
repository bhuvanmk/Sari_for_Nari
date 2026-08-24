package com.sareesfornaaris.auth.repository;

import com.sareesfornaaris.auth.entity.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

    List<Product> findAllByOrderByCreatedAtDesc();

    List<Product> findByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(p.isActive = true) AND " +
           "(:categoryId IS NULL OR p.category.categoryId = :categoryId) AND " +
           "(:subcategoryId IS NULL OR p.subcategory.subcategoryId = :subcategoryId) AND " +
           "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) OR (p.category IS NOT NULL AND LOWER(p.category.categoryName) LIKE LOWER(CONCAT('%', :search, '%'))) OR (p.subcategory IS NOT NULL AND LOWER(p.subcategory.subcategoryName) LIKE LOWER(CONCAT('%', :search, '%')))) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:inStock IS NULL OR (:inStock = true AND p.stock > 0) OR (:inStock = false AND p.stock = 0))")
    List<Product> filterProducts(
            @Param("categoryId") Integer categoryId,
            @Param("subcategoryId") Integer subcategoryId,
            @Param("search") String search,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("inStock") Boolean inStock
    );

    // Similar Products query logic
    @Query("SELECT p FROM Product p WHERE p.productId <> :currentId AND p.subcategory.subcategoryId = :subcategoryId ORDER BY p.stock DESC")
    List<Product> findBySubcategoryExcludingCurrent(@Param("currentId") Integer currentId, @Param("subcategoryId") Integer subcategoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.productId <> :currentId AND p.category.categoryId = :categoryId ORDER BY p.stock DESC")
    List<Product> findByCategoryExcludingCurrent(@Param("currentId") Integer currentId, @Param("categoryId") Integer categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.productId <> :currentId AND p.category.categoryId = :categoryId AND p.price BETWEEN :minPrice AND :maxPrice ORDER BY p.stock DESC")
    List<Product> findByPriceRangeExcludingCurrent(@Param("currentId") Integer currentId, @Param("categoryId") Integer categoryId, @Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice, Pageable pageable);
}
