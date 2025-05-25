import React, { useState, useEffect } from "react";
import LogoutButton from "../Components/LogoutButton";
import InstructorCourseList from "../Components/InstructorCourseList";
import InstructorAssessmentList from "../Components/InstructorAssessmentList";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import InstructorAnalytics from "../Components/InstructorAnalytics";
import LoadingSpinner from "../Components/LoadingSpinner";
import Notification from "../Components/Notification";
import { API_URL } from '../config';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const instructorName = user?.name || "Instructor";
  const instructorRole = user?.role || "Instructor";
  const [courses, setCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);
  const [showAssessments, setShowAssessments] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/Course`);
      const filtered = res.data.filter(
        (course) => course.instructorId === user?.userId
      );
      
      // Check for new courses
      if (courses.length > 0 && filtered.length > courses.length) {
        const newCourse = filtered.find(course => !courses.some(c => c.courseId === course.courseId));
        if (newCourse) {
          showNotification(`New course "${newCourse.title}" has been added!`);
        }
      }
      
      setCourses(filtered);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleCoursesUpdate = (updatedCourses) => {
    // Check if there's a new course
    if (updatedCourses.length > courses.length) {
      const newCourse = updatedCourses.find(course => !courses.some(c => c.courseId === course.courseId));
      if (newCourse) {
        showNotification(`New course "${newCourse.title}" has been added!`);
      }
    }
    setCourses(updatedCourses);
  };

  const handleNewAssessment = (assessment) => {
    showNotification(`New assessment "${assessment.title}" has been added!`);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return "I"; // Return "I" for Instructor if name is undefined or invalid
    const parts = name.trim().split(" ");
    if (parts.length === 0 || !parts[0]) return "I";
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSectionToggle = (section) => {
    switch(section) {
      case 'courses':
        setShowCourses(!showCourses);
        setShowAssessments(false);
        setShowAnalytics(false);
        break;
      case 'assessments':
        setShowCourses(false);
        setShowAssessments(!showAssessments);
        setShowAnalytics(false);
        break;
      case 'analytics':
        setShowCourses(false);
        setShowAssessments(false);
        setShowAnalytics(!showAnalytics);
        break;
      default:
        break;
    }
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
      
      {/* Header Bar */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Welcome, {instructorName}!</h2>
          <div style={styles.subtitle}>Empower your students. Manage your courses and assessments.</div>
        </div>
        <div style={styles.avatarWrapper}>
          <div
            style={styles.avatar}
            onClick={() => setAvatarMenuOpen((prev) => !prev)}
            title="Account"
          >
            {getInitials(instructorName)}
          </div>
          {avatarMenuOpen && (
            <div style={styles.avatarMenu}>
              <div style={styles.avatarMenuHeader}>
                <div style={styles.avatarLarge}>{getInitials(instructorName)}</div>
                <div>
                  <div style={styles.avatarMenuName}>{instructorName}</div>
                  <div style={styles.avatarMenuRole}>{instructorRole}</div>
                </div>
              </div>
              <div style={styles.avatarMenuDivider} />
              <LogoutButton style={styles.logoutButton} />
            </div>
          )}
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main style={styles.main}>
        {/* Course Manager Section */}
        <section style={styles.section}>
          <div
            style={{
              ...styles.assessmentHeader,
              background: showCourses
                ? "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)"
                : "#f1f5f9",
              color: showCourses ? "#fff" : "#4f46e5",
            }}
            onClick={() => handleSectionToggle('courses')}
            tabIndex={0}
            role="button"
            aria-pressed={showCourses}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect width="24" height="24" rx="6" fill={showCourses ? "#fff" : "#6366f1"} opacity="0.15"/>
                <path d="M7 10h10M7 14h6" stroke={showCourses ? "#fff" : "#6366f1"} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: "1.15rem" }}>Course Manager</span>
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
              ...styles.assessmentContent,
              maxHeight: showCourses ? 2000 : 0,
              padding: showCourses ? "2rem 0 0 0" : "0",
              opacity: showCourses ? 1 : 0,
              transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
              overflow: "hidden"
            }}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              showCourses && <InstructorCourseList onCoursesUpdate={handleCoursesUpdate} />
            )}
          </div>
        </section>

        {/* Assessment Manager Section */}
        <section style={styles.section}>
          <div
            style={{
              ...styles.assessmentHeader,
              background: showAssessments
                ? "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)"
                : "#f1f5f9",
              color: showAssessments ? "#fff" : "#4f46e5",
            }}
            onClick={() => handleSectionToggle('assessments')}
            tabIndex={0}
            role="button"
            aria-pressed={showAssessments}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect width="24" height="24" rx="6" fill={showAssessments ? "#fff" : "#6366f1"} opacity="0.15"/>
                <path d="M7 10h10M7 14h6" stroke={showAssessments ? "#fff" : "#6366f1"} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: "1.15rem" }}>Assessment Manager</span>
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
              ...styles.assessmentContent,
              maxHeight: showAssessments ? 2000 : 0,
              padding: showAssessments ? "2rem 0 0 0" : "0",
              opacity: showAssessments ? 1 : 0,
              transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
              overflow: "hidden"
            }}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              showAssessments && (
                <InstructorAssessmentList 
                  courses={courses} 
                  showAssessments={showAssessments}
                  onNewAssessment={handleNewAssessment}
                />
              )
            )}
          </div>
        </section>

        {/* Analytics Section */}
        <section style={styles.section}>
          <div
            style={{
              ...styles.assessmentHeader,
              background: showAnalytics
                ? "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)"
                : "#f1f5f9",
              color: showAnalytics ? "#fff" : "#4f46e5",
            }}
            onClick={() => handleSectionToggle('analytics')}
            tabIndex={0}
            role="button"
            aria-pressed={showAnalytics}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect width="24" height="24" rx="6" fill={showAnalytics ? "#fff" : "#6366f1"} opacity="0.15"/>
                <path d="M7 10h10M7 14h6" stroke={showAnalytics ? "#fff" : "#6366f1"} strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: "1.15rem" }}>Student Performance Analytics</span>
            </span>
            <span
              style={{
                ...styles.triangle,
                transform: showAnalytics ? "rotate(180deg)" : "rotate(0deg)",
                color: showAnalytics ? "#fff" : "#6366f1"
              }}
            >
              ▼
            </span>
          </div>
          <div
            style={{
              ...styles.assessmentContent,
              maxHeight: showAnalytics ? 2000 : 0,
              padding: showAnalytics ? "2rem 0 0 0" : "0",
              opacity: showAnalytics ? 1 : 0,
              transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
              overflow: "hidden"
            }}
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              showAnalytics && <InstructorAnalytics />
            )}
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
  avatarWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "#fff",
    color: "#6366f1",
    fontWeight: 700,
    fontSize: "1.7rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 12px rgba(79,70,229,0.13)",
    border: "3px solid #e0e7ff",
    transition: "box-shadow 0.2s",
    userSelect: "none",
  },
  avatarMenu: {
    position: "absolute",
    top: "calc(100% + 1rem)",
    right: 0,
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    width: "280px",
    zIndex: 1000,
    overflow: "hidden",
  },
  avatarMenuHeader: {
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  avatarLarge: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "#fff",
    fontWeight: 700,
    fontSize: "1.4rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMenuName: {
    fontWeight: 600,
    fontSize: "1.1rem",
    color: "#1f2937",
  },
  avatarMenuRole: {
    color: "#6b7280",
    fontSize: "0.9rem",
    marginTop: "2px",
  },
  avatarMenuDivider: {
    height: "1px",
    background: "#e5e7eb",
    margin: "0.5rem 0",
  },
  logoutButton: {
    padding: "0.75rem 1.5rem",
    background: "#ef4444",
    border: "none",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
    textAlign: "center",
    transition: "background-color 0.2s",
    borderRadius: "8px",
    margin: "0.5rem 1.5rem",
    width: "calc(100% - 3rem)",
    "&:hover": {
      background: "#dc2626",
    },
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 3rem",
  },
  section: {
    marginBottom: "2rem",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 2px 16px rgba(79,70,229,0.06)",
    padding: "2.2rem 2rem",
    position: "relative",
  },
  assessmentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2rem",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: 700,
    fontSize: "1.2rem",
    boxShadow: "0 2px 8px rgba(79,70,229,0.08)",
    marginBottom: "1rem",
    userSelect: "none",
    border: "1.5px solid #e0e7ff",
  },
  triangle: {
    fontSize: "1.1rem",
    marginLeft: "1rem",
    transition: "transform 0.3s ease",
  },
  assessmentContent: {
    padding: "2rem 0 0 0",
    background: "#fff",
    borderRadius: "0 0 12px 12px",
    boxShadow: "0 2px 16px rgba(79,70,229,0.06)",
    marginTop: 0,
    marginBottom: "1.5rem",
    transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
  },
};

export default InstructorDashboard;