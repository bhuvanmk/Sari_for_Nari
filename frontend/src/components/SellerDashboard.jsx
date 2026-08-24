import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Star, CreditCard,
  User, LogOut, AlertTriangle, TrendingUp, AlertCircle, Plus, Printer, RefreshCw, Eye
} from 'lucide-react';
import { api } from '../services/api';
import PrintableInvoice from './PrintableInvoice';

export default function SellerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = api.getUser();

  // Determine initial tab from route path
  const getInitialTab = () => {
    if (location.pathname.includes('/products')) return 'products';
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/inventory')) return 'inventory';
    if (location.pathname.includes('/analytics')) return 'analytics';
    if (location.pathname.includes('/reviews')) return 'reviews';
    if (location.pathname.includes('/payments')) return 'payments';
    if (location.pathname.includes('/profile')) return 'profile';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample boutique orders for printing invoices
  const sampleOrders = [
    {
      id: 8921,
      customerName: 'Anita Roy',
      customerEmail: 'anita.roy@example.com',
      shippingAddress: 'Plot 42, Green Avenue, Jubilee Hills, Hyderabad, Telangana - 500033',
      sareeName: 'Crimson Red Pure Banarasi Silk Saree',
      amount: 12999,
      status: 'Pending'
    },
    {
      id: 8920,
      customerName: 'Meera Patel',
      customerEmail: 'meera.p@example.com',
      shippingAddress: '12-A Sunrise Towers, Race Course Road, Ahmedabad, Gujarat - 380007',
      sareeName: 'Kanjivaram Temple Border Silk Saree',
      amount: 18999,
      status: 'Shipped'
    },
    {
      id: 8919,
      customerName: 'Sunita Rao',
      customerEmail: 'sunita.rao@example.com',
      shippingAddress: '88 Heritage Enclave, Indiranagar, Bengaluru, Karnataka - 560038',
      sareeName: 'Paithani Peacock Motif Pure Handloom Saree',
      amount: 24999,
      status: 'Delivered'
    }
  ];

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const res = await api.getProducts();
    if (res.ok) {
      setProductsList(res.data || []);
    }
    setIsLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') navigate('/seller/dashboard');
    else if (tab === 'products') navigate('/seller/products');
    else if (tab === 'orders') navigate('/seller/orders');
    else navigate(`/seller/dashboard`);
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/brand_logo.png" alt="Sarees For Naaris" className="sidebar-logo" />
          <span className="sidebar-brand-title">SELLER PORTAL</span>
        </div>

        <nav className="sidebar-menu">
          <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabChange('products')}>
            <Package size={18} /> My Products
          </button>
          <button className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabChange('orders')}>
            <ShoppingCart size={18} /> Orders & Invoices
          </button>
          <button className={`sidebar-link ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => handleTabChange('inventory')}>
            <AlertTriangle size={18} /> Inventory
          </button>
          <button className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleTabChange('analytics')}>
            <BarChart3 size={18} /> Analytics
          </button>
          <button className={`sidebar-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => handleTabChange('reviews')}>
            <Star size={18} /> Reviews
          </button>
          <button className={`sidebar-link ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => handleTabChange('payments')}>
            <CreditCard size={18} /> Payments
          </button>
          <button className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
            <User size={18} /> Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Dashboard Area */}
      <main className="dashboard-main-content">
        <header className="dashboard-top-bar">
          <div>
            <h2>Seller Partner Dashboard</h2>
            <p className="subtext">Welcome back, <strong>{user?.username}</strong>! Managing <em>Royal Handloom Weavers Boutique</em>.</p>
          </div>

          <div className="quick-action-btns">
            <button className="btn-action-primary" onClick={() => handleTabChange('products')}>
              <Plus size={16} /> Add New Product
            </button>
            <button className="btn-action-secondary" onClick={() => setSelectedInvoiceOrder(sampleOrders[0])}>
              <Printer size={16} /> Print Quick Invoice
            </button>
          </div>
        </header>

        {/* Schema Notice Banner */}
        <div className="schema-warning-banner">
          <AlertCircle size={20} />
          <div>
            <strong>Seller Partner Active:</strong> You can manage catalog products, track sales orders, and print tax invoices.
          </div>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            <div className="stat-cards-grid">
              <div className="stat-card">
                <div className="stat-icon-box gold-box"><Package size={22} /></div>
                <div>
                  <span className="stat-label">Total Products</span>
                  <h3 className="stat-number">24</h3>
                  <span className="stat-trend positive">+3 this week</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box green-box"><ShoppingCart size={22} /></div>
                <div>
                  <span className="stat-label">Orders Today</span>
                  <h3 className="stat-number">12</h3>
                  <span className="stat-trend positive">↑ 18% vs yesterday</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box purple-box"><TrendingUp size={22} /></div>
                <div>
                  <span className="stat-label">Revenue Today</span>
                  <h3 className="stat-number">₹45,800</h3>
                  <span className="stat-trend positive">↑ 24% vs target</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box orange-box"><RefreshCw size={22} /></div>
                <div>
                  <span className="stat-label">Pending Dispatch</span>
                  <h3 className="stat-number">5</h3>
                  <span className="stat-trend neutral">Dispatch within 24h</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-box red-box"><AlertTriangle size={22} /></div>
                <div>
                  <span className="stat-label">Out of Stock</span>
                  <h3 className="stat-number">2</h3>
                  <span className="stat-trend negative">Requires restock</span>
                </div>
              </div>
            </div>

            <div className="dashboard-sections-grid">
              {/* Recent Orders Table */}
              <div className="glass-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="panel-title" style={{ margin: 0 }}>Recent Boutique Orders</h3>
                  <button className="btn-action-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleTabChange('orders')}>
                    View All Orders
                  </button>
                </div>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Saree</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td>#ORD-{ord.id}</td>
                        <td>{ord.customerName}</td>
                        <td>{ord.sareeName}</td>
                        <td>₹{ord.amount.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`status-badge ${ord.status.toLowerCase()}`}>
                            {ord.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-action-secondary" 
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            onClick={() => setSelectedInvoiceOrder(ord)}
                          >
                            <Printer size={13} style={{ marginRight: '4px' }} /> Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Low Stock Alerts */}
              <div className="glass-panel">
                <h3 className="panel-title">Low Stock Alert</h3>
                <div className="alert-list">
                  <div className="alert-item">
                    <div>
                      <h4>Maroon Royal Brocade Banarasi</h4>
                      <p>Category: Banarasi Silk</p>
                    </div>
                    <span className="stock-count critical">2 Left</span>
                  </div>

                  <div className="alert-item">
                    <div>
                      <h4>Peacock Blue Royal Paithani</h4>
                      <p>Category: Paithani</p>
                    </div>
                    <span className="stock-count warning">3 Left</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="panel-title" style={{ margin: 0 }}>My Saree Catalog</h3>
              <button className="btn-action-primary"><Plus size={16} /> Add Saree</button>
            </div>
            
            {isLoading ? (
              <p>Loading products...</p>
            ) : (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Product Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsList.length > 0 ? (
                    productsList.slice(0, 10).map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <strong>{prod.title}</strong>
                        </td>
                        <td>{prod.category_name || prod.categoryName || 'Banarasi'}</td>
                        <td>₹{Number(prod.price).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`status-badge ${prod.stock_quantity > 0 ? 'delivered' : 'pending'}`}>
                            {prod.stock_quantity > 0 ? `${prod.stock_quantity} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td>
                          <button className="btn-action-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => navigate(`/product/${prod.id}`)}>
                            <Eye size={13} style={{ marginRight: '4px' }} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="glass-panel">
            <h3 className="panel-title">Boutique Orders & Invoice Print</h3>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Delivery Address</th>
                  <th>Saree Item</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Print Invoice</th>
                </tr>
              </thead>
              <tbody>
                {sampleOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>#ORD-{ord.id}</td>
                    <td>{ord.customerName}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ord.shippingAddress}
                    </td>
                    <td>{ord.sareeName}</td>
                    <td>₹{ord.amount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`status-badge ${ord.status.toLowerCase()}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-action-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => setSelectedInvoiceOrder(ord)}
                      >
                        <Printer size={14} style={{ marginRight: '6px' }} /> Print Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REVIEWS & MODERATION TAB */}
        {activeTab === 'reviews' && (
          <div className="glass-panel">
            <h3 className="panel-title">Customer Feedback & Content Moderation Queue</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Review customer ratings, moderate flagged comments, and post official seller responses.
            </p>
            <div style={{ background: '#FAF8F5', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>
              <Star size={36} color="#D4AF37" style={{ marginBottom: '0.8rem' }} />
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.4rem' }}>Moderation & Feedback Hub Active</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '600px', margin: '0 auto 1rem auto' }}>
                All customer reviews undergo real-time automated fraud/profanity validation. Approved reviews appear instantly on product pages, and flagged items are routed here for official approval.
              </p>
              <button 
                className="btn-action-primary" 
                onClick={() => navigate('/products')}
              >
                View Catalog Reviews
              </button>
            </div>
          </div>
        )}

        {/* OTHER TABS FALLBACK */}
        {['inventory', 'analytics', 'payments', 'profile'].includes(activeTab) && (
          <div className="glass-panel">
            <h3 className="panel-title" style={{ textTransform: 'capitalize' }}>{activeTab} Portal</h3>
            <p>Welcome to the dedicated {activeTab} workspace for your boutique store.</p>
          </div>
        )}
      </main>

      {/* Printable Invoice Modal Component */}
      {selectedInvoiceOrder && (
        <PrintableInvoice 
          order={selectedInvoiceOrder} 
          onClose={() => setSelectedInvoiceOrder(null)} 
        />
      )}
    </div>
  );
}
