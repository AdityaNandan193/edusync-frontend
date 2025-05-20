// src/Components/LogoutButton.jsx
import React from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton({ style }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Clear user data
      logout();
      
      // Clear storage
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Replace the current history entry with login page
      // This prevents going back to the previous page after logout
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login', { replace: true });
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      style={style}
      type="button"
    >
      Logout
    </button>
  );
}

export default LogoutButton;