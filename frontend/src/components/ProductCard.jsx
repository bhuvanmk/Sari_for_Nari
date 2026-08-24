import React from 'react';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function ProductCard({ product, isWishlisted = false, onWishlistToggle, onAddToCart, onBuyNow }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.productId}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'ADD_TO_WISHLIST',
        productId: product.productId
      }));
      navigate('/login');
      return;
    }
    if (onWishlistToggle) onWishlistToggle(product);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'ADD_TO_CART',
        productId: product.productId,
        quantity: 1
      }));
      navigate('/login');
      return;
    }
    if (onAddToCart) onAddToCart(product);
  };

  const handleBuyNowClick = (e) => {
    e.stopPropagation();
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'BUY_NOW',
        productId: product.productId,
        quantity: 1
      }));
      navigate('/login');
      return;
    }
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      // Default Buy Now behavior: add to cart & jump straight to checkout
      api.addToCart(product.productId, 1).then(res => {
        if (res.ok) {
          navigate('/checkout');
        }
      });
    }
  };

  const mainImageUrl = product.images && product.images.length > 0 
    ? product.images[0].imageUrl 
    : 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/casual.jpg?updatedAt=1785166625193';

  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="product-img-wrapper" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <img 
          src={mainImageUrl} 
          alt={product.name} 
          className="product-img" 
          loading="lazy"
          onClick={handleCardClick}
          style={{
            cursor: 'pointer',
            ...( (product.focalPosition || (product.images && product.images[0]?.focalPosition)) 
              ? { objectPosition: product.focalPosition || product.images[0].focalPosition } 
              : {} )
          }}
        />
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label="Wishlist"
        >
          <Heart size={19} fill={isWishlisted ? "#FFFFFF" : "none"} color={isWishlisted ? "#FFFFFF" : "#7B1E3A"} />
        </button>
        {product.stock <= 0 && <span className="stock-badge out-of-stock">Out of Stock</span>}
        {product.category && (
          <span className="product-tag">{product.category.categoryName}</span>
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="star-filled" />
          ))}
          <span className="rating-num">(4.9)</span>
        </div>

        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <div className="price-box">
            <span className="currency-symbol">₹</span>
            <span className="price-value">{Number(product.price).toLocaleString('en-IN')}</span>
          </div>

          <div className="card-btn-group">
            <button 
              className="btn-add-cart" 
              onClick={handleAddToCartClick}
              disabled={product.stock <= 0}
            >
              <ShoppingBag size={15} /> Add
            </button>
            <button 
              className="btn-buy-now" 
              onClick={handleBuyNowClick}
              disabled={product.stock <= 0}
            >
              <span className="btn-buy-now-text">Buy Now</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
