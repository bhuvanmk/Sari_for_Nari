import React from 'react';

export default function NaarisBrandLoader({ text = 'Curating Pure Handlooms...' }) {
  return (
    <div 
      className="naaris-luxury-loader-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1rem',
        minHeight: '220px',
        textAlign: 'center'
      }}
    >
      <div 
        className="naaris-logo-pulse-wrapper"
        style={{
          position: 'relative',
          width: '72px',
          height: '72px',
          marginBottom: '1.2rem'
        }}
      >
        {/* Glowing Aura Ring */}
        <div 
          style={{
            position: 'absolute',
            inset: '-6px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, rgba(123, 30, 58, 0.15) 70%, transparent 100%)',
            animation: 'loaderAuraPulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
          }}
        />

        {/* Brand Crest Image */}
        <img 
          src="/brand_logo.png" 
          alt="NAARIS Loading" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 2,
            filter: 'drop-shadow(0 4px 12px rgba(200, 155, 60, 0.3))',
            animation: 'logoSubtleFloat 2.5s ease-in-out infinite'
          }}
        />
      </div>

      <h3 
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.15rem',
          color: 'var(--text-primary)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginBottom: '0.4rem'
        }}
      >
        SAREES FOR NAARIS
      </h3>

      <p 
        style={{
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.5px',
          margin: 0,
          fontStyle: 'italic'
        }}
      >
        {text}
      </p>
    </div>
  );
}
