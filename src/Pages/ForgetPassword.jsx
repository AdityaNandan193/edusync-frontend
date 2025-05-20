import React, { useState } from "react";
import { forgotPassword } from "../Services/authServices";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Forgot Password</h2>
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
  );
}

const styles = {
  form: {
    maxWidth: "400px",
    margin: "2rem auto",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
  },
  button: {
    padding: "10px",
    fontSize: "1rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  text: {
    marginTop: "1rem",
    textAlign: "center",
    fontSize: "0.9rem",
  },
};

export default ForgotPassword;