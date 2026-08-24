import React, { useState } from 'react';
import { Star, CheckCircle, X, MessageSquare, Send } from 'lucide-react';
import { api } from '../services/api';

export default function PostOrderReviewModal({ order, onClose, onSubmitSuccess }) {
  // Extract items from order
  const orderItems = order?.orderItems || order?.items || [];
  
  // State: object mapping productId -> { rating: number, comment: string, photoUrl: string }
  const [reviewsData, setReviewsData] = useState(() => {
    const initial = {};
    orderItems.forEach(item => {
      const pid = item.product?.productId || item.productId;
      if (pid) {
        initial[pid] = { rating: 5, comment: '', photoUrl: '' };
      }
    });
    return initial;
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleRatingChange = (productId, newRating) => {
    setReviewsData(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating: newRating }
    }));
  };

  const handleCommentChange = (productId, text) => {
    setReviewsData(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment: text }
    }));
  };

  const handlePhotoUrlChange = (productId, url) => {
    setReviewsData(prev => ({
      ...prev,
      [productId]: { ...prev[productId], photoUrl: url }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = Object.entries(reviewsData).map(([productId, data]) => ({
      productId: parseInt(productId, 10),
      orderId: order.orderId,
      rating: data.rating,
      comment: data.comment,
      photoUrls: data.photoUrl ? [data.photoUrl] : []
    }));

    try {
      const res = await api.submitBatchReviews(payload);
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          if (onSubmitSuccess) onSubmitSuccess();
          else onClose();
        }, 1800);
      } else {
        setError(res.data.message || 'Could not save feedback. Please try again.');
      }
    } catch {
      setError('Failed to connect to review service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content review-prompt-modal" style={{ maxWidth: '650px', width: '90%' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {submitted ? (
          <div className="review-success-state" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
            <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>
              Thank You For Your Feedback!
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Your reviews have been published and will help other handloom saree lovers.
            </p>
          </div>
        ) : (
          <div>
            <div className="modal-header" style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
              <div className="review-badge-header" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(200, 155, 60, 0.12)', color: 'var(--color-accent)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.6rem' }}>
                <MessageSquare size={14} /> Order Placed Successfully!
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontSize: '1.5rem', marginBottom: '0.4rem' }}>
                Rate Your Ordered Sarees
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Share your early expectations and initial impression while your order is prepared!
              </p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="review-items-container" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1.5rem' }}>
                {orderItems.map((item, idx) => {
                  const product = item.product || item;
                  const pid = product.productId || item.productId;
                  const currentData = reviewsData[pid] || { rating: 5, comment: '' };
                  const imageUrl = product.images?.[0]?.imageUrl || product.imageUrl || '/placeholder.png';

                  return (
                    <div key={pid || idx} className="review-item-card" style={{ padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border-color)', background: '#FAF8F5', marginBottom: '1.2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <img src={imageUrl} alt={product.name} style={{ width: '60px', height: '75px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} />
                        <div>
                          <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', fontSize: '1.05rem', marginBottom: '0.2rem', fontWeight: 600 }}>
                            {product.name}
                          </h4>
                          <span style={{ fontSize: '0.88rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                            ₹{Number(item.priceAtPurchase || product.price || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Interactive 5-Star Rating Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', background: '#FFFFFF', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>Rating:</span>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRatingChange(pid, star)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.25)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              aria-label={`Rate ${star} stars`}
                            >
                              <Star
                                size={24}
                                fill={star <= currentData.rating ? '#D4AF37' : 'none'}
                                color={star <= currentData.rating ? '#D4AF37' : '#CCC'}
                              />
                            </button>
                          ))}
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#D4AF37', marginLeft: 'auto', background: 'rgba(212, 175, 55, 0.12)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                          {currentData.rating} / 5 Stars
                        </span>
                      </div>

                      {/* Optional Comment Textarea */}
                      <textarea
                        className="form-input"
                        rows="2"
                        placeholder="Write your feedback or impression (optional)..."
                        value={currentData.comment}
                        onChange={(e) => handleCommentChange(pid, e.target.value)}
                        maxLength={500}
                        style={{ width: '100%', fontSize: '0.88rem', padding: '0.7rem 0.9rem', resize: 'vertical', marginBottom: '0.7rem', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                      />

                      {/* Optional Photo URL Attachment */}
                      <input
                        type="url"
                        className="form-input"
                        placeholder="Paste saree photo URL (optional, e.g. https://...)"
                        value={currentData.photoUrl || ''}
                        onChange={(e) => handlePhotoUrlChange(pid, e.target.value)}
                        style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem 0.9rem', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.7rem 1.4rem', fontSize: '0.88rem', borderRadius: '10px' }}>
                  Skip For Now
                </button>
                <button type="submit" className="btn-gold" disabled={submitting} style={{ padding: '0.7rem 1.6rem', fontSize: '0.88rem', borderRadius: '10px' }}>
                  {submitting ? <span className="spinner"></span> : <><Send size={16} /> Submit Review</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
