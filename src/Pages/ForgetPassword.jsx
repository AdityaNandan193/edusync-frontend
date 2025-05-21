import React, { useState } from "react";
import { forgotPassword } from "../Services/authServices";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("If this email exists, a reset link has been sent.");
    setLoading(true);
    try {
      await forgotPassword(email);
      // Optionally update message here if you want to show a different one after success
    } catch (err) {
      // Optionally handle error, but don't reveal if email exists or not
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
          disabled={loading}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
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
  input: {
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
    "&:disabled": {
      backgroundColor: "#f8fafc",
      cursor: "not-allowed",
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
    "&:disabled": {
      backgroundColor: "#a5b4fc",
      cursor: "not-allowed",
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

export default ForgotPassword;