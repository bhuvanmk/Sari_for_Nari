import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export default function Toast({ notification, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!notification) return;

    const duration = notification.duration || (notification.type === 'error' ? 6000 : 4000);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [notification]);

  if (!notification) return null;

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      if (onClose) onClose();
    }, 250);
  };

  const type = notification.type || 'success';
  const isWishlist = notification.category === 'wishlist' || (notification.msg && notification.msg.toLowerCase().includes('wishlist'));
  const isOrder = notification.category === 'order' || (notification.msg && notification.msg.toLowerCase().includes('order'));

  const renderIcon = () => {
    if (isWishlist) {
      return <Sparkles size={22} className="toast-icon-svg" />;
    }
    switch (type) {
      case 'error':
        return <AlertCircle size={22} className="toast-icon-svg" />;
      case 'warning':
      case 'info':
        return <Info size={22} className="toast-icon-svg" />;
      case 'success':
      default:
        return <CheckCircle2 size={22} className="toast-icon-svg" />;
    }
  };

  const duration = notification.duration || (type === 'error' ? 6000 : 4000);

  return (
    <div className={`toast-container ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className={`toast-card toast-${type}`}>
        {/* Icon Badge */}
        <div className={`toast-icon-badge badge-${type}`}>
          {renderIcon()}
        </div>

        {/* Content Box */}
        <div className="toast-content">
          <h4 className={`toast-title ${isOrder ? 'toast-title-serif' : ''}`}>
            {notification.title || (type === 'error' ? 'Action Failed' : 'Notification')}
          </h4>
          <p className="toast-message">{notification.msg || notification.message}</p>
        </div>

        {/* Close Button */}
        <button className="toast-close-btn" onClick={handleClose} aria-label="Close notification">
          <X size={16} />
        </button>

        {/* Bottom Draining Progress Bar */}
        <div 
          className={`toast-progress-bar bar-${type}`} 
          style={{ animationDuration: `${duration}ms` }} 
        />
      </div>
    </div>
  );
}
