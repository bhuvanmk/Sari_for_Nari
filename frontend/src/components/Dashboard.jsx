import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Check, Clock, Truck, Home, Star, Printer, FileText, Search, Eye, Download, CreditCard, RotateCcw, Ban, X } from 'lucide-react';
import Navbar from './Navbar';
import Toast from './Toast';
import PostOrderReviewModal from './PostOrderReviewModal';
import PrintableInvoice from './PrintableInvoice';
import OrderDetailsModal from './OrderDetailsModal';
import ShipmentTrackingModal from './ShipmentTrackingModal';
import ReturnModal from './ReturnModal';
import PaymentHistoryModal from './PaymentHistoryModal';
import { api } from '../services/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [summary, setSummary] = useState({ totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, cancelledOrders: 0, totalSpent: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [editingAddressOrderId, setEditingAddressOrderId] = useState(null);
  const [newAddressText, setNewAddressText] = useState('');
  
  // Modals state
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState(null);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null); // { order, product }
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setUser(api.getUser());
    loadOrders();
    loadSummary();
  }, [navigate]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.getMyOrders();
      if (res.ok && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await api.getDashboardSummary();
      if (res.ok && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error("Error loading dashboard summary:", err);
    }
  };

  const handleUpdateAddress = async (orderId) => {
    if (!newAddressText.trim()) return;
    const res = await api.updateOrderAddress(orderId, newAddressText);
    if (res.ok) {
      showNotification('Delivery address updated successfully!');
      setEditingAddressOrderId(null);
      setNewAddressText('');
      loadOrders();
    } else {
      showNotification(res.data.message || 'Could not update address.', 'error');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
  };

  const stages = [
    { key: 'Order Placed', label: 'Order Placed', icon: Clock },
    { key: 'In Transit', label: 'In Transit', icon: Package },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: Home }
  ];

  const getStageIndex = (statusStr) => {
    if (!statusStr) return 0;
    const lower = statusStr.toLowerCase();
    if (lower.includes('delivered')) return 3;
    if (lower.includes('out for delivery')) return 2;
    if (lower.includes('transit') || lower.includes('shipped')) return 1;
    return 0;
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  // Filtered Orders logic
  const filteredOrders = orders.filter(ord => {
    const matchesSearch = !searchQuery.trim() || 
      ord.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.items && ord.items.some(it => it.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())));

    const status = (ord.status || '').toLowerCase();
    let matchesStatus = true;
    if (statusFilter === 'PENDING') matchesStatus = !status.includes('delivered') && !status.includes('cancelled');
    else if (statusFilter === 'DELIVERED') matchesStatus = status.includes('delivered');
    else if (statusFilter === 'CANCELLED') matchesStatus = status.includes('cancelled');

    return matchesSearch && matchesStatus;
  });

  if (!user) return null;

  return (
    <div className="page-wrapper page-fade-in">
      <Navbar />

      <Toast notification={notification} onClose={() => setNotification(null)} />

      <div className="cart-page-container" style={{ maxWidth: '1150px', margin: '2rem auto' }}>
        
        {/* User Greeting & Header Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '0.2rem' }}>My Account & OMS Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome back, <strong>{user.username}</strong> ({user.email})</p>
          </div>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button 
              onClick={() => setShowPaymentHistory(true)} 
              className="btn-hero-secondary"
              style={{ width: 'auto', padding: '0.5rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <CreditCard size={16} /> Payment History
            </button>
            <button onClick={handleLogout} className="btn-hero-secondary" style={{ width: 'auto', padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Dashboard Summary Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
          <div style={{ background: '#FFFFFF', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Total Orders</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-accent)', marginTop: '0.2rem' }}>{summary.totalOrders || orders.length}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Pending & Shipped</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem' }}>{summary.pendingOrders}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Delivered</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>{summary.deliveredOrders}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.2rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Total Spent</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary-hover)', marginTop: '0.2rem' }}>₹{Number(summary.totalSpent || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* My Orders Section */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid var(--border-color)', background: '#FFFFFF' }}>
          
          {/* Header & Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Package size={22} /> My Orders History ({filteredOrders.length})
            </h2>

            {/* Search & Status Filter */}
            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                <input
                  type="text"
                  placeholder="Search by Order ID or Product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.2rem', paddingRight: '1rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', background: '#FFFFFF' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending / Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {loadingOrders ? (
            <div className="loading-spinner-wrapper"><div className="spinner"></div></div>
          ) : filteredOrders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>No orders found matching your search criteria.</p>
          ) : (
            <div style={{ display: 'grid', gap: '2rem' }}>
              {filteredOrders.map(ord => {
                const currentIdx = getStageIndex(ord.status);
                const canEditAddress = currentIdx === 0 && (ord.status || '').toLowerCase() !== 'cancelled';
                const isDelivered = (ord.status || '').toUpperCase() === 'DELIVERED' || currentIdx === 3;
                const isCancelled = (ord.status || '').toUpperCase() === 'CANCELLED';

                const historyMap = {};
                if (Array.isArray(ord.statusHistory)) {
                  ord.statusHistory.forEach(h => {
                    const idx = getStageIndex(h.status);
                    if (!historyMap[idx]) historyMap[idx] = h.changedAt;
                  });
                }
                if (!historyMap[0] && ord.createdAt) historyMap[0] = ord.createdAt;

                const progressPct = (currentIdx / 3) * 100;

                return (
                  <div key={ord.orderId} style={{ background: '#FFFDF9', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(45,36,20,0.04)' }}>
                    
                    {/* Card Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
                      <div>
                        <strong style={{ color: 'var(--color-accent)', fontSize: '1.1rem', fontWeight: 700 }}>Order #{ord.orderId}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '1rem', fontWeight: 600 }}>Total: ₹{Number(ord.totalAmount).toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span className={`status-badge ${isCancelled ? 'cancelled' : 'shipped'}`} style={{ fontSize: '0.82rem', padding: '0.3rem 0.8rem' }}>
                          Status: {ord.status || 'Order Placed'}
                        </span>
                        
                        <button
                          onClick={() => setSelectedDetailsOrder(ord)}
                          className="btn-hero-secondary"
                          style={{ width: 'auto', padding: '0.3rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: '6px' }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </div>
                    </div>

                    {/* Visual Stepper Container */}
                    {!isCancelled && (
                      <div style={{ margin: '2rem 0', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '3px', background: 'var(--border-color)', zIndex: 1 }} />
                        <div style={{ position: 'absolute', top: '20px', left: '10%', width: `${progressPct * 0.8}%`, height: '3px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))', zIndex: 1, transition: 'width 0.5s ease' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
                          {stages.map((st, i) => {
                            const isCompleted = i <= currentIdx;
                            const isCurrent = i === currentIdx;
                            const Icon = st.icon;
                            const timestamp = historyMap[i];

                            return (
                              <div key={st.key} style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{
                                  width: '42px', height: '42px', borderRadius: '50%', margin: '0 auto 0.6rem',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: isCompleted ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))' : '#FFFFFF',
                                  border: isCompleted ? 'none' : '2px solid var(--border-color)',
                                  color: isCompleted ? '#FFFFFF' : 'var(--text-secondary)',
                                  boxShadow: isCurrent ? '0 0 16px rgba(200, 155, 60, 0.55)' : isCompleted ? '0 2px 8px rgba(200, 155, 60, 0.25)' : 'none',
                                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                                  transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
                                }}>
                                  {isCompleted ? <Check size={20} /> : <Icon size={18} />}
                                </div>

                                <div style={{ fontSize: '0.8rem', color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isCompleted ? '700' : '500' }}>
                                  {st.label}
                                </div>

                                {timestamp && (
                                  <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-hover)', fontWeight: '600', marginTop: '0.2rem' }}>
                                    {formatTimestamp(timestamp)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Ordered Items Summary */}
                    {ord.items && ord.items.length > 0 && (
                      <div style={{ marginTop: '1rem', background: '#FFFFFF', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--color-accent)', display: 'block', marginBottom: '0.5rem', fontWeight: 700 }}>Items Ordered:</strong>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                          {ord.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                              <span>{item.product?.name || `Product #${item.product?.id || ''}`} × {item.quantity}</span>
                              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>₹{Number(item.totalPrice || (item.pricePerUnit * item.quantity)).toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button
                          onClick={() => setSelectedTrackingOrder(ord)}
                          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', background: '#FDFBF7', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: 'var(--color-accent)' }}
                        >
                          <Truck size={15} /> Track Shipment
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await api.downloadInvoicePdf(ord.orderId);
                            } catch (e) {
                              setSelectedInvoiceOrder(ord);
                            }
                          }}
                          style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', background: '#FDFBF7', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: 'var(--color-accent)' }}
                        >
                          <Download size={15} /> Download PDF Invoice
                        </button>
                      </div>

                      {isDelivered ? (
                        <button
                          className="btn-gold"
                          style={{ width: 'auto', padding: '0.5rem 1.2rem', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                          onClick={() => setReviewingOrder(ord)}
                        >
                          <Star size={15} fill="#D4AF37" color="#D4AF37" /> Rate & Review Delivered Items
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* OMS Modals */}
      {selectedDetailsOrder && (
        <OrderDetailsModal
          order={selectedDetailsOrder}
          onClose={() => setSelectedDetailsOrder(null)}
          onRefresh={() => { loadOrders(); loadSummary(); }}
          onOpenTracking={(ord) => { setSelectedDetailsOrder(null); setSelectedTrackingOrder(ord); }}
          onOpenReturn={(ord, prod) => { setSelectedDetailsOrder(null); setReturnTarget({ order: ord, product: prod }); }}
        />
      )}

      {selectedTrackingOrder && (
        <ShipmentTrackingModal
          order={selectedTrackingOrder}
          onClose={() => setSelectedTrackingOrder(null)}
        />
      )}

      {returnTarget && (
        <ReturnModal
          order={returnTarget.order}
          product={returnTarget.product}
          onClose={() => setReturnTarget(null)}
          onSuccess={(msg) => showNotification(msg, 'success')}
        />
      )}

      {showPaymentHistory && (
        <PaymentHistoryModal
          onClose={() => setShowPaymentHistory(false)}
        />
      )}

      {reviewingOrder && (
        <PostOrderReviewModal
          order={reviewingOrder}
          onClose={() => setReviewingOrder(null)}
          onSubmitSuccess={() => {
            setReviewingOrder(null);
            showNotification('Review submitted successfully!', 'success');
          }}
          onSubmitted={() => {
            setReviewingOrder(null);
            showNotification('Review submitted successfully!', 'success');
          }}
        />
      )}

      {selectedInvoiceOrder && (
        <PrintableInvoice
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
