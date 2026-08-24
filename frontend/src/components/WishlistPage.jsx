import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';
import { api } from '../services/api';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    const res = await api.getWishlist();
    if (res.ok && Array.isArray(res.data)) {
      setWishlistItems(res.data);
    }
    const cartRes = await api.getCartCount();
    if (cartRes.ok && cartRes.data) {
      setCartCount(cartRes.data.cartCount || 0);
    }
    setLoading(false);
  };

  const handleRemove = async (productId) => {
    const res = await api.removeFromWishlist(productId);
    if (res.ok) {
      setWishlistItems(prev => prev.filter(item => item.product.productId !== productId));
      showNotification('Item removed from wishlist');
    }
  };

  const handleMoveToCart = async (product) => {
    const addRes = await api.addToCart(product.productId, 1);
    if (addRes.ok) {
      setCartCount(prev => prev + 1);
      await api.removeFromWishlist(product.productId);
      setWishlistItems(prev => prev.filter(item => item.product.productId !== product.productId));
      showNotification(`Moved "${product.name}" to cart!`);
    } else {
      showNotification('Could not add item to cart', 'error');
    }
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="page-wrapper page-fade-in">
      <Navbar cartCount={cartCount} wishlistCount={wishlistItems.length} />

      {notification && (
        <div className={`toast-notification ${notification.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      <div className="cart-page-container">
        <h1 className="page-title">My Wishlist ({wishlistItems.length})</h1>

        {loading ? (
          <div className="loading-spinner-wrapper">
            <div className="spinner"></div>
            <p>Loading your saved sarees...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="empty-results-box">
            <Heart size={48} color="#70161E" />
            <h3>Your wishlist is currently empty</h3>
            <p>Explore our handcrafted collections and save your favorite sarees here.</p>
            <button className="btn-gold" onClick={() => navigate('/products')}>Explore Sarees</button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map(item => {
              const product = item.product;
              const imageUrl = product.images && product.images.length > 0 
                ? product.images[0].imageUrl 
                : 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/casual.jpg?updatedAt=1785166625193';

              return (
                <div key={item.id} className="wishlist-item-card">
                  <img src={imageUrl} alt={product.name} className="wishlist-item-img" />
                  <div className="wishlist-item-info">
                    <h3 className="wishlist-item-title">{product.name}</h3>
                    <p className="wishlist-item-price">₹{Number(product.price).toLocaleString('en-IN')}</p>
                    
                    <div className="wishlist-btn-actions">
                      <button className="btn-add-cart" onClick={() => handleMoveToCart(product)}>
                        <ShoppingBag size={16} /> Move to Cart
                      </button>
                      <button className="btn-remove-wishlist" onClick={() => handleRemove(product.productId)}>
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
