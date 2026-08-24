import React from 'react';
import { Sparkles } from 'lucide-react';
import Navbar from './Navbar';

export default function PrivacyPolicyPage() {
  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem 4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ color: 'var(--color-primary-hover)', textTransform: 'uppercase', letterSpacing: '3px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} /> Data Security & Safeguards
          </span>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.8rem', color: 'var(--color-accent)', marginTop: '0.5rem', marginBottom: '1rem', fontWeight: 700 }}>
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Your privacy and security are paramount. Learn how we safeguard your personal information.
          </p>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2.5rem', lineHeight: '1.8', color: 'var(--text-primary)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>1. Information We Collect</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            We gather personal details necessary for processing your saree orders, including full name, shipping address, mobile contact number, and email. Payment details are processed directly via secure payment gateways and are never stored on our servers.
          </p>

          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>2. Data Encryption & Security</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Our platform utilizes industry-standard 256-bit SSL encryption. Your credentials, OTP verifications, and delivery coordinates remain strictly confidential.
          </p>

          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>3. Third-Party Sharing</h2>
          <p style={{ color: 'var(--text-primary)' }}>
            We do not sell, rent, or trade your personal information to third parties. Delivery details are shared exclusively with verified logistics partners (such as Delhivery, BlueDart) to fulfill order shipping.
          </p>
        </div>
      </div>
    </div>
  );
}
