import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';
import Toast from './Toast';
import { api } from '../services/api';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const containerRef = useScrollReveal();
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    const res = await api.getCartItems();
    if (res.ok && Array.isArray(res.data)) {
      setCartItems(res.data);
      const totalQty = res.data.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalQty);
    }
    setLoading(false);
  };

  const handleUpdateQuantity = async (cartItemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(cartItemId);
      return;
    }
    const res = await api.updateCartItem(cartItemId, newQty);
    if (res.ok) {
      loadCart();
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    const res = await api.removeCartItem(cartItemId);
    if (res.ok) {
      setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
      loadCart();
      showNotification('Item removed from cart');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (Number(item.product.price) * item.quantity);
  }, 0);

  const shippingFee = subtotal > 2999 || subtotal === 0 ? 0 : 250;
  const orderTotal = subtotal + shippingFee;

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="page-wrapper page-fade-in" ref={containerRef}>
      <Navbar cartCount={cartCount} />

      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification(null)} />

      <div className="cart-page-container">
        <h1 className="page-title">Shopping Cart ({cartCount} Items)</h1>

        {loading ? (
          <div className="loading-spinner-wrapper">
            <div className="spinner"></div>
            <p>Loading your shopping bag...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="empty-results-box">
            <ShoppingBag size={56} color="#D4AF37" />
            <h3>Your shopping cart is empty</h3>
            <p>Add exquisite handloomed sarees to your bag and enjoy complimentary shipping.</p>
            <button className="btn-gold" onClick={() => navigate('/home')}>Shop Collection</button>
          </div>
        ) : (
          <div className="cart-content-grid">
            {/* Cart Line Items */}
            <div className="cart-items-column">
              {cartItems.map(item => {
                const product = item.product;
                const imageUrl = product.images && product.images.length > 0 
                  ? product.images[0].imageUrl 
                  : 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/casual.jpg?updatedAt=1785166625193';
                const lineTotal = Number(product.price) * item.quantity;

                return (
                  <div key={item.cartItemId} className="cart-item-row reveal-fade-up">
                    <img src={imageUrl} alt={product.name} className="cart-item-img" />
                    
                    <div className="cart-item-details">
                      <h3 className="cart-item-title">{product.name}</h3>
                      <p className="cart-item-unit-price">Price: ₹{Number(product.price).toLocaleString('en-IN')}</p>
                      
                      <div className="quantity-btn-group">
                        <button 
                          className="qty-btn" 
                          disabled={item.quantity <= 1}
                          onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button 
                          className="qty-btn" 
                          disabled={item.quantity >= product.stock}
                          onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-actions-price">
                      <span className="line-total-price">₹{lineTotal.toLocaleString('en-IN')}</span>
                      <button className="btn-remove-link" onClick={() => handleRemoveItem(item.cartItemId)}>
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="order-summary-sidebar">
              <h3 className="summary-title">Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="summary-row">
                <span>Estimated Express Shipping</span>
                <span>{shippingFee === 0 ? <strong style={{ color: '#2e7d32' }}>FREE</strong> : `₹${shippingFee}`}</span>
              </div>

              <hr className="summary-divider" />

              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>

              <button className="btn-gold checkout-primary-btn" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="trust-badge-box">
                <Shield size={20} color="#D4AF37" />
                <span>100% Secure & Encrypted Razorpay Checkout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
