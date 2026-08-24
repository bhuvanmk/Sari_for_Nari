import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, ShoppingBag, Heart, User, LogOut, ChevronDown, Menu, X, Store, ShieldCheck
} from 'lucide-react';
import ScrollProgressBar from './ScrollProgressBar';
import { api } from '../services/api';

export default function Navbar({ cartCount = 0, wishlistCount = 0, onCartClick, onWishlistClick }) {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setUser(api.getUser());
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setCategoryMenuOpen(false);
    setMobileMenuOpen(false);
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const handleSubcategoryClick = (categoryName, subcategoryName) => {
    setCategoryMenuOpen(false);
    setMobileMenuOpen(false);
    navigate(`/products?category=${encodeURIComponent(categoryName)}&subcategory=${encodeURIComponent(subcategoryName)}`);
  };


  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    navigate('/login');
  };

  // Standardized Main 4 Categories with nested subcategories
  const mainCategoryList = [
    { name: 'Casual', subcats: ['Georgette', 'Linen', 'Printed', 'Cotton'] },
    { name: 'Traditional', subcats: ['Chanderi', 'Paithani', 'Banarasi', 'Kanjivaram'] },
    { name: 'Party', subcats: ['Ruffle', 'Satin', 'Net', 'Sequin'] },
    { name: 'Wedding', subcats: ['Designer Bridal', 'Embroidered', 'Zari Work', 'Bridal Silk'] },
  ];

  return (
    <>
      <ScrollProgressBar />
      <header className={`customer-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="top-announcement-bar">
        <span>✨ Grand Festive Offer: Pure Handloom Silk Sarees — Free Pan-India Express Shipping Above ₹2,999! ✨</span>
      </div>

      <div className="nav-container">
        {/* Brand Logo */}
        <div className="nav-logo-area" onClick={() => navigate('/')}>
          <img src="/brand_logo.png" alt="Sarees For Naaris Logo" className="nav-brand-logo" />
          <div className="brand-text-group">
            <span className="brand-main-title">SAREES FOR NAARIS</span>
            <span className="brand-sub-tag">Pure Handloom Elegance</span>
          </div>
        </div>

        {/* Search Bar */}
        <form className="nav-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search Banarasi, Kanjivaram, Chanderi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
          />
          <button type="submit" className="nav-search-btn">
            <Search size={18} />
          </button>
        </form>

        {/* Mobile Hamburger Toggle */}
        <button className="mobile-hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links & Actions */}
        <nav className={`nav-actions ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Home Section Links */}
          <button className="nav-link-btn" onClick={() => navigate('/')}>Home</button>

          {/* Categories Mega Dropdown */}
          <div 
            className="nav-dropdown-wrapper"
            onMouseEnter={() => setCategoryMenuOpen(true)}
            onMouseLeave={() => setCategoryMenuOpen(false)}
          >
            <button 
              className="nav-action-btn"
              onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
            >
              Category <ChevronDown size={14} />
            </button>

            {categoryMenuOpen && (
              <div className="mega-menu-dropdown">
                {mainCategoryList.map((cat) => (
                  <div key={cat.name} className="mega-menu-column">
                    <h4 
                      className="mega-menu-heading"
                      onClick={() => handleCategoryClick(cat.name)}
                    >
                      {cat.name} Sarees
                    </h4>
                    <ul className="mega-menu-list">
                      {cat.subcats.map((sub) => (
                        <li 
                          key={sub}
                          onClick={() => handleSubcategoryClick(cat.name, sub)}
                        >
                          {sub}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="nav-link-btn" onClick={() => navigate('/about')}>About Us</button>
          <button className="nav-link-btn" onClick={() => navigate('/contact')}>Contact Us</button>

          {user && user.role === 'SELLER' && (
            <button className="nav-link-btn seller-nav-highlight" onClick={() => navigate('/seller/dashboard')}>
              <Store size={15} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Seller Portal
            </button>
          )}

          {/* Wishlist Button */}
          <button className="nav-icon-btn" onClick={onWishlistClick || (() => navigate('/wishlist'))}>
            <Heart size={20} />
            {wishlistCount > 0 && <span className="badge-count">{wishlistCount}</span>}
          </button>

          {/* Cart Button */}
          <button className="nav-icon-btn" onClick={onCartClick || (() => navigate('/cart'))}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
          </button>

          {/* Profile Dropdown */}
          {user ? (
            <div className="nav-dropdown-wrapper">
              <button 
                className="nav-action-btn profile-btn"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <User size={18} />
                <span>{user.username}</span>
                <ChevronDown size={14} />
              </button>

              {profileMenuOpen && (
                <div className="dropdown-menu profile-menu">
                  <div className="profile-info-header">
                    <p className="profile-name">{user.username}</p>
                    <p className="profile-email">{user.email}</p>
                    <span className="profile-role-pill">{user.role}</span>
                  </div>
                  <hr className="dropdown-divider" />
                  {user.role === 'SELLER' && (
                    <>
                      <Link to="/seller/dashboard" className="dropdown-item seller-menu-item">
                        <Store size={16} /> Seller Portal
                      </Link>
                      <Link to="/seller/products" className="dropdown-item">My Products</Link>
                      <Link to="/seller/orders" className="dropdown-item">Seller Orders & Invoices</Link>
                      <hr className="dropdown-divider" />
                    </>
                  )}
                  {user.role === 'ADMIN' && (
                    <>
                      <Link to="/admin/dashboard" className="dropdown-item admin-menu-item">
                        <ShieldCheck size={16} /> Admin Panel
                      </Link>
                      <hr className="dropdown-divider" />
                    </>
                  )}
                  <Link to="/profile" className="dropdown-item">My Profile</Link>
                  <Link to="/orders" className="dropdown-item">My Orders</Link>
                  <Link to="/wishlist" className="dropdown-item">Wishlist</Link>
                  <div className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-nav-login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  </>
);
}
