import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, Heart, ShoppingBag, Shield, Truck, ChevronLeft, ChevronRight, 
  CheckCircle, AlertCircle, ArrowRight, Zap, RefreshCw, Award, MessageSquare, ShieldCheck, Edit3, Trash2, X, Send, ThumbsUp, Flag, Image as ImageIcon 
} from 'lucide-react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import Toast from './Toast';
import { api } from '../services/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const currentUser = api.getUser();

  // Review System State
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const carouselRef = useRef(null);
  const reviewsRef = useRef(null);
  const navigate = useNavigate();

  const fetchReviews = async () => {
    try {
      const res = await api.getProductReviews(id);
      if (res.ok) {
        setReviewsData(res.data);
      }
    } catch {
      console.error("Failed to load product reviews");
    }
  };

  const loadProductDetails = useCallback(async () => {
    setLoading(true);
    const res = await api.getProductById(id);
    if (res.ok && res.data) {
      setProduct(res.data);
      const img = res.data.images && res.data.images.length > 0 ? res.data.images[0].imageUrl : '';
      setSelectedImage(img);

      // Fetch Similar Products Recommendations
      const simRes = await api.getSimilarProducts(id);
      if (simRes.ok && Array.isArray(simRes.data)) {
        setSimilarProducts(simRes.data);
      }
    }
    setLoading(false);
  }, [id]);

  const loadWishlistAndCart = useCallback(async () => {
    if (api.isAuthenticated()) {
      const wishRes = await api.getWishlist();
      if (wishRes.ok && Array.isArray(wishRes.data)) {
        setWishlistIds(new Set(wishRes.data.map(item => item.product.productId)));
      }
      const cartRes = await api.getCartCount();
      if (cartRes.ok && cartRes.data) {
        setCartCount(cartRes.data.cartCount || 0);
      }
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadProductDetails();
    loadWishlistAndCart();
    fetchReviews();
  }, [id, loadProductDetails, loadWishlistAndCart]);

  const handleWishlistToggle = async (prod = product) => {
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'ADD_TO_WISHLIST',
        productId: prod.productId
      }));
      navigate('/login');
      return;
    }

    if (wishlistIds.has(prod.productId)) {
      const res = await api.removeFromWishlist(prod.productId);
      if (res.ok) {
        setWishlistIds(prev => {
          const updated = new Set(prev);
          updated.delete(prod.productId);
          return updated;
        });
        showNotification(`Removed "${prod.name}" from Wishlist`);
      }
    } else {
      const res = await api.addToWishlist(prod.productId);
      if (res.ok) {
        setWishlistIds(prev => new Set(prev).add(prod.productId));
        showNotification(`Added "${prod.name}" to Wishlist!`);
      }
    }
  };

  const handleAddToCart = async (prod = product, qty = quantity) => {
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'ADD_TO_CART',
        productId: prod.productId,
        quantity: qty
      }));
      navigate('/login');
      return;
    }

    const res = await api.addToCart(prod.productId, qty);
    if (res.ok) {
      setCartCount(prev => prev + qty);
      showNotification(`Added ${qty} item(s) of "${prod.name}" to Cart!`);
    } else {
      showNotification('Failed to add to cart', 'error');
    }
  };

  const handleBuyNow = async () => {
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'BUY_NOW',
        productId: product.productId,
        quantity: quantity
      }));
      navigate('/login');
      return;
    }

    const res = await api.addToCart(product.productId, quantity);
    if (res.ok) {
      navigate('/checkout');
    } else {
      showNotification('Could not proceed to checkout.', 'error');
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const scrollToReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="loading-spinner-wrapper">
          <div className="spinner"></div>
          <p>Loading saree details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div className="empty-results-box" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#70161E', marginBottom: '1rem' }}>Product Not Found</h2>
          <p style={{ color: '#888', marginBottom: '1.5rem' }}>The product you are looking for does not exist or may have been removed.</p>
          <button className="btn-gold" style={{ width: 'auto', padding: '0.8rem 2rem' }} onClick={() => navigate('/products')}>
            Browse Full Catalog
          </button>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlistIds.has(product.productId);
  const fallbackImage = 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/casual.jpg?updatedAt=1785166625193';
  const displayImage = selectedImage || (product.images && product.images.length > 0 ? product.images[0].imageUrl : fallbackImage);

  return (
    <div className="page-wrapper">
      <Navbar cartCount={cartCount} wishlistCount={wishlistIds.size} />

      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* Breadcrumb Navigation */}
      <div className="detail-breadcrumb-bar">
        <span onClick={() => navigate('/')}>Home</span> &gt;{' '}
        <span onClick={() => navigate('/products')}>Catalog</span> &gt;{' '}
        {product.category && <><span onClick={() => navigate(`/products?category_id=${product.category.categoryId}`)}>{product.category.categoryName}</span> &gt; </>}
        <span className="breadcrumb-current">{product.name}</span>
      </div>

      <div className="product-detail-container">
        {/* Gallery Section */}
        <div className="detail-gallery-section">
          <div 
            className="main-image-wrapper zoom-container"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img src={displayImage} alt={product.name} className="main-detail-img" />
            {isZoomed && (
              <div 
                className="zoom-lens"
                style={{
                  backgroundImage: `url("${displayImage}")`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                }}
              />
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-row">
              {product.images.map((img, idx) => (
                <img 
                  key={idx} 
                  src={img.imageUrl} 
                  alt={`${product.name} ${idx}`} 
                  className={`thumbnail-img ${displayImage === img.imageUrl ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img.imageUrl)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details Info Section */}
        <div className="detail-info-section">
          <div className="category-tags-row">
            <span className="detail-category-pill">{product.category ? product.category.categoryName : 'Handloom'}</span>
            {product.subcategory && <span className="detail-subcategory-pill">{product.subcategory.subcategoryName}</span>}
          </div>

          <h1 className="detail-title">{product.name}</h1>

          {/* Ratings & Review Jump */}
          <div className="detail-rating-row" onClick={scrollToReviews} style={{ cursor: 'pointer' }}>
            <div className="stars-group">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="#d4af37" color="#d4af37" />)}
            </div>
            <span className="rating-num">
              {reviewsData.totalReviews > 0 
                ? `${reviewsData.averageRating || '4.9'} (${reviewsData.totalReviews} ${reviewsData.totalReviews === 1 ? 'Review' : 'Reviews'})`
                : '4.9 (Artisan Verified)'} • Silk Mark Certified
            </span>
          </div>

          {/* Pricing Box */}
          <div className="detail-price-box">
            <span className="currency-symbol">₹</span>
            <span className="price-value">{Number(product.price).toLocaleString('en-IN')}</span>
            <span className="tax-inclusive-tag">(Inclusive of all taxes)</span>
          </div>

          {/* Stock Status & Urgency */}
          <div className="stock-status-row">
            {product.stock > 5 ? (
              <span className="stock-badge in-stock">
                <CheckCircle size={15} /> In Stock ({product.stock} units available)
              </span>
            ) : product.stock > 0 ? (
              <span className="stock-badge low-stock">
                <Zap size={15} /> Only {product.stock} left in stock - order soon!
              </span>
            ) : (
              <span className="stock-badge out-of-stock">
                <AlertCircle size={15} /> Currently Out of Stock
              </span>
            )}
          </div>

          {/* Product Description */}
          <div className="detail-description-box">
            <h3>Product Overview</h3>
            <p className="detail-description">{product.description}</p>
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="quantity-selector-row">
              <label>Quantity:</label>
              <div className="quantity-btn-group">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >-</button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >+</button>
              </div>
            </div>
          )}

          {/* Action Buttons: Add to Cart, Buy Now, Wishlist */}
          <div className="detail-action-buttons">
            <button 
              className="btn-add-cart-large" 
              onClick={() => handleAddToCart(product, quantity)}
              disabled={product.stock <= 0}
            >
              <ShoppingBag size={20} /> Add to Cart
            </button>

            <button 
              className="btn-buy-now-large" 
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              <Zap size={20} /> <span className="btn-buy-now-text">Buy Now</span>
              {/* Shooting Stars Animation Elements */}
              <svg className="star-1 fil0" viewBox="0 0 784.11 815.53">
                <path d="M392.05 0c-20.9,210.08 -184.06,374.74 -392.05,394.97 207.99,20.23 371.15,184.89 392.05,394.97 20.9,-210.08 184.06,-374.74 392.05,-394.97 -207.99,-20.23 -371.15,-184.89 -392.05,-394.97z" />
              </svg>
              <svg className="star-2 fil0" viewBox="0 0 784.11 815.53">
                <path d="M392.05 0c-20.9,210.08 -184.06,374.74 -392.05,394.97 207.99,20.23 371.15,184.89 392.05,394.97 20.9,-210.08 184.06,-374.74 392.05,-394.97 -207.99,-20.23 -371.15,-184.89 -392.05,-394.97z" />
              </svg>
              <svg className="star-3 fil0" viewBox="0 0 784.11 815.53">
                <path d="M392.05 0c-20.9,210.08 -184.06,374.74 -392.05,394.97 207.99,20.23 371.15,184.89 392.05,394.97 20.9,-210.08 184.06,-374.74 392.05,-394.97 -207.99,-20.23 -371.15,-184.89 -392.05,-394.97z" />
              </svg>
              <svg className="star-4 fil0" viewBox="0 0 784.11 815.53">
                <path d="M392.05 0c-20.9,210.08 -184.06,374.74 -392.05,394.97 207.99,20.23 371.15,184.89 392.05,394.97 20.9,-210.08 184.06,-374.74 392.05,-394.97 -207.99,-20.23 -371.15,-184.89 -392.05,-394.97z" />
              </svg>
              <svg className="star-5 fil0" viewBox="0 0 784.11 815.53">
                <path d="M392.05 0c-20.9,210.08 -184.06,374.74 -392.05,394.97 207.99,20.23 371.15,184.89 392.05,394.97 20.9,-210.08 184.06,-374.74 392.05,-394.97 -207.99,-20.23 -371.15,-184.89 -392.05,-394.97z" />
              </svg>
              <svg className="star-6 fil0" viewBox="0 0 784.11 815.53">
                <path d="M392.05 0c-20.9,210.08 -184.06,374.74 -392.05,394.97 207.99,20.23 371.15,184.89 392.05,394.97 20.9,-210.08 184.06,-374.74 392.05,-394.97 -207.99,-20.23 -371.15,-184.89 -392.05,-394.97z" />
              </svg>
            </button>

            <button 
              className={`btn-wishlist-toggle ${isWishlisted ? 'active' : ''}`}
              onClick={() => handleWishlistToggle(product)}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart size={20} fill={isWishlisted ? "#7B1E3A" : "none"} color={isWishlisted ? "#7B1E3A" : "#6F6F6F"} />
            </button>
          </div>

          {/* Delivery & Trust Highlights */}
          <div className="delivery-trust-box">
            <div className="delivery-est-item">
              <Truck size={22} className="delivery-icon" />
              <div>
                <strong>Standard Express Delivery</strong>
                <p>Delivered in 5–7 business days. Free shipping on orders above ₹2,999.</p>
              </div>
            </div>
            <div className="delivery-est-item">
              <Shield size={22} className="delivery-icon" />
              <div>
                <strong>100% Authentic Handloom</strong>
                <p>Silk Mark Certified • Direct from Artisan Weavers</p>
              </div>
            </div>
            <div className="delivery-est-item">
              <RefreshCw size={22} className="delivery-icon" />
              <div>
                <strong>7-Day Easy Returns</strong>
                <p>Hassle-free exchange policy for pristine quality assurance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="product-reviews-section" ref={reviewsRef}>
        <div className="section-header">
          <h2 className="section-title"><MessageSquare size={22} /> Customer Ratings & Reviews</h2>
          <p className="section-subtitle">Real experiences shared by saree lovers across India</p>
        </div>

        <div className="reviews-summary-grid">
          <div className="overall-rating-card">
            <span className="big-rating">{reviewsData.totalReviews > 0 ? (reviewsData.averageRating || '0.0') : '4.9'}</span>
            <div className="stars-group">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  size={18} 
                  fill={s <= Math.round(reviewsData.totalReviews > 0 ? (reviewsData.averageRating || 0) : 5) ? "#d4af37" : "none"} 
                  color="#d4af37" 
                />
              ))}
            </div>
            <p>{reviewsData.totalReviews > 0 ? `Based on ${reviewsData.totalReviews} reviews` : 'Artisan Handloom Rating'}</p>
          </div>

          <div className="rating-bars-card">
            {[5, 4, 3, 2, 1].map((starVal) => {
              const defaultDistribution = { 5: 88, 4: 12, 3: 0, 2: 0, 1: 0 };
              const count = (reviewsData.reviews || []).filter(r => r.rating === starVal).length;
              const pct = reviewsData.totalReviews > 0 
                ? Math.round((count / reviewsData.totalReviews) * 100) 
                : defaultDistribution[starVal];
              return (
                <div key={starVal} className="rating-bar-row">
                  <span>{starVal} ★</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="bar-pct">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="review-list">
          {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
            reviewsData.reviews.map((rev) => {
              const isOwner = currentUser && (currentUser.id === rev.userId || currentUser.userId === rev.userId);
              const isSellerOrAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SELLER');
              return (
                <div key={rev.reviewId} className="review-item-card" style={{ position: 'relative', background: '#FFF', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', border: '1px solid var(--border-color)' }}>
                  <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <div className="reviewer-info" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{rev.userName}</strong>
                      <span className="verified-badge" style={{ background: '#E8F5E9', color: '#2E7D32', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Award size={13} /> Verified Purchase
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span className="review-date" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {isOwner && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => {
                              setEditingReview(rev);
                              setEditRating(rev.rating);
                              setEditComment(rev.comment || '');
                            }}
                            title="Edit Review"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete your review?")) {
                                const delRes = await api.deleteReview(rev.reviewId);
                                if (delRes.ok) {
                                  fetchReviews();
                                  setNotification({ msg: 'Review deleted successfully', type: 'success' });
                                }
                              }
                            }}
                            title="Delete Review"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="stars-group" style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.8rem' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={15} fill={s <= rev.rating ? "#d4af37" : "none"} color="#d4af37" />
                    ))}
                  </div>

                  {rev.comment && <p className="review-text" style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '0.8rem' }}>"{rev.comment}"</p>}

                  {/* Customer Photo Gallery */}
                  {rev.photoUrls && rev.photoUrls.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      {rev.photoUrls.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer">
                          <img
                            src={url}
                            alt={`Customer Review Photo ${idx + 1}`}
                            style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E0E0E0', transition: 'transform 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Official Seller Reply */}
                  {rev.sellerReply && (
                    <div style={{ background: '#FAF8F5', borderLeft: '4px solid var(--color-primary)', padding: '0.8rem 1rem', borderRadius: '6px', margin: '0.8rem 0' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                        Official Seller Response
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#444', margin: 0 }}>{rev.sellerReply}</p>
                    </div>
                  )}

                  {/* Helpful Vote & Report Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid #F0F0F0', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={async () => {
                          const res = await api.voteHelpfulReview(rev.reviewId);
                          if (res.ok) {
                            fetchReviews();
                            setNotification({ msg: 'Thank you for your feedback!', type: 'success' });
                          }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666', fontWeight: '500' }}
                      >
                        <ThumbsUp size={14} /> Helpful ({rev.helpfulCount || 0})
                      </button>

                      <button
                        onClick={async () => {
                          if (window.confirm("Report this review for moderation?")) {
                            const res = await api.reportReview(rev.reviewId);
                            if (res.ok) {
                              setNotification({ msg: 'Review reported for moderation.', type: 'info' });
                            }
                          }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#888' }}
                      >
                        <Flag size={13} /> Report
                      </button>
                    </div>

                    {isSellerOrAdmin && !rev.sellerReply && (
                      <button
                        onClick={async () => {
                          const replyText = window.prompt("Enter official seller reply for this customer review:");
                          if (replyText && replyText.trim()) {
                            const res = await api.replyToReview(rev.reviewId, replyText);
                            if (res.ok) {
                              fetchReviews();
                              setNotification({ msg: 'Seller reply posted successfully!', type: 'success' });
                            }
                          }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: '600', fontSize: '0.82rem' }}
                      >
                        + Add Seller Reply
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textTransform: 'none', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 1rem' }}>
              No published reviews yet. Be the first to receive and review this exquisite handloom saree!
            </div>
          )}
        </div>
      </section>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px', padding: '2rem' }}>
            <button className="modal-close-btn" onClick={() => setEditingReview(null)}>
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '1rem' }}>
              Edit Your Review
            </h3>
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Rating:</label>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setEditRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Star
                      size={24}
                      fill={star <= editRating ? '#D4AF37' : 'none'}
                      color={star <= editRating ? '#D4AF37' : '#CCC'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Comment:</label>
              <textarea
                className="form-input"
                rows="3"
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                maxLength={500}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setEditingReview(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-gold"
                disabled={submittingEdit}
                onClick={async () => {
                  setSubmittingEdit(true);
                  const res = await api.updateReview(editingReview.reviewId, editRating, editComment);
                  setSubmittingEdit(false);
                  if (res.ok) {
                    setEditingReview(null);
                    fetchReviews();
                    setNotification({ msg: 'Review updated successfully!', type: 'success' });
                  }
                }}
              >
                {submittingEdit ? <span className="spinner"></span> : 'Update Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Similar Products Carousel Section */}
      {similarProducts.length > 0 && (
        <section className="similar-products-section">
          <div className="section-header">
            <h2 className="section-title">You Might Also Like</h2>
            <p className="section-subtitle">Similar handwoven sarees from our authentic collection</p>
          </div>

          <div className="carousel-wrapper">
            <button className="carousel-arrow arrow-left" onClick={() => scrollCarousel('left')}>
              <ChevronLeft size={22} />
            </button>

            <div className="horizontal-scroll-container" ref={carouselRef}>
              {similarProducts.map(simProd => (
                <div key={simProd.productId} className="carousel-card-item">
                  <ProductCard 
                    product={simProd}
                    isWishlisted={wishlistIds.has(simProd.productId)}
                    onWishlistToggle={handleWishlistToggle}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              ))}
            </div>

            <button className="carousel-arrow arrow-right" onClick={() => scrollCarousel('right')}>
              <ChevronRight size={22} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

