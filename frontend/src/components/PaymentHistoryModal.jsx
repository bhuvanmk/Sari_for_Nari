import React, { useEffect, useState } from 'react';
import { X, CreditCard, Download, CheckCircle, Calendar, Hash } from 'lucide-react';
import { api } from '../services/api';

export default function PaymentHistoryModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await api.getMyPayments();
      if (res.ok && Array.isArray(res.data)) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error("Error loading payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      await api.downloadInvoicePdf(orderId);
    } catch (err) {
      alert('Could not download invoice PDF: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-amber-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-amber-50 p-5 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" /> Customer Payment Log & History
            </h2>
            <p className="text-amber-200/80 text-xs mt-0.5">Verified Transaction Log</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-amber-800 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm font-medium">
              No online payments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-50/80 text-amber-950 border-b border-amber-200">
                    <th className="p-3 font-bold">Transaction ID</th>
                    <th className="p-3 font-bold">Order ID</th>
                    <th className="p-3 font-bold">Date & Time</th>
                    <th className="p-3 font-bold">Method</th>
                    <th className="p-3 font-bold">Amount</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.paymentId} className="hover:bg-amber-50/30 transition">
                      <td className="p-3 font-mono font-bold text-gray-900 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-amber-700" /> {p.transactionId}
                      </td>
                      <td className="p-3 font-semibold text-amber-900">{p.order?.orderId || 'N/A'}</td>
                      <td className="p-3 text-gray-600">
                        {new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-3 font-bold text-gray-700">{p.paymentMethod}</td>
                      <td className="p-3 font-bold text-emerald-700">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                          <CheckCircle className="w-3 h-3" /> {p.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(p.order?.orderId)}
                          className="px-2.5 py-1 bg-amber-900 text-amber-50 rounded hover:bg-amber-800 transition text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
