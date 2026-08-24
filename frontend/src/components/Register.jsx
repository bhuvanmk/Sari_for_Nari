import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Shield, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.register(username, email, password, role);
      if (res.ok) {
        setSuccess(res.data.message);
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}&purpose=REGISTRATION`);
        }, 2000);
      } else {
        setError(res.data.message || 'Registration failed');
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

          <h2 className="form-title">Create Account</h2>

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
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Register As</label>
              <div className="input-wrapper select-wrapper">
                <Shield className="input-icon" style={{ zIndex: 3 }} />
                <select 
                  className="form-select" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="USER">Customer / Buyer</option>
                  <option value="SELLER">Seller / Boutique Partner</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? <span className="spinner"></span> : <>Register <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="auth-links">
            Already have an account? 
            <Link to="/login" className="auth-link">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
