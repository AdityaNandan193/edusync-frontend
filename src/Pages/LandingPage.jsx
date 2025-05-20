import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome to EduSync</h1>
        <p style={styles.subtitle}>
          Empowering Education Through Smart Assessment and Learning Management
        </p>
        <div style={styles.buttonGroup}>
          <button 
            style={styles.primaryButton}
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
          <button 
            style={styles.secondaryButton}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </header>

      <section style={styles.featuresGrid}>
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>Smart Assessments</h2>
            <p style={styles.cardDescription}>
              Take interactive assessments with instant feedback and detailed progress tracking.
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>Course Management</h2>
            <p style={styles.cardDescription}>
              Access comprehensive course materials, track your progress, and manage your learning journey.
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardContent}>
            <h2 style={styles.cardTitle}>Progress Analytics</h2>
            <p style={styles.cardDescription}>
              Get detailed insights into your performance with comprehensive analytics and progress reports.
            </p>
          </div>
        </div>
      </section>

      <section style={styles.infoSection}>
        <div style={styles.infoContent}>
          <h2 style={styles.infoTitle}>Why Choose EduSync?</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <h3 style={styles.infoItemTitle}>Interactive Learning</h3>
              <p style={styles.infoItemText}>
                Engage with dynamic assessments and real-time feedback to enhance your learning experience.
              </p>
            </div>
            <div style={styles.infoItem}>
              <h3 style={styles.infoItemTitle}>Progress Tracking</h3>
              <p style={styles.infoItemText}>
                Monitor your performance with detailed analytics and personalized progress reports.
              </p>
            </div>
            <div style={styles.infoItem}>
              <h3 style={styles.infoItemTitle}>Comprehensive Resources</h3>
              <p style={styles.infoItemText}>
                Access a wide range of learning materials and resources all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>© 2025 EduSync. All rights reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
    padding: "2rem",
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    textAlign: "center",
    marginBottom: "4rem",
    padding: "2rem 0",
  },
  title: {
    fontSize: "3.5rem",
    fontWeight: 700,
    color: "#1e40af",
    marginBottom: "1rem",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  subtitle: {
    fontSize: "1.25rem",
    color: "#4b5563",
    marginBottom: "2rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
  },
  primaryButton: {
    padding: "0.75rem 2rem",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(90deg, #4f46e5 0%, #6366f1 100%)",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(79, 70, 229, 0.2)",
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 8px rgba(79, 70, 229, 0.3)",
    },
  },
  secondaryButton: {
    padding: "0.75rem 2rem",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#4f46e5",
    background: "#fff",
    border: "2px solid #4f46e5",
    borderRadius: "0.75rem",
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": {
      background: "#f8fafc",
    },
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 0",
  },
  card: {
    background: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  cardContent: {
    padding: "2rem",
  },
  cardTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1e40af",
    marginBottom: "1rem",
  },
  cardDescription: {
    color: "#4b5563",
    lineHeight: 1.6,
  },
  infoSection: {
    background: "#fff",
    padding: "4rem 2rem",
    marginTop: "4rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  infoContent: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  infoTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1e40af",
    textAlign: "center",
    marginBottom: "3rem",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "2rem",
  },
  infoItem: {
    textAlign: "center",
    padding: "1.5rem",
  },
  infoItemTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#1e40af",
    marginBottom: "1rem",
  },
  infoItemText: {
    color: "#4b5563",
    lineHeight: 1.6,
  },
  footer: {
    textAlign: "center",
    marginTop: "4rem",
    padding: "2rem 0",
    color: "#6b7280",
  },
  footerText: {
    fontSize: "0.875rem",
  },
};

export default LandingPage; 