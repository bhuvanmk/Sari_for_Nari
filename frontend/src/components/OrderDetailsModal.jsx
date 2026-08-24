import React, { useState } from 'react';
import { X, Package, Truck, Calendar, MapPin, Download, RotateCcw, Ban, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function OrderDetailsModal({ order, onClose, onRefresh, onOpenTracking, onOpenReturn }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [msg, setMsg] = useState(null);

  if (!order) return null;

  const isShippedOrDelivered = ['shipped', 'out for delivery', 'delivered'].includes((order.status || '').toLowerCase());
  const isCancelled = (order.status || '').toLowerCase() === 'cancelled';
  const isDelivered = (order.status || '').toLowerCase() === 'delivered';

  const handleCancelOrder = async () => {
    setCancelling(true);
    setMsg(null);
    try {
      const res = await api.cancelOrder(order.orderId, cancelReason);
      if (res.ok) {
        setMsg({ text: 'Order cancelled successfully!', type: 'success' });
        setShowCancelConfirm(false);
        if (onRefresh) onRefresh();
      } else {
        setMsg({ text: res.data.message || 'Could not cancel order.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Error executing cancellation.', type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await api.downloadInvoicePdf(order.orderId);
    } catch (err) {
      alert('Could not download PDF invoice: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-amber-50 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-400" /> Order #{order.orderId}
            </h2>
            <p className="text-amber-200/80 text-xs mt-1">
              Placed on {new Date(order.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-amber-200 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {msg && (
            <div className={`p-3.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msg.text}
            </div>
          )}

          {/* Status & Quick Actions Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-amber-50/70 rounded-xl border border-amber-200/60">
            <div>
              <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">Current Status</span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                isCancelled ? 'bg-red-100 text-red-700' : isDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-900'
              }`}>
                {order.status || 'Order Placed'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadPdf}
                className="px-3.5 py-2 bg-amber-900 text-amber-50 rounded-lg text-xs font-bold hover:bg-amber-800 transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4 text-amber-300" /> Download PDF Invoice
              </button>

              <button
                onClick={() => onOpenTracking(order)}
                className="px-3.5 py-2 bg-white text-amber-950 border border-amber-300 rounded-lg text-xs font-bold hover:bg-amber-50 transition flex items-center gap-1.5 shadow-sm"
              >
                <Truck className="w-4 h-4 text-amber-700" /> Track Shipment
              </button>

              {!isShippedOrDelivered && !isCancelled && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-3.5 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" /> Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Cancel Order Form Modal overlay */}
          {showCancelConfirm && (
            <div className="p-4 bg-red-50/80 rounded-xl border border-red-200 space-y-3">
              <p className="text-xs font-bold text-red-900">Are you sure you want to cancel this order? Stock will be automatically restored.</p>
              <input
                type="text"
                placeholder="Reason for cancellation (Optional)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-red-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          )}

          {/* Product Items Breakdown */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Ordered Items</h3>
            <div className="space-y-3">
              {order.items && order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.product?.images && item.product.images.length > 0 ? item.product.images[0].imageUrl : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80'} 
                      alt={item.product?.name || 'Saree'} 
                      className="w-12 h-12 object-cover rounded-lg border border-amber-200"
                    />
                    <div>
                      <p className="font-bold text-xs text-gray-900">{item.product?.name || `Product #${item.product?.productId}`}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.pricePerUnit}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-amber-900">₹{Number(item.totalPrice).toLocaleString('en-IN')}</span>
                    {isDelivered && (
                      <button
                        onClick={() => onOpenReturn(order, item.product)}
                        className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded text-[11px] font-bold hover:bg-amber-200 transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address & Payment Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-700" /> Shipping & Billing Address
              </h4>
              <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                {order.addressSnapshot || 'Standard Customer Address'}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-700" /> Payment & Charges
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-gray-900">{order.paymentMethod || 'COD'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Status:</span>
                  <span className="font-semibold text-gray-900">{order.paymentStatus || 'PENDING'}</span>
                </div>
                <div className="flex justify-between text-gray-600 border-t pt-1.5">
                  <span>Items Subtotal:</span>
                  <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-amber-950 text-sm border-t pt-1.5">
                  <span>Grand Total:</span>
                  <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-900 text-amber-50 rounded-lg text-xs font-bold hover:bg-amber-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
