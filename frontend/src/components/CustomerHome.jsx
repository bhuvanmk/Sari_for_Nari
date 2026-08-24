import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Shield, Truck, RefreshCw, ArrowRight, CheckCircle, Star, Heart,
  Headphones, Award, Layers, Sparkle, Tag, Mail, ShoppingBag
} from 'lucide-react';
import Navbar from './Navbar';
import ProductCard from './ProductCard';
import Toast from './Toast';
import AnimatedCounter from './AnimatedCounter';
import { api } from '../services/api';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function CustomerHome() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [activeTrendTab, setActiveTrendTab] = useState('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();
  const containerRef = useScrollReveal();

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadWishlistAndCart();
  }, []);

  const loadCategories = async () => {
    const res = await api.getCategories();
    if (res.ok) setCategories(res.data);
  };

  const loadProducts = async () => {
    const res = await api.getProducts();
    if (res.ok) setProducts(res.data);
  };

  const loadWishlistAndCart = async () => {
    if (api.isAuthenticated()) {
      const wishRes = await api.getWishlist();
      if (wishRes.ok && Array.isArray(wishRes.data)) {
        setWishlistIds(new Set(wishRes.data.map(item => item.product.productId)));
      }
      const cartRes = await api.getCartCount();
      if (cartRes.ok && cartRes.data) {
        setCartCount(cartRes.data.cartCount || 0);
      }
    }
  };

  const handleAddToCart = async (product) => {
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'ADD_TO_CART',
        productId: product.productId,
        quantity: 1
      }));
      navigate('/login');
      return;
    }

    const res = await api.addToCart(product.productId, 1);
    if (res.ok) {
      setCartCount(prev => prev + 1);
      showNotification(`"${product.name}" added to cart!`);
    } else {
      showNotification('Failed to add item to cart.', 'error');
    }
  };

  const handleBuyNow = async (product) => {
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'BUY_NOW',
        productId: product.productId,
        quantity: 1
      }));
      navigate('/login');
      return;
    }

    const res = await api.addToCart(product.productId, 1);
    if (res.ok) {
      navigate('/checkout');
    } else {
      showNotification('Could not proceed to checkout.', 'error');
    }
  };

  const handleToggleWishlist = async (product) => {
    if (!api.isAuthenticated()) {
      sessionStorage.setItem('pendingGuestAction', JSON.stringify({
        type: 'ADD_TO_WISHLIST',
        productId: product.productId
      }));
      navigate('/login');
      return;
    }

    if (wishlistIds.has(product.productId)) {
      const res = await api.removeFromWishlist(product.productId);
      if (res.ok) {
        setWishlistIds(prev => {
          const updated = new Set(prev);
          updated.delete(product.productId);
          return updated;
        });
        showNotification(`Removed "${product.name}" from Wishlist`);
      }
    } else {
      const res = await api.addToWishlist(product.productId);
      if (res.ok) {
        setWishlistIds(prev => new Set(prev).add(product.productId));
        showNotification(`Added "${product.name}" to Wishlist!`);
      }
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    // TODO: Connect to real backend newsletter subscription API endpoint once implemented in Spring Boot
    showNotification('Thank you for subscribing to Sarees For Naaris Insider!');
    setNewsletterEmail('');
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredTrendProducts = products.filter(p => {
    if (activeTrendTab === 'All') return true;

    const catName = (p.category?.categoryName || '').toLowerCase();
    const prodName = (p.name || '').toLowerCase();
    const subCat = (p.subCategory || '').toLowerCase();
    const target = activeTrendTab.toLowerCase();

    if (target.includes('party')) {
      return catName.includes('party') || prodName.includes('party') || subCat.includes('party') || prodName.includes('organza') || prodName.includes('tissue');
    }
    if (target.includes('traditional')) {
      return catName.includes('traditional') || prodName.includes('traditional') || prodName.includes('banarasi') || prodName.includes('kanjivaram') || prodName.includes('paithani');
    }
    if (target.includes('casual')) {
      return catName.includes('casual') || prodName.includes('casual') || prodName.includes('chanderi') || prodName.includes('linen') || prodName.includes('cotton');
    }
    if (target.includes('wedding')) {
      return catName.includes('marriages') || catName.includes('wedding') || prodName.includes('wedding') || prodName.includes('bridal') || prodName.includes('zari');
    }

    return catName.includes(target) || prodName.includes(target);
  });

  return (
    <div className="customer-home-wrapper page-fade-in" ref={containerRef}>
      <Navbar cartCount={cartCount} wishlistCount={wishlistIds.size} />

      {/* Toast Notification */}
      <Toast notification={notification} onClose={() => setNotification(null)} />

      {/* SECTION 1: HERO BANNER WITH METRICS & FEATURED WEAVE */}
      <section className="home-hero-section reveal-fade-up" style={{ background: 'linear-gradient(135deg, #FAF8F5 0%, #FFFDF9 50%, #F5EFE6 100%)', padding: '3.5rem 2rem 4rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(200, 155, 60, 0.12)', color: 'var(--color-primary-hover)', padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.2rem', border: '1px solid rgba(200,155,60,0.3)' }}>
              <Sparkles size={16} /> Sai Pallavi Signature Handloom Collection 2026
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '1.2rem', fontWeight: 700 }}>
              Empowering Every Naari <br />
              <span style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>Towards Pure Elegance</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '540px' }}>
              Discover certified authentic Banarasi, Kanjivaram, and Paithani handloom sarees directly from master artisan clusters across Varanasi, Kanchipuram & Yeola.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button className="btn-gold" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }} onClick={() => navigate('/products')}>
                Shop All Collections <ArrowRight size={18} />
              </button>
              <button className="btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }} onClick={() => navigate('/about')}>
                Our Weaver Heritage
              </button>
            </div>

            {/* Metrics Counters with AnimatedCounter */}
            <div style={{ display: 'flex', gap: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  <AnimatedCounter end={1000} suffix="+" />
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Master Weavers</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  <AnimatedCounter end={15} suffix="+" />
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Artisan Clusters</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.8rem', color: 'var(--color-accent)', fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                  <AnimatedCounter end={50000} suffix="+" />
                </strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Happy Naaris</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card with Levitating Showcase & Floating Badges */}
          <div className="hero-showcase-container">
            <div 
              style={{ 
                borderRadius: '28px', 
                overflow: 'hidden', 
                border: '2px solid rgba(212, 175, 55, 0.45)', 
                height: '480px', 
                background: '#FFFFFF',
                position: 'relative'
              }}
              className="hero-img-card"
            >
              <img 
                src="/hero_banner_8k.jpg" 
                alt="Sai Pallavi Signature White & Gold Silk Saree" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  objectPosition: 'center 15%',
                  transition: 'transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1)' 
                }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(18, 3, 6, 0.45) 0%, transparent 60%)' }} />
            </div>

            {/* Top-Right Floating Badge */}
            <div className="hero-floating-badge-top" style={{ position: 'absolute', top: '20px', right: '-15px', background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(12px)', padding: '0.65rem 1.2rem', borderRadius: '30px', border: '1px solid rgba(212, 175, 55, 0.6)', boxShadow: '0 12px 30px rgba(123, 30, 58, 0.18)', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 3 }}>
              <Sparkles size={16} color="#D4AF37" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7B1E3A', letterSpacing: '0.3px' }}>Royal Zari Weave</span>
            </div>

            {/* Floating Product Badge Overlay (Bottom Left) */}
            <div className="hero-floating-badge-bottom" style={{ position: 'absolute', bottom: '-18px', left: '-20px', background: '#FFFFFF', padding: '1rem 1.4rem', borderRadius: '20px', border: '1px solid rgba(200, 155, 60, 0.35)', boxShadow: '0 20px 45px rgba(45,36,20,0.22)', display: 'flex', alignItems: 'center', gap: '1rem', maxWidth: '340px', zIndex: 3 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(200, 155, 60, 0.35)' }}>
                <Award size={26} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                  <h4 style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>100% Silk Mark Certified</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.15rem' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="#D4AF37" color="#D4AF37" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Authentic Pure Mulberry & Zari</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST & VALUE HIGHLIGHTS RIBBON BAR */}
      <section className="reveal-fade-up" style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '1.2rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Shield size={24} color="var(--color-primary)" />
            <div>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>Silk Mark Certified</h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>Guaranteed Pure Handloom</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Truck size={24} color="var(--color-primary)" />
            <div>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>Pan-India Free Express</h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>On All Orders Above ₹2,999</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <RefreshCw size={24} color="var(--color-primary)" />
            <div>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>Easy 7-Day Returns</h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>Hassle-Free Exchange Policy</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Headphones size={24} color="var(--color-primary)" />
            <div>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>Weaving Experts 24/7</h4>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>Dedicated Customer Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: SHOP BY CATEGORY */}
      <section style={{ padding: '4rem 2rem', background: '#FFFDF9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="reveal-fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
              Shop By Category
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Explore handloom sarees sorted by authentic Indian craft techniques
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.5rem' }}>
            {[
              { id: 1, name: 'Traditional Wear', filter: 'traditional', count: '120+ Styles', img: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/traditional.jpg?updatedAt=1785166625181' },
              { id: 2, name: 'Wedding', filter: 'marriages', count: '85+ Weaves', img: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/marriages.jpeg?updatedAt=1785166624793' },
              { id: 3, name: 'Casual Wear', filter: 'casual', count: '60+ Breezy Weaves', img: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/casual.jpg?updatedAt=1785166625193' },
              { id: 4, name: 'Party Wear', filter: 'party', count: '45+ Designs', img: 'https://ik.imagekit.io/ceqkvm9eg/Sarees%20for%20Naries/category/party.webp?updatedAt=1785166624926' },
              { id: 5, name: 'Organza & Tissue', filter: 'organza', count: '40+ Soiree Weaves', img: '/organza_tissue_cat.jpg' },
            ].map((cat) => (
              <div 
                key={cat.id} 
                className="category-card reveal-stagger-item"
                onClick={() => navigate(`/products?search=${encodeURIComponent(cat.filter)}`)}
                style={{ background: '#FFFFFF', borderRadius: '18px', border: '1px solid var(--border-color)', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}
              >
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="cat-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 15%', transition: 'transform 0.5s ease' }} 
                  />
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: '#FFF', fontSize: '0.72rem', padding: '0.3rem 0.7rem', borderRadius: '12px', fontWeight: 600 }}>
                    {cat.count}
                  </span>
                </div>
                <div style={{ padding: '1.1rem', textAlign: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.3rem 0', fontWeight: 600 }}>{cat.name}</h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-primary-hover)', fontWeight: 600 }}>View Collection →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURED PRODUCTS GRID */}
      <section style={{ padding: '4rem 2rem', background: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="reveal-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
                Featured Handloomed Sarees
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                Handcrafted masterpieces curated by our weaving experts
              </p>
            </div>
            <button 
              className="btn-secondary" 
              style={{ 
                padding: '0.45rem 1rem', 
                fontSize: '0.82rem', 
                borderRadius: '20px', 
                border: '1px solid var(--color-primary)', 
                color: 'var(--color-primary-hover)',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginLeft: 'auto'
              }} 
              onClick={() => navigate('/products')}
            >
              View All ({products.length}) <ArrowRight size={14} />
            </button>
          </div>

          <div className="products-grid">
            {products.slice(0, 8).map((product) => (
              <div key={product.productId} className="reveal-stagger-item">
                <ProductCard 
                  product={product}
                  isWishlisted={wishlistIds.has(product.productId)}
                  onWishlistToggle={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: SHOP BY OCCASION / NEED */}
      <section style={{ padding: '4rem 2rem', background: '#FAF8F5', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="reveal-fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
              Shop By Occasion
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Find the perfect weave tailored for your special celebrations
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { title: 'Bridal Trousseau', desc: 'Heavy Zari Silk Sarees for Weddings', tag: 'Royal Collection', icon: Sparkle },
              { title: 'Festive Celebrations', desc: 'Vibrant Colors for Puja & Diwali', tag: 'Festive Wear', icon: Tag },
              { title: 'Partywear & Soirees', desc: 'Sheer Tissue & Organza Elegance', tag: 'Modern Glam', icon: Layers },
              { title: 'Daily Heritage Wear', desc: 'Soft Breathable Cottons & Linens', tag: 'Lightweight', icon: Heart },
            ].map((occ, idx) => {
              const IconComp = occ.icon;
              return (
                <div 
                  key={idx} 
                  className="reveal-stagger-item"
                  style={{ background: '#FFFFFF', padding: '1.8rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.3s ease' }}
                  onClick={() => navigate(`/products?search=${encodeURIComponent(occ.title.split(' ')[0])}`)}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(200, 155, 60, 0.12)', color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <IconComp size={24} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{occ.tag}</span>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0.4rem 0 0.4rem 0', fontWeight: 600 }}>{occ.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{occ.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 6: NEW ARRIVALS SHOWCASE */}
      <section style={{ padding: '4rem 2rem', background: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="reveal-fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ background: 'rgba(123, 30, 58, 0.1)', color: 'var(--color-accent)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Fresh From Looms
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', marginTop: '0.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
              New Handloom Releases
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Freshly woven sarees just added to our artisan inventory
            </p>
          </div>

          <div className="products-grid">
            {products.slice(0, 4).map((product) => (
              <div key={`new-${product.productId}`} className="reveal-stagger-item">
                <ProductCard 
                  product={product}
                  isWishlisted={wishlistIds.has(product.productId)}
                  onWishlistToggle={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: WHY CHOOSE SAREES FOR NAARIS */}
      <section style={{ padding: '4rem 2rem', background: '#FFFDF9', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="reveal-fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
              Why Choose Sarees For Naaris
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Our commitment to handloom authenticity and fair artisan trade
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div className="reveal-stagger-item" style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(200, 155, 60, 0.12)', color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <Award size={28} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>100% Pure Silk Mark</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Every saree is certified with genuine Silk Mark authentication tags guaranteeing pure silk quality.</p>
            </div>

            <div className="reveal-stagger-item" style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(200, 155, 60, 0.12)', color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <Shield size={28} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>Direct Weaver Sourcing</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>We eliminate middlemen, ensuring 100% fair wages directly empower weaver households across India.</p>
            </div>

            <div className="reveal-stagger-item" style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(200, 155, 60, 0.12)', color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <Truck size={28} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>Insured Express Delivery</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Fast, insured transit with real-time stage tracking ensures your saree arrives safely at your doorstep.</p>
            </div>

            <div className="reveal-stagger-item" style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(200, 155, 60, 0.12)', color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <RefreshCw size={28} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>Hassle-Free 7-Day Returns</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Complete buyer protection with quick returns or exchanges if you are not 100% delighted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: POPULAR TRENDS (LOGGED-IN) OR BRAND MARQUEE STRIP (GUEST) */}
      {api.isAuthenticated() ? (
        <section style={{ padding: '4rem 2rem', background: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
                Popular Trends
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Explore top trending weaves and occasion collections loved by saree connoisseurs
              </p>

              {/* Filter Tabs for Logged In User */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                {['All', 'Party Wear', 'Traditional Wear', 'Casual Wear', 'Wedding Wear'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTrendTab(tab)}
                    style={{
                      padding: '0.55rem 1.5rem',
                      borderRadius: '25px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      background: activeTrendTab === tab ? 'var(--color-accent)' : '#FAF8F5',
                      color: activeTrendTab === tab ? '#FFFFFF' : 'var(--text-primary)',
                      border: activeTrendTab === tab ? '1px solid var(--color-accent)' : '1px solid var(--border-color)',
                      boxShadow: activeTrendTab === tab ? '0 4px 14px rgba(123, 30, 58, 0.25)' : 'none'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="products-grid">
              {filteredTrendProducts.slice(0, 8).map((product) => (
                <ProductCard 
                  key={`trend-${product.productId}`}
                  product={product}
                  isWishlisted={wishlistIds.has(product.productId)}
                  onWishlistToggle={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* Guest View: Left-to-Right Scrolling Brand Strip */
        <div className="brand-strip-wrapper" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: '#FAF8F5', padding: '2rem 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Authentic Indian Handloom Crafts
            </span>
          </div>
          <div className="brand-strip-track">
            <div className="brand-strip-content">
              {['Banarasi Silk', 'Paithani Weaves', 'Kanjivaram Guild', 'Chanderi Artisans', 'Organza & Tissue', 'Bandhani Craft', 'Tussar Heritage', 'Patola Silks', 'Maheshwari Handloom'].map((name, index) => (
                <div key={index} className="brand-strip-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/products?search=${encodeURIComponent(name.split(' ')[0])}`)}>
                  <span className="brand-strip-text" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-accent)' }}>{name}</span>
                  <span className="brand-strip-separator" style={{ color: 'var(--color-primary)' }}>◆</span>
                </div>
              ))}
            </div>
            {/* Seamless marquee loop duplicate */}
            <div className="brand-strip-content" aria-hidden="true">
              {['Banarasi Silk', 'Paithani Weaves', 'Kanjivaram Guild', 'Chanderi Artisans', 'Organza & Tissue', 'Bandhani Craft', 'Tussar Heritage', 'Patola Silks', 'Maheshwari Handloom'].map((name, index) => (
                <div key={`dup-${index}`} className="brand-strip-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/products?search=${encodeURIComponent(name.split(' ')[0])}`)}>
                  <span className="brand-strip-text" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-accent)' }}>{name}</span>
                  <span className="brand-strip-separator" style={{ color: 'var(--color-primary)' }}>◆</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 9: CUSTOMER REVIEWS & TESTIMONIALS CAROUSEL */}
      <section style={{ padding: '4rem 2rem', background: '#FAF8F5', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
              What Our Naaris Say
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Real stories from women who cherish authentic handloom heritage
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { quote: "The zari weave on my Banarasi saree was breathtaking! Genuine silk mark tag gave complete peace of mind.", author: "Ananya Sharma", location: "Mumbai", rating: 5 },
              { quote: "Express shipping delivered my wedding saree in just 2 days. Exemplary service and pristine packaging.", author: "Priyadarshini R.", location: "Chennai", rating: 5 },
              { quote: "The featherlight Chanderi saree is my go-to for summer festivities. True handloom quality!", author: "Sneha K.", location: "Pune", rating: 5 }
            ].map((rev, idx) => (
              <div key={idx} style={{ background: '#FFFFFF', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#D4AF37" color="#D4AF37" />
                  ))}
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: '1.2rem' }}>
                  "{rev.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #9b2c4e)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                    {rev.author[0]}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>{rev.author}</h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Verified Buyer ({rev.location})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: INSIDER NEWSLETTER SUBSCRIPTION BANNER */}
      <section style={{ padding: '4rem 2rem', background: '#FFFFFF' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: 'linear-gradient(135deg, #FAF8F5 0%, #FFFDF9 100%)', borderRadius: '24px', border: '1px solid var(--color-primary)', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: '0 12px 40px rgba(200,155,60,0.15)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(200, 155, 60, 0.15)', color: 'var(--color-primary-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
            <Mail size={28} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.6rem', fontWeight: 700 }}>
            Stay Updated With Handloom Heritage
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto 2rem auto' }}>
            Subscribe to receive exclusive weaver collection drops, festive discount codes, and saree care guides.
          </p>

          <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '500px', margin: '0 auto' }}>
            <input 
              type="email"
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="filter-input"
              style={{ flex: 1, minWidth: '260px', padding: '0.85rem 1.2rem', borderRadius: '10px', background: '#FFFFFF', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
            />
            <button type="submit" className="btn-gold" style={{ padding: '0.85rem 1.8rem', borderRadius: '10px' }}>
              Subscribe <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="customer-footer">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <img src="/brand_logo.png" alt="Sarees For Naaris Logo" className="footer-logo" />
            <h3 className="footer-brand-title">SAREES FOR NAARIS</h3>
            <p className="footer-desc">Celebrating Indian heritage and empowering women through authentic handloomed saree weaves.</p>
          </div>

          <div className="footer-col">
            <h4>Shop Categories</h4>
            <ul>
              <li onClick={() => navigate('/products?category=Traditional&subcategory=Banarasi')} style={{ cursor: 'pointer' }}>Banarasi Sarees</li>
              <li onClick={() => navigate('/products?category=Traditional&subcategory=Kanjivaram')} style={{ cursor: 'pointer' }}>Kanjivaram Silk</li>
              <li onClick={() => navigate('/products?category=Traditional&subcategory=Chanderi')} style={{ cursor: 'pointer' }}>Chanderi Weaves</li>
              <li onClick={() => navigate('/products?category=Traditional&subcategory=Paithani')} style={{ cursor: 'pointer' }}>Paithani Silks</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Customer Care</h4>
            <ul>
              <li onClick={() => navigate('/contact')} style={{ cursor: 'pointer' }}>Contact Us</li>
              <li onClick={() => navigate('/shipping-policy')} style={{ cursor: 'pointer' }}>Shipping Policy</li>
              <li onClick={() => navigate('/shipping-policy')} style={{ cursor: 'pointer' }}>Returns & Exchanges</li>
              <li onClick={() => navigate('/about')} style={{ cursor: 'pointer' }}>Silk Mark Guarantee</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li onClick={() => navigate('/about')} style={{ cursor: 'pointer' }}>About Us</li>
              <li onClick={() => navigate('/about')} style={{ cursor: 'pointer' }}>Weaver Stories</li>
              <li onClick={() => navigate('/terms')} style={{ cursor: 'pointer' }}>Terms of Service</li>
              <li onClick={() => navigate('/privacy-policy')} style={{ cursor: 'pointer' }}>Privacy Policy</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Sarees For Naaris. All rights reserved. Built with ❤ for Indian Naaris.</p>
        </div>
      </footer>
    </div>
  );
}
