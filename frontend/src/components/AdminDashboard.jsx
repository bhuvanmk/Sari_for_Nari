import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, Store, Package, ShoppingBag, DollarSign,
  BarChart3, Settings, LogOut, AlertCircle, CheckCircle2, XCircle, FolderKanban,
  Plus, Edit, Trash2, Eye, UserCheck, UserX, Calendar, RefreshCw
} from 'lucide-react';
import Toast from './Toast';
import { api } from '../services/api';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [notification, setNotification] = useState(null);

  // Modals & Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', subcategoryId: '', imageUrl: '' });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ username: '', email: '', role: 'USER' });
  const [roleChangeConfirm, setRoleChangeConfirm] = useState(false);

  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState(null);

  // Revenue Reports State
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [revenueData, setRevenueData] = useState(null);

  const navigate = useNavigate();
  const user = api.getUser();
  const containerRef = useScrollReveal();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      loadRevenueReport();
    }
  }, [activeTab, reportPeriod, reportDate]);

  const loadData = async () => {
    const catRes = await api.getCategories();
    if (catRes.ok) {
      setCategories(catRes.data);
      // Flatten subcategories
      const subList = [];
      catRes.data.forEach(c => {
        if (c.subcategories) subList.push(...c.subcategories);
      });
      setSubcategories(subList);
    }

    const prodRes = await api.getAdminProducts();
    if (prodRes.ok && Array.isArray(prodRes.data)) setProducts(prodRes.data);

    const custRes = await api.getAdminCustomers();
    if (custRes.status === 401) {
      navigate('/login');
      return;
    }
    if (custRes.ok && custRes.data.customers) setCustomers(custRes.data.customers);

    const selRes = await api.getAdminSellers();
    if (selRes.ok && selRes.data.sellers) setSellers(selRes.data.sellers);

    const ordRes = await api.getAllOrders();
    if (ordRes.status === 401) {
      navigate('/login');
      return;
    }
    if (ordRes.ok && Array.isArray(ordRes.data)) setAllOrders(ordRes.data);
  };

  const loadRevenueReport = async () => {
    const res = await api.getRevenueReport(reportPeriod, reportDate);
    if (res.ok) setRevenueData(res.data);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    const res = await api.updateOrderStatus(orderId, newStatus);
    if (res.ok) {
      setNotification({ msg: `Order #${orderId} updated to "${newStatus}"`, type: 'success' });
      loadData();
    } else {
      setNotification({ msg: res.data.message || 'Status update failed', type: 'error' });
    }
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  // Product Form Submissions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    const defaultCat = categories.length > 0 ? categories[0].categoryId : '';
    const filteredSubs = subcategories.filter(s => s.categoryId === Number(defaultCat));
    const defaultSub = filteredSubs.length > 0 ? filteredSubs[0].subcategoryId : (subcategories.length > 0 ? subcategories[0].subcategoryId : '');
    setProdForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: defaultCat,
      subcategoryId: defaultSub,
      imageUrl: ''
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name || '',
      description: prod.description || '',
      price: prod.price || '',
      stock: prod.stock || '',
      categoryId: prod.category?.categoryId || (categories[0]?.categoryId || ''),
      subcategoryId: prod.subcategory?.subcategoryId || (subcategories[0]?.subcategoryId || ''),
      imageUrl: prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.price || !prodForm.stock) {
      setNotification({ msg: 'Name, Price, and Stock are required fields.', type: 'error' });
      return;
    }

    if (editingProduct) {
      const res = await api.updateProduct(editingProduct.productId, prodForm);
      if (res.ok) {
        setNotification({ msg: 'Product updated successfully.', type: 'success' });
        setShowProductModal(false);
        loadData();
      } else {
        setNotification({ msg: res.data.message || 'Failed to update product', type: 'error' });
      }
    } else {
      const res = await api.createProduct(prodForm);
      if (res.ok) {
        setNotification({ msg: 'New product created successfully.', type: 'success' });
        setShowProductModal(false);
        loadData();
      } else {
        setNotification({ msg: res.data.message || 'Failed to create product', type: 'error' });
      }
    }
  };

  const handleSoftDeleteProduct = async (id) => {
    const res = await api.deleteProduct(id);
    if (res.ok) {
      setNotification({ msg: 'Product soft-deleted. Historical order records preserved.', type: 'success' });
      setShowDeleteConfirm(null);
      loadData();
    } else {
      setNotification({ msg: res.data.message || 'Delete failed', type: 'error' });
    }
  };

  // User Management Handlers
  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setUserForm({ username: u.username, email: u.email, role: u.role });
    setRoleChangeConfirm(false);
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (userForm.role !== editingUser.role && !roleChangeConfirm) {
      setRoleChangeConfirm(true);
      return;
    }

    const res = await api.updateUser(editingUser.userId, userForm);
    if (res.ok) {
      setNotification({ msg: `User #${editingUser.userId} details updated.`, type: 'success' });
      setShowUserModal(false);
      loadData();
    } else {
      setNotification({ msg: res.data.message || 'Failed to update user', type: 'error' });
    }
  };

  const handleToggleUserStatus = async (userObj) => {
    const newStatus = !(userObj.isActive ?? true);
    const res = await api.updateUserStatus(userObj.userId, newStatus);
    if (res.ok) {
      setNotification({ msg: `User #${userObj.userId} is now ${newStatus ? 'Active' : 'Deactivated'}.`, type: 'success' });
      loadData();
    } else {
      setNotification({ msg: res.data.message || 'Status update failed', type: 'error' });
    }
  };

  const handleViewCustomerProfile = async (id) => {
    const res = await api.getCustomerDetails(id);
    if (res.ok) {
      setSelectedCustomerProfile(res.data);
    } else {
      setNotification({ msg: 'Failed to load customer profile details', type: 'error' });
    }
  };

  // Derived filtered subcategories for form
  const availableSubcategories = subcategories.filter(s => s.categoryId === Number(prodForm.categoryId));

  return (
    <div className="dashboard-layout page-fade-in" ref={containerRef}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar admin-sidebar">
        <div className="sidebar-brand">
          <img src="/brand_logo.png" alt="Sarees For Naaris" className="sidebar-logo" />
          <span className="sidebar-brand-title">PLATFORM ADMIN</span>
        </div>

        <nav className="sidebar-menu">
          <button className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <ShieldCheck size={18} /> Overview
          </button>
          <button className={`sidebar-link ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
            <Users size={18} /> Customers
          </button>
          <button className={`sidebar-link ${activeTab === 'sellers' ? 'active' : ''}`} onClick={() => setActiveTab('sellers')}>
            <Store size={18} /> Sellers
          </button>
          <button className={`sidebar-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={18} /> Catalog
          </button>
          <button className={`sidebar-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <FolderKanban size={18} /> Categories
          </button>
          <button className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ShoppingBag size={18} /> All Orders
          </button>
          <button className={`sidebar-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <BarChart3 size={18} /> Revenue Reports
          </button>
          <button className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="dashboard-main-content">
        <Toast notification={notification} onClose={() => setNotification(null)} />

        <header className="dashboard-top-bar">
          <div>
            <h2>Platform Administration Panel</h2>
            <p className="subtext">Superadmin Control Center • Logged in as <strong>{user?.username}</strong></p>
          </div>
        </header>

        {/* Tab 1: Overview */}
        {activeTab === 'dashboard' && (
          <>
            <div className="stat-cards-grid">
              <div className="stat-card reveal-stagger-item">
                <div className="stat-icon-box blue-box"><Users size={22} /></div>
                <div>
                  <span className="stat-label">Total Customers</span>
                  <h3 className="stat-number">{customers.length}</h3>
                  <span className="stat-trend positive">Registered Buyers</span>
                </div>
              </div>

              <div className="stat-card reveal-stagger-item">
                <div className="stat-icon-box purple-box"><Store size={22} /></div>
                <div>
                  <span className="stat-label">Active Sellers</span>
                  <h3 className="stat-number">{sellers.length}</h3>
                  <span className="stat-trend positive">Partner Boutiques</span>
                </div>
              </div>

              <div className="stat-card reveal-stagger-item">
                <div className="stat-icon-box gold-box"><Package size={22} /></div>
                <div>
                  <span className="stat-label">Total Products</span>
                  <h3 className="stat-number">{products.length}</h3>
                  <span className="stat-trend positive">{categories.length} Categories</span>
                </div>
              </div>

              <div className="stat-card reveal-stagger-item">
                <div className="stat-icon-box green-box"><ShoppingBag size={22} /></div>
                <div>
                  <span className="stat-label">Total Orders</span>
                  <h3 className="stat-number">{allOrders.length}</h3>
                  <span className="stat-trend positive">Customer Purchases</span>
                </div>
              </div>

              <div className="stat-card reveal-stagger-item">
                <div className="stat-icon-box orange-box"><DollarSign size={22} /></div>
                <div>
                  <span className="stat-label">Platform Revenue</span>
                  <h3 className="stat-number">
                    ₹{allOrders.filter(o => o.status !== 'Cancelled').reduce((sum, ord) => sum + Number(ord.totalAmount || 0), 0).toLocaleString('en-IN')}
                  </h3>
                  <span className="stat-trend positive">Gross Sales (Excl. Cancelled)</span>
                </div>
              </div>
            </div>

            <div className="dashboard-sections-grid">
              <div className="glass-panel">
                <h3 className="panel-title">Master Category Overview</h3>
                <div className="category-overview-list">
                  {categories.map(cat => (
                    <div key={cat.categoryId} className="cat-overview-item">
                      <span>{cat.categoryName} Sarees</span>
                      <span className="bar-count">Active Category</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Customers */}
        {activeTab === 'customers' && (
          <div className="glass-panel">
            <h3 className="panel-title">Registered Customer Accounts ({customers.length})</h3>
            <p className="subtext" style={{ marginBottom: '1.5rem' }}>Management view for platform buyers and users.</p>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan="6" style={{ fontStyle: 'italic', textAlign: 'center' }}>No customer accounts registered yet.</td></tr>
                ) : (
                  customers.map(cust => (
                    <tr key={cust.userId}>
                      <td>#USR-{cust.userId}</td>
                      <td><strong>{cust.username}</strong></td>
                      <td>{cust.email}</td>
                      <td><span className="status-badge shipped">{cust.role}</span></td>
                      <td>
                        <span className={`status-badge ${(cust.isActive ?? true) ? 'delivered' : 'pending'}`}>
                          {(cust.isActive ?? true) ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-btns">
                          <button className="btn-approve" onClick={() => handleViewCustomerProfile(cust.userId)} title="View Full Customer Details">
                            <Eye size={14} /> Profile
                          </button>
                          <button className="btn-hero-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenEditUser(cust)}>
                            <Edit size={14} /> Edit
                          </button>
                          <button 
                            className={cust.isActive ?? true ? "btn-reject" : "btn-approve"} 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} 
                            onClick={() => handleToggleUserStatus(cust)}
                          >
                            {(cust.isActive ?? true) ? <UserX size={14} /> : <UserCheck size={14} />}
                            {(cust.isActive ?? true) ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Sellers */}
        {activeTab === 'sellers' && (
          <div className="glass-panel">
            <h3 className="panel-title">Partner Seller Boutiques ({sellers.length})</h3>
            <p className="subtext" style={{ marginBottom: '1.5rem' }}>Approved saree weavers and boutique accounts.</p>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Seller ID</th>
                  <th>Boutique Name</th>
                  <th>Contact Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.length === 0 ? (
                  <tr><td colSpan="6" style={{ fontStyle: 'italic', textAlign: 'center' }}>No seller accounts registered yet.</td></tr>
                ) : (
                  sellers.map(sel => (
                    <tr key={sel.userId}>
                      <td>#SEL-{sel.userId}</td>
                      <td><strong>{sel.username}</strong></td>
                      <td>{sel.email}</td>
                      <td><span className="status-badge shipped">{sel.role}</span></td>
                      <td>
                        <span className={`status-badge ${(sel.isActive ?? true) ? 'delivered' : 'pending'}`}>
                          {(sel.isActive ?? true) ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-btns">
                          <button className="btn-hero-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenEditUser(sel)}>
                            <Edit size={14} /> Edit
                          </button>
                          <button 
                            className={(sel.isActive ?? true) ? "btn-reject" : "btn-approve"} 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} 
                            onClick={() => handleToggleUserStatus(sel)}
                          >
                            {(sel.isActive ?? true) ? <UserX size={14} /> : <UserCheck size={14} />}
                            {(sel.isActive ?? true) ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Products Catalog (WORKSTREAM 1) */}
        {activeTab === 'products' && (
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="panel-title">Catalog Inventory ({products.length} Items)</h3>
                <p className="subtext">Add, edit, or soft-delete products from the live catalog.</p>
              </div>
              <button className="btn-gold" style={{ width: 'auto', padding: '0.55rem 1.2rem', gap: '0.4rem' }} onClick={handleOpenAddProduct}>
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => {
                    const imgUrl = prod.images && prod.images.length > 0 ? prod.images[0].imageUrl : '/brand_logo.png';
                    const active = prod.isActive ?? true;
                    return (
                      <tr key={prod.productId} style={{ opacity: active ? 1 : 0.55 }}>
                        <td>
                          <img src={imgUrl} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        </td>
                        <td>#{prod.productId}</td>
                        <td><strong>{prod.name}</strong></td>
                        <td>{prod.category?.categoryName || 'N/A'}</td>
                        <td>{prod.subcategory?.subcategoryName || 'N/A'}</td>
                        <td>₹{Number(prod.price).toLocaleString('en-IN')}</td>
                        <td><span className="status-badge shipped">{prod.stock} units</span></td>
                        <td>
                          <span className={`status-badge ${active ? 'delivered' : 'pending'}`}>
                            {active ? 'Active' : 'Soft Deleted'}
                          </span>
                        </td>
                        <td>
                          <div className="table-action-btns">
                            <button className="btn-hero-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleOpenEditProduct(prod)}>
                              <Edit size={14} /> Edit
                            </button>
                            {active && (
                              <button className="btn-reject" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setShowDeleteConfirm(prod)}>
                                <Trash2 size={14} /> Soft Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Categories */}
        {activeTab === 'categories' && (
          <div className="glass-panel">
            <h3 className="panel-title">Master Categories</h3>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Category ID</th>
                  <th>Category Name</th>
                  <th>Hosted Image URL</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.categoryId}>
                    <td>#{cat.categoryId}</td>
                    <td><strong>{cat.categoryName}</strong></td>
                    <td style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{cat.categoryimage || 'ImageKit Hosted'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 6: All Orders & OMS Management */}
        {activeTab === 'orders' && (
          <div className="glass-panel">
            <h3 className="panel-title">Platform Order Management ({allOrders.length})</h3>
            <p className="subtext" style={{ marginBottom: '1.5rem' }}>Advance order lifecycle, assign courier tracking details, and manage customer returns.</p>

            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Email</th>
                  <th>Total Amount</th>
                  <th>Payment Method</th>
                  <th>Courier / Tracking</th>
                  <th>Current Status</th>
                  <th>Update Progression</th>
                </tr>
              </thead>
              <tbody>
                {allOrders.length === 0 ? (
                  <tr><td colSpan="7" style={{ fontStyle: 'italic', textAlign: 'center' }}>No customer orders placed yet.</td></tr>
                ) : (
                  allOrders.map(ord => (
                    <tr key={ord.orderId}>
                      <td><strong>#{ord.orderId}</strong></td>
                      <td>{ord.user?.email || 'Customer'}</td>
                      <td>₹{Number(ord.totalAmount).toLocaleString('en-IN')}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(200,155,60,0.12)', color: 'var(--color-primary-hover)', fontWeight: '600', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {ord.paymentMethod} ({ord.paymentStatus})
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{ord.courierName || 'Express Logistics'}</span>
                          <div style={{ fontFamily: 'monospace', color: '#666' }}>{ord.trackingNumber || 'TRK-PENDING'}</div>
                          <button
                            onClick={async () => {
                              const courier = prompt("Enter Courier Name:", ord.courierName || "Express Logistics");
                              const trk = prompt("Enter Tracking Number:", ord.trackingNumber || ("TRK-" + Date.now()));
                              if (courier && trk) {
                                const res = await api.adminUpdateShipment(ord.orderId, courier, trk, "Regional Hub", ord.status);
                                if (res.ok) {
                                  setNotification({ msg: `Shipment updated for #${ord.orderId}`, type: 'success' });
                                  loadData();
                                }
                              }
                            }}
                            style={{ fontSize: '0.7rem', color: 'var(--color-primary-hover)', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginTop: '2px' }}
                          >
                            Edit Courier/Tracking
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className="status-badge shipped" style={{ fontSize: '0.8rem' }}>
                          {ord.status}
                        </span>
                      </td>
                      <td>
                        <select 
                          className="filter-input"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.82rem', width: 'auto', background: 'var(--bg-primary)' }}
                          value={ord.status}
                          onChange={(e) => handleStatusUpdate(ord.orderId, e.target.value)}
                        >
                          <option value="Order Placed">1. Order Placed</option>
                          <option value="Packed">2. Packed</option>
                          <option value="In Transit">3. In Transit</option>
                          <option value="Out for Delivery">4. Out for Delivery</option>
                          <option value="Delivered">5. Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 7: Reports (WORKSTREAM 3) */}
        {activeTab === 'reports' && (
          <div className="glass-panel">
            <h3 className="panel-title">Revenue & Sales Analytics Reports</h3>
            <p className="subtext" style={{ marginBottom: '1.5rem' }}>View date-selectable revenue reports breakdown (excl. Cancelled orders).</p>

            {/* Period Selector & Date Picker Controls */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <button 
                  style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: reportPeriod === 'daily' ? 'var(--color-primary)' : 'transparent', color: reportPeriod === 'daily' ? '#fff' : 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem' }}
                  onClick={() => setReportPeriod('daily')}
                >
                  Daily
                </button>
                <button 
                  style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: reportPeriod === 'monthly' ? 'var(--color-primary)' : 'transparent', color: reportPeriod === 'monthly' ? '#fff' : 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem' }}
                  onClick={() => setReportPeriod('monthly')}
                >
                  Monthly
                </button>
                <button 
                  style={{ padding: '0.4rem 1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', background: reportPeriod === 'yearly' ? 'var(--color-primary)' : 'transparent', color: reportPeriod === 'yearly' ? '#fff' : 'var(--text-primary)', fontWeight: '600', fontSize: '0.85rem' }}
                  onClick={() => setReportPeriod('yearly')}
                >
                  Yearly
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--color-primary)" />
                <input 
                  type="date" 
                  value={reportDate} 
                  onChange={(e) => setReportDate(e.target.value)} 
                  className="filter-input"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.88rem' }}
                />
              </div>

              <button className="btn-hero-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', width: 'auto' }} onClick={loadRevenueReport}>
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* KPI Summary Cards */}
            {revenueData && (
              <>
                <div className="stat-cards-grid" style={{ marginBottom: '2rem' }}>
                  <div className="stat-card">
                    <div className="stat-icon-box orange-box"><DollarSign size={22} /></div>
                    <div>
                      <span className="stat-label">Total Period Revenue</span>
                      <h3 className="stat-number">₹{Number(revenueData.totalRevenue || 0).toLocaleString('en-IN')}</h3>
                      <span className="stat-trend positive">{reportPeriod.toUpperCase()} View</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-box green-box"><ShoppingBag size={22} /></div>
                    <div>
                      <span className="stat-label">Total Orders</span>
                      <h3 className="stat-number">{revenueData.totalOrders}</h3>
                      <span className="stat-trend positive">Valid Completed Purchases</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon-box gold-box"><BarChart3 size={22} /></div>
                    <div>
                      <span className="stat-label">Avg Order Value (AOV)</span>
                      <h3 className="stat-number">₹{Number(revenueData.averageOrderValue || 0).toLocaleString('en-IN')}</h3>
                      <span className="stat-trend positive">Revenue / Orders</span>
                    </div>
                  </div>
                </div>

                {/* Breakdown SVG/CSS Bar Chart */}
                <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '1rem' }}>
                  Revenue Breakdown ({revenueData.selectedDate})
                </h4>

                <div style={{ background: '#FAF7F2', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
                    {revenueData.breakdown && revenueData.breakdown.map((item, idx) => {
                      const maxRev = Math.max(...revenueData.breakdown.map(b => Number(b.revenue || 0)), 100);
                      const heightPct = Math.max((Number(item.revenue || 0) / maxRev) * 100, 4);
                      return (
                        <div key={idx} style={{ flex: 1, minWidth: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div 
                            title={`${item.label}: ₹${Number(item.revenue).toLocaleString('en-IN')} (${item.orders} orders)`}
                            style={{ 
                              width: '100%', 
                              maxWidth: '30px',
                              height: `${heightPct}%`, 
                              background: Number(item.revenue) > 0 ? 'linear-gradient(180deg, #D4AF37 0%, #70161E 100%)' : 'rgba(0,0,0,0.08)', 
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.3s ease'
                            }}
                          />
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.4rem', transform: 'rotate(-30deg)', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 8: Settings */}
        {activeTab === 'settings' && (
          <div className="glass-panel">
            <h3 className="panel-title">Platform System Settings</h3>
            <p className="subtext">Configure global platform configurations and preferences.</p>
          </div>
        )}
      </main>

      {/* ================= MODALS ================= */}

      {/* Product Add/Edit Modal (WORKSTREAM 1) */}
      {showProductModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', padding: '2rem', borderRadius: '14px', maxWidth: '540px', width: '90%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '1.2rem' }}>
              {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
            </h3>

            <form onSubmit={handleSaveProduct} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Product Name *</label>
                <input type="text" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} required className="form-input" />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Price (₹) *</label>
                  <input type="number" step="0.01" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} required className="form-input" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Stock Units *</label>
                  <input type="number" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} required className="form-input" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Category *</label>
                  <select 
                    value={prodForm.categoryId} 
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      const subs = subcategories.filter(s => s.categoryId === Number(newCatId));
                      setProdForm({ 
                        ...prodForm, 
                        categoryId: newCatId, 
                        subcategoryId: subs.length > 0 ? subs[0].subcategoryId : '' 
                      });
                    }} 
                    className="form-select"
                  >
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Subcategory *</label>
                  <select 
                    value={prodForm.subcategoryId} 
                    onChange={(e) => setProdForm({ ...prodForm, subcategoryId: e.target.value })} 
                    className="form-select"
                  >
                    {availableSubcategories.map(s => <option key={s.subcategoryId} value={s.subcategoryId}>{s.subcategoryName}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Image URL (ImageKit / Hosted)</label>
                <input type="url" placeholder="https://ik.imagekit.io/..." value={prodForm.imageUrl} onChange={(e) => setProdForm({ ...prodForm, imageUrl: e.target.value })} className="form-input" />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Description</label>
                <textarea rows="3" value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} className="form-input" />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
                <button type="button" className="btn-hero-secondary" style={{ width: 'auto' }} onClick={() => setShowProductModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', padding: '2rem', borderRadius: '14px', maxWidth: '420px', width: '90%', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--error)', marginBottom: '0.8rem' }}>Soft Delete Product?</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Are you sure you want to soft-delete <strong>"{showDeleteConfirm.name}"</strong>? It will be hidden from customer store APIs, but past order records will remain safe and intact.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-reject" style={{ flex: 1 }} onClick={() => handleSoftDeleteProduct(showDeleteConfirm.productId)}>
                Yes, Soft Delete
              </button>
              <button className="btn-hero-secondary" style={{ width: 'auto' }} onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal (WORKSTREAM 2) */}
      {showUserModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', padding: '2rem', borderRadius: '14px', maxWidth: '460px', width: '90%', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '1.2rem' }}>
              Edit User Profile (#USR-{editingUser?.userId})
            </h3>

            <form onSubmit={handleSaveUser} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Username</label>
                <input type="text" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} required className="form-input" />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required className="form-input" />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Platform Role</label>
                <select value={userForm.role} onChange={(e) => { setUserForm({ ...userForm, role: e.target.value }); setRoleChangeConfirm(false); }} className="form-select">
                  <option value="USER">USER (Buyer)</option>
                  <option value="SELLER">SELLER (Boutique Partner)</option>
                  <option value="ADMIN">ADMIN (Superadmin)</option>
                </select>
              </div>

              {roleChangeConfirm && (
                <div style={{ background: 'rgba(239,68,68,0.1)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.82rem', color: '#b91c1c' }}>
                  <strong>⚠️ Warning: Role Escalation Action</strong><br />
                  Changing role to <strong>{userForm.role}</strong> grants elevated permissions. Click "Confirm & Save" to proceed.
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  {roleChangeConfirm ? 'Confirm & Save' : 'Save Changes'}
                </button>
                <button type="button" className="btn-hero-secondary" style={{ width: 'auto' }} onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Full Profile Modal (WORKSTREAM 4) */}
      {selectedCustomerProfile && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFF', padding: '2rem', borderRadius: '14px', maxWidth: '680px', width: '92%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)' }}>
                Full Customer Profile — {selectedCustomerProfile.username}
              </h3>
              <button style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => setSelectedCustomerProfile(null)}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: '#FAF7F2', padding: '1.2rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
              <div><span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Email:</span><br /><strong>{selectedCustomerProfile.email}</strong></div>
              <div><span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Lifetime Spend:</span><br /><strong style={{ color: 'var(--color-primary-hover)' }}>₹{Number(selectedCustomerProfile.lifetimeSpend || 0).toLocaleString('en-IN')}</strong></div>
              <div><span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Total Orders:</span><br /><strong>{selectedCustomerProfile.totalOrdersCount} Orders</strong></div>
              <div><span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Account Status:</span><br /><strong style={{ color: selectedCustomerProfile.isActive ? 'green' : 'red' }}>{selectedCustomerProfile.isActive ? 'Active' : 'Deactivated'}</strong></div>
            </div>

            {/* Saved Addresses List */}
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '0.6rem' }}>
              Saved Delivery Addresses ({selectedCustomerProfile.addresses?.length || 0})
            </h4>
            <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {selectedCustomerProfile.addresses?.length === 0 ? (
                <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>No saved addresses.</p>
              ) : (
                selectedCustomerProfile.addresses?.map(a => (
                  <div key={a.addressId} style={{ background: '#FFF', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <strong>{a.fullName} ({a.addressType})</strong> • {a.phone}<br />
                    {a.addressLine1}, {a.addressLine2 ? `${a.addressLine2}, ` : ''}{a.city}, {a.state} - {a.pincode}
                  </div>
                ))
              )}
            </div>

            {/* Order History */}
            <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-accent)', marginBottom: '0.6rem' }}>
              Customer Order History ({selectedCustomerProfile.orders?.length || 0})
            </h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <table className="dashboard-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCustomerProfile.orders?.map(o => (
                    <tr key={o.orderId}>
                      <td>#{o.orderId}</td>
                      <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>₹{Number(o.totalAmount).toLocaleString('en-IN')}</td>
                      <td>{o.paymentMethod}</td>
                      <td><span className="status-badge shipped" style={{ fontSize: '0.75rem' }}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn-gold" style={{ width: 'auto', padding: '0.5rem 1.5rem' }} onClick={() => setSelectedCustomerProfile(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
