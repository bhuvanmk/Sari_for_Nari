import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { safeGetStorage, safeRemoveStorage } from '../utils/authUtils';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const intendedDestination = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (api.isAuthenticated()) {
      const user = api.getUser();
      if (user?.role === 'SELLER') navigate('/seller/dashboard');
      else if (user?.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate(intendedDestination);
    }
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setError('Your session has expired. Please login again.');
    }
    if (params.get('verified')) {
      setSuccess('Account verified successfully! You can now login.');
    }
  }, [navigate, location, intendedDestination]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.login(username, password);
      if (res.ok) {
        const role = res.data.role;
        
        // Execute pending guest action if exists
        const actionObj = safeGetStorage('pendingGuestAction');
        let shouldGoToCheckout = false;

        if (actionObj) {
          try {
            if (actionObj.type === 'ADD_TO_CART' && actionObj.productId) {
              await api.addToCart(actionObj.productId, actionObj.quantity || 1);
            } else if (actionObj.type === 'BUY_NOW' && actionObj.productId) {
              await api.addToCart(actionObj.productId, actionObj.quantity || 1);
              shouldGoToCheckout = true;
            } else if (actionObj.type === 'ADD_TO_WISHLIST' && actionObj.productId) {
              await api.addToWishlist(actionObj.productId);
            }
          } catch (err) {
            console.error('Error auto-completing guest action', err);
          } finally {
            safeRemoveStorage('pendingGuestAction');
          }
        }

        if (role === 'SELLER') navigate('/seller/dashboard');
        else if (role === 'ADMIN') navigate('/admin/dashboard');
        else if (shouldGoToCheckout) navigate('/checkout');
        else navigate(intendedDestination);
      } else {
        setError(res.data.message || 'Invalid credentials');
        if (res.status === 403) {
          const email = res.data.email || (username.includes('@') ? username : '');
          localStorage.setItem('verificationEmail', email);
          setTimeout(() => {
            navigate(`/verify-otp?email=${encodeURIComponent(email)}&purpose=REGISTRATION`);
          }, 2000);
        }
      }
    } catch {
      setError('Could not connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-wrapper">
      <div className="auth-container">
        <div className="glass-card">
          <div className="brand-header">
            <img src="/brand_logo.png" alt="Sarees For Naaris Logo" className="brand-logo" />
            <h1 className="brand-title">Sarees For Naaris</h1>
            <p className="brand-subtitle">E-Commerce Portal</p>
          </div>

          <h2 className="form-title">Login to Account</h2>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }} className="auth-link">
                  Forgot Password?
                </Link>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? <span className="spinner"></span> : <>Login <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="auth-links">
            Don't have an account? 
            <Link to="/register" className="auth-link">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
