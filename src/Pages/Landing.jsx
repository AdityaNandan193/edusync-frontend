import React from "react";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Welcome to EduSync!</h1>
        <p style={styles.tagline}>Your platform for seamless learning and teaching.</p>
        
        {/* Calls to action */}
        <div style={styles.ctaContainer}>
          <div style={styles.ctaItem}>
            <p style={styles.ctaText}>New to EduSync?</p>
            <Link to="/register" style={styles.buttonPrimary}>Register</Link>
          </div>
          <div style={styles.ctaItem}>
            <p style={styles.ctaText}>Existing user?</p>
            <Link to="/login" style={styles.buttonSecondary}>Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "#fff",
    fontFamily: "Segoe UI, sans-serif",
    padding: "2rem",
    textAlign: "center",
  },
  content: {
    background: "rgba(255, 255, 255, 0.1)",
    padding: "3rem",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: 700,
    marginBottom: "1rem",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
    letterSpacing: "1px",
  },
  tagline: {
    fontSize: "1.5rem",
    marginBottom: "2.5rem",
    fontWeight: 300,
    color: "#e0e7ff",
  },
  ctaContainer: {
    display: "flex",
    gap: "3rem",
    marginTop: "2rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  ctaItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
  },
  ctaText: {
    fontSize: "1.2rem",
    fontWeight: 400,
    color: "#c7d2fe",
    margin: 0,
  },
  buttonPrimary: {
    display: "inline-block",
    padding: "1rem 2.5rem",
    fontSize: "1.2rem",
    fontWeight: 600,
    textDecoration: "none",
    color: "#4f46e5",
    background: "#fff",
    borderRadius: "8px",
    transition: "background 0.3s ease, transform 0.1s ease",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    ":hover": {
      background: "#f1f5f9",
      transform: "translateY(-2px)",
    },
  },
  buttonSecondary: {
    display: "inline-block",
    padding: "1rem 2.5rem",
    fontSize: "1.2rem",
    fontWeight: 600,
    textDecoration: "none",
    color: "#fff",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    border: "2px solid #fff",
    transition: "background 0.3s ease, transform 0.1s ease, color 0.3s ease, border-color 0.3s ease",
    ":hover": {
      background: "#fff",
      color: "#4f46e5",
      transform: "translateY(-2px)",
    },
  },
};

export default Landing;
