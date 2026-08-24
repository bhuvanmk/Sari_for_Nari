import React from 'react';
import { Sparkles, HeartHandshake, ShieldCheck, Award } from 'lucide-react';
import Navbar from './Navbar';

export default function AboutPage() {
  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1100px', margin: '3rem auto', padding: '0 1.5rem 4rem 1.5rem' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
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
            <Sparkles size={16} /> Heritage Handlooms Since Generation
          </span>
          <h1 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '2.8rem', 
            color: 'var(--color-accent)', 
            marginTop: '0.5rem',
            marginBottom: '1rem',
            fontWeight: 700
          }}>
            About Sarees For Naaris
          </h1>
          <p style={{ maxWidth: '750px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.8' }}>
            We bridge the gap between traditional Indian master weavers and women across the globe, bringing authentic handloomed heirlooms directly to your doorstep.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '4rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
          }}>
            <Award size={40} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.3rem', fontWeight: 700 }}>100% Pure Silk Mark</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Every saree in our collection carries the certified Silk Mark tag, guaranteeing 100% natural silk quality and authenticity.
            </p>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
          }}>
            <HeartHandshake size={40} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.3rem', fontWeight: 700 }}>Direct Weaver Support</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              We partner directly with artisan cooperatives in Banaras, Kanchipuram, Yeola, and Chanderi, ensuring fair wages and preserving heritage craft.
            </p>
          </div>

          <div style={{
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
          }}>
            <ShieldCheck size={40} color="var(--color-accent)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1.3rem', fontWeight: 700 }}>Royal Customer Care</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              From seamless online checkout to insured pan-India express delivery and easy 7-day returns, we ensure a royal shopping experience.
            </p>
          </div>
        </div>

        {/* Detailed Story Section */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '3rem',
          lineHeight: '1.8',
          color: 'var(--text-primary)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
        }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: 'var(--color-accent)', marginBottom: '1.5rem', fontSize: '1.8rem', fontWeight: 700 }}>
            Our Heritage & Commitment
          </h2>
          <p style={{ marginBottom: '1.2rem', color: 'var(--text-primary)' }}>
            Sarees For Naaris was born out of a profound admiration for Indian textiles and the timeless grace of saree draping. The intricate zari motifs of Banarasi silk, the majestic temple borders of Kanjivaram, and the delicate lightness of Chanderi tissue tell stories of centuries-old craftsmanship passed down across generations.
          </p>
          <p style={{ color: 'var(--text-primary)' }}>
            By leveraging modern digital technology and direct artisan sourcing, we eliminate intermediaries, passing the authentic craftsmanship directly to you while ensuring weaver families receive the honor and compensation they deserve.
          </p>
        </div>
      </div>
    </div>
  );
}
