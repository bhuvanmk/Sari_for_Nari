package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.entity.Category;
import com.sareesfornaaris.auth.entity.Product;
import com.sareesfornaaris.auth.entity.SubCategory;
import com.sareesfornaaris.auth.repository.CategoryRepository;
import com.sareesfornaaris.auth.repository.ProductRepository;
import com.sareesfornaaris.auth.repository.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CatalogController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubCategoryRepository subCategoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/subcategories")
    public ResponseEntity<List<SubCategory>> getSubCategories(@RequestParam(required = false) Integer category_id) {
        if (category_id != null) {
            return ResponseEntity.ok(subCategoryRepository.findByCategory_CategoryId(category_id));
        }
        return ResponseEntity.ok(subCategoryRepository.findAll());
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(required = false) Integer category_id,
            @RequestParam(required = false) Integer subcategory_id,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal min_price,
            @RequestParam(required = false) BigDecimal max_price,
            @RequestParam(required = false) String in_stock,
            @RequestParam(required = false) String sort_by) {
        
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        // Gracefully parse in_stock: only "true"/"false" are valid, everything else is treated as null (no filter)
        Boolean inStockBool = null;
        if ("true".equalsIgnoreCase(in_stock)) {
            inStockBool = true;
        } else if ("false".equalsIgnoreCase(in_stock)) {
            inStockBool = false;
        }
        
        List<Product> products = productRepository.filterProducts(category_id, subcategory_id, trimmedSearch, min_price, max_price, inStockBool);

        if (sort_by != null && !sort_by.trim().isEmpty()) {
            switch (sort_by.toLowerCase()) {
                case "price_asc":
                case "price_low_high":
                    products.sort(Comparator.comparing(Product::getPrice));
                    break;
                case "price_desc":
                case "price_high_low":
                    products.sort(Comparator.comparing(Product::getPrice).reversed());
                    break;
                case "newest":
                    products.sort(Comparator.comparing(Product::getProductId).reversed());
                    break;
                default:
                    break;
            }
        }

        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam(required = false, name = "q") String query,
                                                        @RequestParam(required = false, name = "search") String search) {
        String searchTerm = query != null ? query : search;
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return ResponseEntity.ok(productRepository.findAll());
        }
        return ResponseEntity.ok(productRepository.filterProducts(null, null, searchTerm.trim(), null, null, null));
    }

    @GetMapping("/products/trending")
    public ResponseEntity<List<Product>> getTrendingProducts() {
        List<Product> products = productRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, 8));
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/new-arrivals")
    public ResponseEntity<List<Product>> getNewArrivals() {
        List<Product> products = productRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, 6));
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/best-sellers")
    public ResponseEntity<List<Product>> getBestSellers() {
        List<Product> products = productRepository.findByOrderByCreatedAtDesc(PageRequest.of(0, 6));
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Integer id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/products/{id}/similar")
    public ResponseEntity<List<Product>> getSimilarProducts(@PathVariable Integer id, @RequestParam(defaultValue = "10") int limit) {
        Optional<Product> targetOpt = productRepository.findById(id);
        if (targetOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Product target = targetOpt.get();
        Set<Product> result = new LinkedHashSet<>();

        // Priority 1: Same subcategory
        if (target.getSubcategory() != null) {
            List<Product> subcatList = productRepository.findBySubcategoryExcludingCurrent(id, target.getSubcategory().getSubcategoryId(), PageRequest.of(0, limit));
            result.addAll(subcatList);
        }

        // Priority 2: Same category if needed
        if (result.size() < limit && target.getCategory() != null) {
            List<Product> catList = productRepository.findByCategoryExcludingCurrent(id, target.getCategory().getCategoryId(), PageRequest.of(0, limit));
            result.addAll(catList);
        }

        // Priority 3: Similar price range (+/- 30%) within category
        if (result.size() < limit && target.getCategory() != null) {
            BigDecimal minP = target.getPrice().multiply(new BigDecimal("0.70"));
            BigDecimal maxP = target.getPrice().multiply(new BigDecimal("1.30"));
            List<Product> priceList = productRepository.findByPriceRangeExcludingCurrent(id, target.getCategory().getCategoryId(), minP, maxP, PageRequest.of(0, limit));
            result.addAll(priceList);
        }

        List<Product> finalRecommendations = result.stream().limit(limit).collect(Collectors.toList());
        return ResponseEntity.ok(finalRecommendations);
    }
}
