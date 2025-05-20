import React, { useState, useEffect } from "react";
import { registerUser } from "../Services/authServices";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "Student" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const navigate = useNavigate();

  // Add effect to automatically dismiss notification
  useEffect(() => {
    let timer;
    if (notification.show) {
      timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [notification.show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation
    if (form.password.length < 8) {
      setNotification({
        show: true,
        message: "Password must be at least 8 characters long",
        type: "error"
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setNotification({
        show: true,
        message: "Passwords do not match!",
        type: "error"
      });
      return;
    }

    try {
      await registerUser(form);
      setNotification({
        show: true,
        message: "Registration successful! Redirecting to login...",
        type: "success"
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.log('Registration error:', err.response); // For debugging
      
      // Handle the error message from the backend
      if (err.response?.data) {
        setNotification({
          show: true,
          message: err.response.data,
          type: "error"
        });
      } else if (err.response?.status === 400) {
        setNotification({
          show: true,
          message: "Please fill in all required fields correctly.",
          type: "error"
        });
      } else if (err.response?.status === 500) {
        setNotification({
          show: true,
          message: "Server error. Please try again later.",
          type: "error"
        });
      } else {
        setNotification({
          show: true,
          message: "Unable to connect to the server. Please check your internet connection.",
          type: "error"
        });
      }
    }
  };

  return (
    <div style={styles.container}>
      {notification.show && (
        <div style={{
          ...styles.notification,
          backgroundColor: notification.type === "success" ? "#10B981" : "#EF4444"
        }}>
          {notification.message}
        </div>
      )}
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Register</h2>
        <input
          type="text"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={styles.input}
        />
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password (minimum 8 characters)"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength="8"
            style={styles.passwordInput}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <div style={styles.passwordContainer}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password (minimum 8 characters)"
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
            minLength="8"
            style={styles.passwordInput}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <select
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          value={form.role}
          style={styles.input}
        >
          <option value="Student">Student</option>
          <option value="Instructor">Instructor</option>
        </select>
        <button type="submit" style={styles.button}>Register</button>

        <div style={styles.links}>
          <p style={styles.text}>
            Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
          </p>
        </div>
      </form>
      <button 
        onClick={() => navigate('/')} 
        style={styles.homeButton}
      >
        ← Back to Homepage
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
  links: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  text: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#64748b",
  },
  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: 500,
    "&:hover": {
      textDecoration: "underline",
    },
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
  notification: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 24px",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: 500,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 1000,
    animation: "slideDown 0.3s ease-out",
  },
};

export default Register;
