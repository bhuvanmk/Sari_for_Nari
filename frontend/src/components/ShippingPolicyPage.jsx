import React from 'react';
import { Truck, Clock, RefreshCw, Sparkles } from 'lucide-react';
import Navbar from './Navbar';

export default function ShippingPolicyPage() {
  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem 4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--color-primary-hover)', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} /> Pan-India & Worldwide Express Delivery
          </span>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.8rem', color: 'var(--color-accent)', marginTop: '0.5rem', marginBottom: '1rem', fontWeight: 700 }}>
            Shipping & Return Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Transparent shipping, insured transit, and hassle-free 7-day returns for our handloom collection.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.8rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' }}>
            <Truck size={36} color="var(--color-accent)" style={{ marginBottom: '0.8rem' }} />
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>Free Express Shipping</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Complimentary shipping across India on all orders exceeding ₹2,999.</p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.8rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' }}>
            <Clock size={36} color="var(--color-accent)" style={{ marginBottom: '0.8rem' }} />
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>Dispatch Timelines</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Orders dispatched within 24–48 hours from our artisan master hubs.</p>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.8rem', textAlign: 'center', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' }}>
            <RefreshCw size={36} color="var(--color-accent)" style={{ marginBottom: '0.8rem' }} />
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>7-Day Returns</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Hassle-free return pickups arranged right from your doorstep.</p>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2.5rem', lineHeight: '1.8', color: 'var(--text-primary)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Domestic Shipping Rates</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Orders under ₹2,999 incur a nominal express shipping charge of ₹250. Delivery generally takes 2 to 5 business days depending on metro vs non-metro destinations.
          </p>

          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>Returns & Replacement Eligibility</h2>
          <p style={{ color: 'var(--text-primary)' }}>
            Items can be returned within 7 days of delivery in their original unwashed condition with all tags attached. To initiate a return, contact our support team at teamvelocity4you@gmail.com.
          </p>
        </div>
      </div>
    </div>
  );
}
