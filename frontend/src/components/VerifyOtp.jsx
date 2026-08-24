import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function VerifyOtp() {
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('REGISTRATION');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  // Timer state
  const [timer, setTimer] = useState(60);
  
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email') || localStorage.getItem('verificationEmail') || '';
    const purposeParam = params.get('purpose') || 'REGISTRATION';
    
    setEmail(emailParam);
    setPurpose(purposeParam);
    
    if (!emailParam) {
      setError('Missing email address. Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [location, navigate]);

  // Handle OTP countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter a 6-digit OTP code.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.verifyOtp(email, fullOtp, purpose);
      if (res.ok) {
        setSuccess(res.data.message || 'OTP Verified successfully.');
        setTimeout(() => {
          if (purpose === 'RESET') {
            // Send user to reset password page with resetToken
            navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(res.data.resetToken)}`);
          } else {
            navigate('/login?verified=true');
          }
        }, 1500);
      } else {
        setError(res.data.message || 'Verification failed. Please try again.');
      }
    } catch {
      setError('Could not connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResendLoading(true);

    try {
      const res = await api.resendOtp(email, purpose);
      if (res.ok) {
        setSuccess('OTP resent successfully. Check server logs/console!');
        setTimer(60);
        setOtp(new Array(6).fill(''));
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        setError(res.data.message || 'Resend failed.');
      }
    } catch {
      setError('Could not connect to authentication server.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-bg-wrapper">
      <div className="auth-container">
        <div className="glass-card">
          <div className="brand-header">
            <img src="/brand_logo.png" alt="Sarees For Naaris Logo" className="brand-logo" />
            <h1 className="brand-title">Sarees For Naaris</h1>
            <p className="brand-subtitle">Verification</p>
          </div>

          <h2 className="form-title">Enter Verification Code</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
            We've sent a 6-digit verification code to <strong>{email}</strong>
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
            <div className="otp-grid">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  name="otp"
                  maxLength="1"
                  className="otp-box"
                  value={data}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={(e) => e.target.select()}
                  required
                />
              ))}
            </div>

            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Verify Code'}
            </button>
          </form>

          <div className="auth-links" style={{ marginTop: '2rem' }}>
            {timer > 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>
                Resend OTP in <strong>{timer}s</strong>
              </span>
            ) : (
              <button 
                onClick={handleResend} 
                disabled={resendLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-gold)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {resendLoading ? <RefreshCw className="spinner" size={14} /> : <RefreshCw size={14} />} Resend OTP
              </button>
            )}
          </div>
          
          <div className="auth-links">
            <Link to="/login" className="auth-link">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
