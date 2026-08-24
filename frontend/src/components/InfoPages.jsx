import React from 'react';
import Navbar from './Navbar';

export default function InfoPages() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '3rem auto', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.2)', color: '#f5e6d0' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', color: '#d4af37', marginBottom: '1rem' }}>About Sarees For Naaris</h1>
        <p style={{ lineHeight: '1.8', color: '#d8c8b8', marginBottom: '1.5rem' }}>
          Sarees For Naaris is dedicated to bringing authentic Indian handloomed sarees directly from master artisan clusters to women across the globe. Every Banarasi, Kanjivaram, and Paithani weave in our catalog is Silk Mark certified, empowering traditional weavers and celebrating timeless grace.
        </p>
        <h2 style={{ fontFamily: 'Cinzel, serif', color: '#d4af37', marginTop: '2rem', marginBottom: '0.8rem' }}>Contact & Customer Support</h2>
        <p style={{ lineHeight: '1.8', color: '#d8c8b8' }}>
          Email: support@sareesfornaaris.in | Helpline: +91 (800) 108-9000<br/>
          Operational Hours: Monday to Saturday, 9:00 AM – 7:00 PM IST
        </p>
      </div>
    </div>
  );
}
