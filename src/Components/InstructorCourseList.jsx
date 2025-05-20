import React, { useEffect, useState } from "react";
import axios from "axios";
import CourseForm from "./CourseForm";
import { useAuth } from "../Context/AuthContext";

const API_URL = "https://localhost:7136/api"; // Change if needed

function InstructorCourseList({ onCoursesUpdate }) {
  const { user } = useAuth();
  const instructorId = user?.userId; // Adjust if your user object uses a different key

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/Course`);
      const filtered = res.data.filter(
        (course) => course.instructorId === user?.userId
      );
      setCourses(filtered);
      if (onCoursesUpdate) {
        onCoursesUpdate(filtered);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    await axios.delete(`${API_URL}/Course/${id}`);
    fetchCourses();
  };

  const handleEdit = (course) => {
    setEditCourse(course);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditCourse(null);
    setShowForm(true);
  };

  const handleFormClose = (refresh = false) => {
    setShowForm(false);
    setEditCourse(null);
    if (refresh) fetchCourses();
  };

  const handleView = (course) => {
    setViewCourse(course);
  };

  if (loading) {
    return <div style={styles.loading}>Loading courses...</div>;
  }

  return (
    <div>
      <button style={styles.addBtn} onClick={handleAdd}>
        + Add Course
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
        {courses.map((course) => (
          <div key={course.courseId} style={styles.card}>
            {/* Show image preview if mediaUrl is an image */}
            {course.mediaUrl && course.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) && (
              <img
                src={course.mediaUrl}
                alt="Course Media"
                style={styles.media}
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <h4>{course.title}</h4>
            <p>{course.description}</p>
            <div style={styles.actions}>
              <button style={styles.viewBtn} onClick={() => handleView(course)}>View</button>
              <button style={styles.editBtn} onClick={() => handleEdit(course)}>Edit</button>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(course.courseId)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <CourseForm
          course={editCourse}
          onClose={handleFormClose}
          instructorId={instructorId}
        />
      )}
      {viewCourse && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button
              style={styles.closeBtn}
              onClick={() => setViewCourse(null)}
              title="Close"
            >
              ✕
            </button>
            <div style={styles.courseView}>
              {viewCourse.mediaUrl && viewCourse.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) && (
                <div style={styles.mediaContainer}>
                  <img
                    src={viewCourse.mediaUrl}
                    alt="Course Media"
                    style={styles.modalMedia}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
              )}
              <h2 style={styles.courseTitle}>{viewCourse.title}</h2>
              <div style={styles.courseInfo}>
                <div style={styles.infoSection}>
                  <h3 style={styles.sectionTitle}>Description</h3>
                  <p style={styles.description}>{viewCourse.description}</p>
                </div>
                {viewCourse.mediaUrl && (
                  <div style={styles.infoSection}>
                    <h3 style={styles.sectionTitle}>Course Resources</h3>
                    <a
                      href={viewCourse.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.resourceLink}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Access Course Material
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: "#f1f5f9",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "1rem",
    minWidth: "220px",
    maxWidth: "300px",
    flex: "1 1 220px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  media: {
    width: "100%",
    borderRadius: "6px",
    marginBottom: "0.5rem",
    maxHeight: "120px",
    objectFit: "cover",
    background: "#e0e7ff",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1rem",
  },
  addBtn: {
    marginBottom: "1rem",
    padding: "8px 16px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
  },
  viewBtn: {
    background: "#f1f5f9",
    color: "#3730a3",
    border: "1px solid #c7d2fe",
    borderRadius: "4px",
    padding: "7px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "background 0.2s",
  },
  editBtn: {
    background: "#e0e7ff",
    color: "#4f46e5",
    border: "1px solid #c7d2fe",
    borderRadius: "4px",
    padding: "7px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "background 0.2s",
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: "4px",
    padding: "7px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "background 0.2s",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modalContent: {
    background: "#fff",
    borderRadius: "18px",
    padding: "2rem 1.5rem 1.5rem 1.5rem",
    maxWidth: "750px",
    width: "95vw",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 4px 32px rgba(79,70,229,0.13)",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 18,
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: 700,
    zIndex: 10,
  },
  courseView: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  mediaContainer: {
    width: "100%",
    height: "300px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(79,70,229,0.10)",
  },
  modalMedia: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  courseTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#3730a3",
    margin: 0,
  },
  courseInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  infoSection: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "1px solid #e0e7ff",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#4f46e5",
    margin: "0 0 1rem 0",
  },
  description: {
    fontSize: "1.1rem",
    lineHeight: 1.6,
    color: "#4b5563",
    margin: 0,
  },
  resourceLink: {
    display: "inline-flex",
    alignItems: "center",
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: 600,
    transition: "background 0.2s",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
};

export default InstructorCourseList;