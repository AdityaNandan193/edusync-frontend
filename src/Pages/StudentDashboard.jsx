import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../Components/LogoutButton";
import StudentAssessmentList from "../Components/StudentAssessmentList";
import StudentProgressTracker from "../Components/StudentProgressTracker";
import LoadingSpinner from "../Components/LoadingSpinner";
import Notification from "../Components/Notification";

const API_URL = "https://localhost:7136/api";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentName = user?.name || "Student";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourses, setShowCourses] = useState(false);
  const [showAssessments, setShowAssessments] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/Course`);
      
      // Check for new courses
      if (courses.length > 0 && res.data.length > courses.length) {
        const newCourse = res.data.find(course => !courses.some(c => c.courseId === course.courseId));
        if (newCourse) {
          showNotification(`New course "${newCourse.title}" is now available!`);
        }
      }
      
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
      }
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleNewAssessment = (assessment) => {
    showNotification(`New assessment "${assessment.title}" is now available!`);
  };

  return (
    <div style={styles.container}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Welcome, {studentName}!</h1>
          <div style={styles.subtitle}>Explore and learn from available courses.</div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.studentBadge}>
            <span style={styles.studentText}>Student</span>
          </div>
          <LogoutButton style={styles.logoutButton} />
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <div style={styles.sectionCard}>
            <div
              style={{
                ...styles.sectionToggle,
                background: showCourses
                  ? "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)"
                  : "#f1f5f9",
                color: showCourses ? "#fff" : "#4f46e5",
              }}
              onClick={() => {
                setShowCourses((prev) => !prev);
                if (showAssessments) setShowAssessments(false);
                if (showProgress) setShowProgress(false);
              }}
              tabIndex={0}
              role="button"
              aria-expanded={showCourses}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: "1.15rem" }}>Available Courses</span>
              </span>
              <span
                style={{
                  ...styles.triangle,
                  transform: showCourses ? "rotate(180deg)" : "rotate(0deg)",
                  color: showCourses ? "#fff" : "#6366f1"
                }}
              >
                ▼
              </span>
            </div>
            <div
              style={{
                ...styles.sectionContent,
                maxHeight: showCourses ? '2000px' : '0',
                padding: showCourses ? "2rem 0 0 0" : "0",
                opacity: showCourses ? 1 : 0,
                transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
                overflow: "hidden"
              }}
            >
              {loading ? (
                <LoadingSpinner />
              ) : courses.length === 0 ? (
                <div style={styles.emptyState}>No courses available at the moment.</div>
              ) : (
                <div style={styles.grid}>
                  {courses.map((course) => (
                    <div key={course.courseId} style={styles.card}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>{course.title}</h3>
                      </div>
                      <div style={styles.cardBody}>
                        <p style={styles.courseDescription}>{course.description}</p>
                        <div style={styles.instructorNameTag}>Instructor: {course.instructorName}</div>
                      </div>
                      <div style={styles.actions}>
                        {course.mediaUrl && (
                          <a
                            href={course.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.mediaLink}
                          >
                            View Material
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionCard}>
            <div
              style={{
                ...styles.sectionToggle,
                background: showAssessments
                  ? "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)"
                  : "#f1f5f9",
                color: showAssessments ? "#fff" : "#4f46e5",
              }}
              onClick={() => {
                setShowAssessments((prev) => !prev);
                if (showCourses) setShowCourses(false);
                if (showProgress) setShowProgress(false);
              }}
              tabIndex={0}
              role="button"
              aria-expanded={showAssessments}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: "1.15rem" }}>Available Assessments</span>
              </span>
              <span
                style={{
                  ...styles.triangle,
                  transform: showAssessments ? "rotate(180deg)" : "rotate(0deg)",
                  color: showAssessments ? "#fff" : "#6366f1"
                }}
              >
                ▼
              </span>
            </div>
            <div
              style={{
                ...styles.sectionContent,
                maxHeight: showAssessments ? '2000px' : '0',
                padding: showAssessments ? "2rem 0 0 0" : "0",
                opacity: showAssessments ? 1 : 0,
                transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
                overflow: "hidden"
              }}
            >
              <StudentAssessmentList onNewAssessment={handleNewAssessment} />
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.sectionCard}>
            <div
              style={{
                ...styles.sectionToggle,
                background: showProgress
                  ? "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)"
                  : "#f1f5f9",
                color: showProgress ? "#fff" : "#4f46e5",
              }}
              onClick={() => {
                setShowProgress((prev) => !prev);
                if (showCourses) setShowCourses(false);
                if (showAssessments) setShowAssessments(false);
              }}
              tabIndex={0}
              role="button"
              aria-expanded={showProgress}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: "1.15rem" }}>Your Progress</span>
              </span>
              <span
                style={{
                  ...styles.triangle,
                  transform: showProgress ? "rotate(180deg)" : "rotate(0deg)",
                  color: showProgress ? "#fff" : "#6366f1"
                }}
              >
                ▼
              </span>
            </div>
            <div
              style={{
                ...styles.sectionContent,
                maxHeight: showProgress ? '2000px' : '0',
                padding: showProgress ? "2rem 0 0 0" : "0",
                opacity: showProgress ? 1 : 0,
                transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
                overflow: "hidden"
              }}
            >
              <StudentProgressTracker />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2.2rem 3rem 2rem 3rem",
    background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
    color: "#fff",
    boxShadow: "0 2px 16px rgba(79,70,229,0.10)",
    borderRadius: "0 0 32px 32px",
    position: "relative",
  },
  title: {
    margin: 0,
    fontWeight: 700,
    fontSize: "2.1rem",
    letterSpacing: "0.5px",
  },
  subtitle: {
    marginTop: 8,
    color: "#e0e7ff",
    fontWeight: 400,
    fontSize: "1.1rem",
    letterSpacing: "0.2px",
  },
  main: {
    padding: "2rem 3rem",
  },
  section: {
    marginBottom: "2rem",
  },
  sectionCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 16px rgba(79,70,229,0.06)",
    padding: "2.2rem 2rem",
    marginBottom: "2.2rem",
    position: "relative",
  },
  sectionToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "12px",
    padding: "1.1rem 1.5rem",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(79,70,229,0.08)",
    marginBottom: "0.5rem",
    userSelect: "none",
    border: "1.5px solid #e0e7ff",
    transition: "background 0.2s, color 0.2s",
  },
  sectionContent: {
    background: "#fff",
    borderRadius: "0 0 12px 12px",
    boxShadow: "0 2px 16px rgba(79,70,229,0.06)",
    marginTop: 0,
    marginBottom: "1.5rem",
    transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
  },
  triangle: {
    fontSize: 22,
    marginLeft: 12,
    transition: "transform 0.2s",
    display: "inline-block",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "2rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    transition: "transform 0.2s",
    border: "1px solid #e0e7ff",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 12px rgba(0, 0, 0, 0.15)",
    },
  },
  cardHeader: {
    padding: "1.5rem",
    background: "#f8fafc",
    borderBottom: "1px solid #e0e7ff",
  },
  cardTitle: {
    margin: 0,
    color: "#4f46e5",
    fontSize: "1.2rem",
    fontWeight: 600,
  },
  cardBody: {
    padding: "1.5rem",
  },
  courseDescription: {
    margin: "0 0 1rem 0",
    color: "#64748b",
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
  instructorNameTag: {
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    background: "#e0e7ff",
    color: "#4f46e5",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  actions: {
    padding: "1rem 1.5rem",
    background: "#f8fafc",
    borderTop: "1px solid #e0e7ff",
  },
  mediaLink: {
    display: "inline-block",
    padding: "0.5rem 1rem",
    background: "#4f46e5",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: 500,
    transition: "background 0.2s",
    "&:hover": {
      background: "#4338ca",
    },
  },
  loading: {
    textAlign: "center",
    padding: "2rem",
    color: "#4f46e5",
    fontSize: "1.1rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#64748b",
    fontSize: "1.1rem",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  studentBadge: {
    background: "rgba(255, 255, 255, 0.1)",
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(8px)",
  },
  studentText: {
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 500,
    letterSpacing: "0.5px",
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    letterSpacing: "0.5px",
    "&:hover": {
      backgroundColor: "#dc2626",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
    },
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
};

export default StudentDashboard;
