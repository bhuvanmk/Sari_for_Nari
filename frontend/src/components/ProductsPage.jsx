import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import Toast from './Toast';
import NaarisBrandLoader from './NaarisBrandLoader';
import { api } from '../services/api';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const containerRef = useScrollReveal();
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || searchParams.get('cat') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || searchParams.get('sub') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || searchParams.get('q') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [inStock, setInStock] = useState(searchParams.get('in_stock') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'newest');

  const navigate = useNavigate();

  useEffect(() => {
    loadWishlistAndCart();
  }, []);

  // Synchronize state and trigger re-fetch on any URL searchParams change
  useEffect(() => {
    const cat = searchParams.get('category') || searchParams.get('cat') || '';
    const sub = searchParams.get('subcategory') || searchParams.get('sub') || '';
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const minP = searchParams.get('min_price') || '';
    const maxP = searchParams.get('max_price') || '';
    const inSt = searchParams.get('in_stock') === 'true';
    const sort = searchParams.get('sort_by') || 'newest';

    setSelectedCategory(cat);
    setSelectedSubcategory(sub);
    setSearchQuery(search);
    setMinPrice(minP);
    setMaxPrice(maxP);
    setInStock(inSt);
    setSortBy(sort);

    if (cat) {
      loadSubcategoriesForCategory(cat);
    } else {
      setSubcategories([]);
    }

    fetchFilteredProducts(cat, sub, search, minP, maxP, inSt, sort);
  }, [searchParams]);

  const loadSubcategoriesForCategory = async (catName) => {
    const resCat = await api.getCategories();
    if (resCat.ok) {
      const match = resCat.data.find(c => c.categoryName.toLowerCase() === catName.toLowerCase());
      if (match) {
        const subRes = await api.getSubCategories(match.categoryId);
        if (subRes.ok) setSubcategories(subRes.data);
      }
    }
  };

  const loadWishlistAndCart = async () => {
    if (api.isAuthenticated()) {
      const wishRes = await api.getWishlist();
      if (wishRes.ok && Array.isArray(wishRes.data)) {
        const ids = new Set(wishRes.data.map(item => item.product.productId));
        setWishlistIds(ids);
      }
      const cartRes = await api.getCartCount();
      if (cartRes.ok && cartRes.data) {
        setCartCount(cartRes.data.cartCount || 0);
      }
    }
  };

  const fetchFilteredProducts = async (catName, subName, search, minP, maxP, inSt, sort) => {
    setLoading(true);
    let catId = null;
    let subId = null;

    if (catName) {
      const resCat = await api.getCategories();
      if (resCat.ok) {
        const match = resCat.data.find(c => c.categoryName.toLowerCase() === catName.toLowerCase());
        if (match) catId = match.categoryId;
      }
    }

    if (subName) {
      const subRes = await api.getSubCategories(catId);
      if (subRes.ok) {
        const matchSub = subRes.data.find(s => 
          s.subcategoryName.toLowerCase() === subName.toLowerCase() ||
          subName.toLowerCase().includes(s.subcategoryName.toLowerCase()) ||
          s.subcategoryName.toLowerCase().includes(subName.toLowerCase())
        );
        if (matchSub) subId = matchSub.subcategoryId;
      }
    }

    const params = {
      category_id: catId,
      subcategory_id: subId,
      search: search || null,
      min_price: minP || null,
      max_price: maxP || null,
      in_stock: inSt ? true : null,
      sort_by: sort
    };

    const res = await api.getProducts(params);
    if (res.ok) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  const updateURLParams = (updatedFields) => {
    const p = new URLSearchParams(searchParams);
    
    const cat = updatedFields.category !== undefined ? updatedFields.category : selectedCategory;
    const sub = updatedFields.subcategory !== undefined ? updatedFields.subcategory : selectedSubcategory;
    const search = updatedFields.search !== undefined ? updatedFields.search : searchQuery;
    const minP = updatedFields.minPrice !== undefined ? updatedFields.minPrice : minPrice;
    const maxP = updatedFields.maxPrice !== undefined ? updatedFields.maxPrice : maxPrice;
    const inSt = updatedFields.inStock !== undefined ? updatedFields.inStock : inStock;
    const sort = updatedFields.sortBy !== undefined ? updatedFields.sortBy : sortBy;

    if (cat) p.set('category', cat); else p.delete('category');
    if (sub) p.set('subcategory', sub); else p.delete('subcategory');
    if (search) p.set('search', search); else { p.delete('search'); p.delete('q'); }
    if (minP) p.set('min_price', minP); else p.delete('min_price');
    if (maxP) p.set('max_price', maxP); else p.delete('max_price');
    if (inSt) p.set('in_stock', 'true'); else p.delete('in_stock');
    if (sort) p.set('sort_by', sort); else p.delete('sort_by');

    setSearchParams(p);
  };

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedCategory(val);
    setSelectedSubcategory('');
    updateURLParams({ category: val, subcategory: '' });
  };

  const handleSubcategoryChange = (e) => {
    const val = e.target.value;
    setSelectedSubcategory(val);
    updateURLParams({ subcategory: val });
  };

  const handleMinPriceChange = (e) => {
    const val = e.target.value;
    setMinPrice(val);
    updateURLParams({ minPrice: val });
  };

  const handleMaxPriceChange = (e) => {
    const val = e.target.value;
    setMaxPrice(val);
    updateURLParams({ maxPrice: val });
  };

  const handleStockChange = (e) => {
    const val = e.target.checked;
    setInStock(val);
    updateURLParams({ inStock: val });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    setSortBy(val);
    updateURLParams({ sortBy: val });
  };

  const handleResetFilter = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  const handleWishlistToggle = async (product) => {
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'ADD_TO_WISHLIST',
        productId: product.productId
      }));
      navigate('/login');
      return;
    }

    if (wishlistIds.has(product.productId)) {
      const res = await api.removeFromWishlist(product.productId);
      if (res.ok) {
        setWishlistIds(prev => {
          const updated = new Set(prev);
          updated.delete(product.productId);
          return updated;
        });
        showNotification(`Removed "${product.name}" from Wishlist`);
      }
    } else {
      const res = await api.addToWishlist(product.productId);
      if (res.ok) {
        setWishlistIds(prev => new Set(prev).add(product.productId));
        showNotification(`Added "${product.name}" to Wishlist!`);
      }
    }
  };

  const handleAddToCart = async (product) => {
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'ADD_TO_CART',
        productId: product.productId,
        quantity: 1
      }));
      navigate('/login');
      return;
    }

    const res = await api.addToCart(product.productId, 1);
    if (res.ok) {
      setCartCount(prev => prev + 1);
      showNotification(`Added "${product.name}" to Cart!`);
    } else {
      showNotification('Could not add to cart', 'error');
    }
  };

  const handleBuyNow = async (product) => {
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'BUY_NOW',
        productId: product.productId,
        quantity: 1
      }));
      navigate('/login');
      return;
    }

    const res = await api.addToCart(product.productId, 1);
    if (res.ok) {
      navigate('/checkout');
    } else {
      showNotification('Could not proceed to checkout.', 'error');
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="page-wrapper page-fade-in" ref={containerRef}>
      <Navbar cartCount={cartCount} wishlistCount={wishlistIds.size} />

      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification(null)} />

      <div className="products-layout-container">
        {/* Filter Sidebar */}
        <aside className="filter-sidebar">
          <div className="filter-sidebar-header">
            <div className="filter-title-box">
              <Filter size={18} />
              <h3>Filters</h3>
            </div>
            <button className="btn-reset-filter" onClick={handleResetFilter}>Reset All</button>
          </div>

          <div className="filter-group">
            <label className="filter-label">Main Category</label>
            <select className="filter-input" value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">All Categories</option>
              <option value="Casual">Casual</option>
              <option value="Traditional">Traditional</option>
              <option value="Party">Party</option>
              <option value="Wedding">Wedding</option>
            </select>
          </div>

          {subcategories.length > 0 && (
            <div className="filter-group">
              <label className="filter-label">Subcategory</label>
              <select className="filter-input" value={selectedSubcategory} onChange={handleSubcategoryChange}>
                <option value="">All Subcategories</option>
                {subcategories.map(sub => (
                  <option key={sub.subcategoryId} value={sub.subcategoryName}>{sub.subcategoryName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group">
            <label className="filter-label">Price Range (₹)</label>
            <div className="price-inputs-row">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice} 
                onChange={handleMinPriceChange}
                className="filter-input price-input"
              />
              <span>to</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice} 
                onChange={handleMaxPriceChange}
                className="filter-input price-input"
              />
            </div>
          </div>

          <div className="filter-group checkbox-group">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={inStock} 
                onChange={handleStockChange} 
              />
              In Stock Only
            </label>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select className="filter-input" value={sortBy} onChange={handleSortChange}>
              <option value="newest">Newest Arrivals</option>
              <option value="price_low_high">Price: Low to High</option>
              <option value="price_high_low">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="products-grid-area">
          <div className="catalog-header-bar">
            <h2>
              {searchQuery 
                ? `Search Results for "${searchQuery}"`
                : selectedCategory 
                ? `${selectedCategory} Sarees` 
                : 'All Exclusive Sarees'}
            </h2>
            <span className="product-count-text">({products.length} Products Found)</span>
          </div>

          {loading ? (
            <NaarisBrandLoader text="Filtering Handloomed Masterpieces..." />
          ) : products.length === 0 ? (
            <div className="empty-results-box">
              <h3>No sarees match your selected criteria</h3>
              <p>Try resetting filters or broadening your search parameters.</p>
              <button className="btn-gold" onClick={handleResetFilter}>Reset Filters</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard 
                  key={product.productId} 
                  product={product} 
                  isWishlisted={wishlistIds.has(product.productId)}
                  onWishlistToggle={handleWishlistToggle}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
