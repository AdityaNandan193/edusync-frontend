import React, { useEffect, useState } from "react";
import axios from "axios";
import CourseForm from "./CourseForm";
import { useAuth } from "../Context/AuthContext";
import DeleteConfirmation from "./DeleteConfirmation";
import { toast } from "react-toastify";

const API_URL = "https://localhost:7136/api";

function InstructorCourseList({ onCoursesUpdate }) {
  const { user } = useAuth();
  const instructorId = user?.userId;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [viewCourse, setViewCourse] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, courseId: null });

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
      toast.error("Failed to fetch courses. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.userId]);

  const handleDelete = async (id) => {
    setDeleteConfirmation({ isOpen: true, courseId: id });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/Course/${deleteConfirmation.courseId}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    } finally {
      setDeleteConfirmation({ isOpen: false, courseId: null });
    }
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
    if (refresh) {
      fetchCourses();
      toast.success(editCourse ? "Course updated successfully" : "Course created successfully");
    }
  };

  const handleView = (course) => {
    setViewCourse(course);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.addBtn} onClick={handleAdd}>
          + Add Course
        </button>
      </div>
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <div style={styles.loadingText}>Loading courses...</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {courses.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>No courses yet. Click "Add Course" to get started!</p>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.courseId} style={styles.card}>
                {course.mediaUrl && course.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/i) && (
                  <div style={styles.mediaContainer}>
                    <img
                      src={course.mediaUrl}
                      alt="Course Media"
                      style={styles.media}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
                <div style={styles.cardContent}>
                  <h4 style={styles.cardTitle}>{course.title}</h4>
                  <p style={styles.cardDescription}>{course.description}</p>
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
              </div>
            ))
          )}
        </div>
      )}
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
      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, courseId: null })}
        onConfirm={confirmDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
      />
    </div>
  );
}

const styles = {
  container: {
    padding: "1rem",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "1rem",
    color: "#4f46e5",
    fontSize: "1.1rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  mediaContainer: {
    width: "100%",
    height: "200px",
    overflow: "hidden",
    background: "#f8fafc",
  },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardContent: {
    padding: "1.5rem",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    margin: "0 0 0.75rem 0",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#1f2937",
  },
  cardDescription: {
    margin: "0 0 1rem 0",
    color: "#6b7280",
    fontSize: "0.875rem",
    flex: 1,
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "auto",
  },
  viewBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    flex: 1,
  },
  editBtn: {
    background: "#f3f4f6",
    color: "#4f46e5",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    flex: 1,
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    flex: 1,
  },
  addBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e0e7ff",
    marginTop: "1rem",
  },
  emptyStateText: {
    color: "#6b7280",
    fontSize: "1.1rem",
    textAlign: "center",
    margin: 0,
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
};

// Add keyframes for loading spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default InstructorCourseList;