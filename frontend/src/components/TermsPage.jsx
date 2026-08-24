import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';

export default function TermsPage() {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedReturnPolicy, setAgreedReturnPolicy] = useState(false);

  const isFullyAccepted = agreedTerms && agreedReturnPolicy;

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 1.5rem 4rem 1.5rem' }}>
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ 
            color: 'var(--color-primary-hover)', 
            textTransform: 'uppercase', 
            letterSpacing: '3px', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={16} /> Customer Agreement & Policies
          </span>
          <h1 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '2.8rem', 
            color: 'var(--color-accent)', 
            marginTop: '0.5rem',
            marginBottom: '1rem',
            fontWeight: 700
          }}>
            Terms & Conditions
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Please read and acknowledge our terms of service and handloom usage policies below.
          </p>
        </div>

        {/* Policy Document Content */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '2.5rem',
          lineHeight: '1.8',
          color: 'var(--text-primary)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
        }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>
            1. Authenticity & Silk Mark Guarantee
          </h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            All sarees sold on Sarees For Naaris are 100% genuine handloom products sourced directly from weaver clusters. Each pure silk saree includes an official Silk Mark Organization of India tag.
          </p>

          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>
            2. Orders, Custom Fall & Edging
          </h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Orders placed on our website are subject to stock availability and weaver dispatch times. Saree fall and edging (Pico) customization, once initiated, render the product non-returnable unless a manufacturing defect is present.
          </p>

          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>
            3. Pricing, Payments & Taxes
          </h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            Prices displayed on the catalog include applicable Indian GST taxes. Payments processed via Razorpay (Cards/UPI) or Cash on Delivery (COD) are secured with 256-bit SSL encryption.
          </p>

          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>
            4. Handcrafted Variance Notice
          </h2>
          <p style={{ color: 'var(--text-primary)' }}>
            Because our sarees are authentic handloomed creations woven on traditional pit looms, minor slubs, color subtle variations, or weaving irregularities are natural hallmarks of handloom purity and are not considered defects.
          </p>
        </div>

        {/* Interactive Checkbox Mandatory Acknowledgment Box */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', fontSize: '1.3rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
            <FileText size={20} /> Required Customer Acknowledgment
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              <input 
                type="checkbox" 
                checked={agreedTerms} 
                onChange={(e) => setAgreedTerms(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-accent)', marginTop: '0.15rem' }}
              />
              <span>
                I have read and agree to the <strong>Terms of Service</strong>, handcrafted variance policies, and payment terms of Sarees For Naaris.
              </span>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
              <input 
                type="checkbox" 
                checked={agreedReturnPolicy} 
                onChange={(e) => setAgreedReturnPolicy(e.target.checked)}
                style={{ width: '20px', height: '20px', accentColor: 'var(--color-accent)', marginTop: '0.15rem' }}
              />
              <span>
                I accept the <strong>7-Day Handloom Return & Exchange Policy</strong> and acknowledge that customized fall/pico items cannot be returned.
              </span>
            </label>
          </div>

          <div style={{ marginTop: '1.8rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {isFullyAccepted ? (
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <CheckCircle size={18} /> Terms & Conditions Acknowledged & Verified
              </span>
            ) : (
              <span style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 500 }}>
                <AlertCircle size={18} /> Please check both boxes above to verify agreement.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
