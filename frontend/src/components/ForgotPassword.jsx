import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.forgotPassword(email);
      if (res.ok) {
        setSuccess('If your email is registered, we have sent a reset OTP. Redirecting to verify OTP...');
        localStorage.setItem('verificationEmail', email);
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}&purpose=RESET`);
        }, 2000);
      } else {
        setError(res.data.message || 'Error requesting reset. Please check details.');
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
            <p className="brand-subtitle">Reset Password</p>
          </div>

          <h2 className="form-title">Forgot Password?</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Enter your email address and we'll send you an OTP to verify your identity and reset your password.
          </p>

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
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? <span className="spinner"></span> : <>Request OTP <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login" className="auth-link">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
