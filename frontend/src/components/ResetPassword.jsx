import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email') || '';
    const tokenParam = params.get('token') || '';
    
    setEmail(emailParam);
    setToken(tokenParam);
    
    if (!tokenParam) {
      setError('Invalid reset link/token. Redirecting to forgot password...');
      setTimeout(() => navigate('/forgot-password'), 2000);
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Send token as the "otpCode" field to api.resetPassword since the backend handles both UUID token and numeric OTP.
      const res = await api.resetPassword(email, token, newPassword);
      if (res.ok) {
        setSuccess('Password has been reset successfully. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(res.data.message || 'Reset failed. Token might be expired or invalid.');
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

          <h2 className="form-title">Enter New Password</h2>

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
              <label className="form-label">New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? <span className="spinner"></span> : <>Reset Password <ArrowRight size={18} /></>}
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
