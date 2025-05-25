import React, { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../Services/authServices";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

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
    try {
      console.log('Starting login process...');
      const data = await loginUser(email, password);
      console.log('Login successful, data:', data);
      login(data); // save to context + localStorage
      setNotification({
        show: true,
        message: "Login successful! Redirecting...",
        type: "success"
      });
      setTimeout(() => {
        if (data.role === "Student") navigate("/student");
        else if (data.role === "Instructor") navigate("/instructor");
      }, 1000);
    } catch (err) {
      console.error('Login error in component:', err);
      let errorMessage = "Login failed. ";
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage += err.response.data || "Server error occurred.";
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage += "No response from server. Please check your connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage += err.message || "An unexpected error occurred.";
      }
      
      setNotification({
        show: true,
        message: errorMessage,
        type: "error"
      });
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
        <h2 style={styles.title}>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <button type="submit" style={styles.button}>Login</button>

        <div style={styles.links}>
          <p style={styles.text}>
            Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
          </p>
          <p style={styles.text}>
            <Link to="/forgot-password" style={styles.link}>Forgot Password?</Link>
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
};

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

export default Login;