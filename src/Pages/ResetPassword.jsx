import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../Services/authServices";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");
  const email = params.get("email");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      await resetPassword(email, token, password);
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage("Reset failed. The link may be invalid or expired.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Reset Password</h2>
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.passwordInput}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div style={styles.passwordContainer}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={styles.passwordInput}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <button type="submit" style={styles.button}>Reset Password</button>
        {message && <p style={styles.text}>{message}</p>}
      </form>
      <button 
        onClick={() => navigate('/login')} 
        style={styles.homeButton}
      >
        ← Back to Login
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '2rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
  },
  form: {
    maxWidth: "400px",
    width: "100%",
    margin: "2rem auto",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    border: "1px solid #e0e7ff",
    borderRadius: "12px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#4f46e5",
    fontSize: "1.8rem",
    fontWeight: 700,
    marginBottom: "1rem",
    textAlign: "center",
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  passwordInput: {
    padding: "12px",
    fontSize: "1rem",
    border: "1px solid #e0e7ff",
    borderRadius: "6px",
    outline: "none",
    transition: "border-color 0.2s",
    width: "100%",
    boxSizing: "border-box",
    "&:focus": {
      borderColor: "#4f46e5",
    },
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    fontSize: "1.2rem",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    "&:hover": {
      opacity: 0.8,
    },
  },
  button: {
    padding: "12px",
    fontSize: "1rem",
    backgroundColor: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#4338ca",
    },
  },
  text: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#64748b",
    marginTop: "0.5rem",
  },
  homeButton: {
    padding: "10px 20px",
    backgroundColor: "#fff",
    color: "#4f46e5",
    border: "1px solid #e0e7ff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    "&:hover": {
      backgroundColor: "#f8fafc",
      transform: "translateY(-1px)",
    },
  },
};

export default ResetPassword;