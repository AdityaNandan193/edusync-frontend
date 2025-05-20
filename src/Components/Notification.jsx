import React, { useEffect } from 'react';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div style={{
      ...styles.notification,
      ...styles[type],
      animation: 'slideIn 0.3s ease-out',
    }}>
      <div style={styles.content}>
        <span style={styles.icon}>
          {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
        </span>
        <span style={styles.message}>{message}</span>
      </div>
      <button onClick={onClose} style={styles.closeButton}>×</button>
    </div>
  );
};

const styles = {
  notification: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: '300px',
    maxWidth: '400px',
    zIndex: 1000,
    '@keyframes slideIn': {
      from: {
        transform: 'translateX(100%)',
        opacity: 0,
      },
      to: {
        transform: 'translateX(0)',
        opacity: 1,
      },
    },
  },
  success: {
    backgroundColor: '#10B981',
    color: 'white',
  },
  error: {
    backgroundColor: '#EF4444',
    color: 'white',
  },
  info: {
    backgroundColor: '#3B82F6',
    color: 'white',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  icon: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  message: {
    fontSize: '14px',
    fontWeight: 500,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '0 0 0 12px',
    opacity: 0.8,
    transition: 'opacity 0.2s',
    '&:hover': {
      opacity: 1,
    },
  },
};

export default Notification; 