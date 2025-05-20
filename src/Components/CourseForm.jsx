import React, { useState } from "react";
import axios from "axios";

const API_URL = "https://localhost:7136/api"; // Change if needed

function CourseForm({ course, onClose, instructorId }) {
  const [title, setTitle] = useState(course ? course.title : "");
  const [description, setDescription] = useState(course ? course.description : "");
  const [mediaUrl, setMediaUrl] = useState(course ? course.mediaUrl : "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description,
      instructorId,
      mediaUrl,
    };

    try {
      if (course) {
        await axios.put(`${API_URL}/Course/${course.courseId}`, payload);
      } else {
        await axios.post(`${API_URL}/Course`, payload);
      }
      onClose(true);
    } catch {
      alert("Error saving course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>{course ? "Edit Course" : "Add Course"}</h3>
        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Media URL (e.g. PDF/Image/Video link)"
          value={mediaUrl}
          onChange={e => setMediaUrl(e.target.value)}
          style={styles.input}
        />
        {mediaUrl && (
          <div>
            <small>
              Current Media:{" "}
              <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                View
              </a>
            </small>
          </div>
        )}
        <div style={styles.actions}>
          <button type="submit" disabled={loading} style={styles.saveBtn}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => onClose(false)} style={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  form: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    minWidth: "320px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "1rem",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
  },
  saveBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "8px 16px",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#333",
    border: "none",
    borderRadius: "4px",
    padding: "8px 16px",
    cursor: "pointer",
  },
};

export default CourseForm;