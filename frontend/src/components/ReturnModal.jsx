import React, { useState } from 'react';
import { X, RotateCcw, Upload, Check } from 'lucide-react';
import { api } from '../services/api';

export default function ReturnModal({ order, product, onClose, onSuccess }) {
  const [type, setType] = useState('RETURN');
  const [reason, setReason] = useState('Defective / Damaged Product');
  const [comments, setComments] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const REASONS = [
    'Defective / Damaged Product',
    'Size or Fit Issue',
    'Color/Design Difference from Photo',
    'Received Wrong Item',
    'Quality Not as Expected'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a return reason.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.submitReturnRequest(
        order.orderId,
        product.productId,
        type,
        reason,
        comments,
        imageUrl
      );

      if (res.ok) {
        onSuccess('Return/Replacement request submitted successfully!');
        onClose();
      } else {
        setError(res.data.message || 'Failed to submit return request.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-amber-50 p-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" /> Return / Replacement Request
            </h2>
            <p className="text-amber-200/80 text-xs mt-0.5">Order #{order.orderId}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* Product Summary */}
          <div className="flex items-center gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
            <img 
              src={product.images && product.images.length > 0 ? product.images[0].imageUrl : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'} 
              alt={product.name}
              className="w-12 h-12 object-cover rounded-lg border border-amber-200" 
            />
            <div>
              <p className="font-semibold text-gray-900">{product.name}</p>
              <p className="text-xs text-amber-800">₹{product.price}</p>
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase">Request Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('RETURN')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  type === 'RETURN' ? 'bg-amber-900 text-amber-50 border-amber-900' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {type === 'RETURN' && <Check className="w-4 h-4 text-amber-400" />} Return & Refund
              </button>
              <button
                type="button"
                onClick={() => setType('REPLACEMENT')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-2 ${
                  type === 'REPLACEMENT' ? 'bg-amber-900 text-amber-50 border-amber-900' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {type === 'REPLACEMENT' && <Check className="w-4 h-4 text-amber-400" />} Replacement
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Reason for Return</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {REASONS.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Additional Comments */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Comments / Details</label>
            <textarea
              rows="3"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Photo Evidence URL */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Photo Evidence URL (Optional)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ik.imagekit.io/..."
              className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-900 text-amber-50 rounded-lg text-xs font-bold hover:bg-amber-800 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
