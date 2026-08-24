import React, { useState, useEffect } from 'react';

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="gold-scroll-progress-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        background: 'linear-gradient(90deg, #7B1E3A 0%, #D4AF37 50%, #A97A1F 100%)',
        transformOrigin: '0%',
        transform: `scaleX(${scrollProgress / 100})`,
        zIndex: 99999,
        transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)'
      }}
      aria-hidden="true"
    />
  );
}
