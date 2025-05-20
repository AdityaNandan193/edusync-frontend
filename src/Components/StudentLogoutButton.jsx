import React from 'react';

const StudentLogoutButton = () => {
  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Student logout clicked');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ padding: '8px 16px' }}>
      <button
        type="button"
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '8px 12px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          display: 'block'
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default StudentLogoutButton; 