import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";

const API_URL = "https://localhost:7136/api";
const DEBOUNCE_DELAY = 300; // 300ms delay for debouncing

function StudentProgressTracker() {
  const { user } = useAuth();
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounced fetch function
  const debouncedFetch = useCallback((func) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, DEBOUNCE_DELAY);
    };
  }, []);

  const fetchAssessmentHistory = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      // Fetch all results
      const resultsRes = await axios.get(`${API_URL}/Result`);
      // Filter results for current user
      const userResults = resultsRes.data.filter(result => result.userId === user.userId);
      
      // Fetch all assessments to get assessment titles
      const assessmentsRes = await axios.get(`${API_URL}/Assessment`);
      
      // Fetch all courses
      const coursesRes = await axios.get(`${API_URL}/Course`);
      setCourses(coursesRes.data);
      
      // Map results to include assessment titles and calculate percentages
      const history = userResults.map(result => {
        const assessment = assessmentsRes.data.find(a => a.assessmentId === result.assessmentId);
        const maxScore = assessment ? JSON.parse(assessment.questions).length : 0;
        const percentage = Math.round((result.score / maxScore) * 100);
        const course = coursesRes.data.find(c => c.courseId === assessment?.courseId);
        
        return {
          attemptId: result.resultId,
          assessmentId: result.assessmentId,
          assessmentTitle: assessment?.title || 'Unknown Assessment',
          courseTitle: course?.title || 'Unknown Course',
          score: result.score,
          maxScore: maxScore,
          percentage: percentage,
          attemptDate: result.attemptDate
        };
      });
      
      setAssessmentHistory(history);
    } catch (error) {
      console.error("Error fetching assessment history:", error);
      toast.error("Failed to fetch assessment history");
      setAssessmentHistory([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
      setIsRefreshing(false);
    }
  }, [user.userId]);

  // Initial fetch
  useEffect(() => {
    fetchAssessmentHistory(true);
  }, [fetchAssessmentHistory]);

  // Set up polling with debouncing
  useEffect(() => {
    const debouncedFetchHistory = debouncedFetch(() => {
      if (!isRefreshing) {
        setIsRefreshing(true);
        fetchAssessmentHistory(false);
      }
    });

    const pollInterval = setInterval(debouncedFetchHistory, 5000);
    return () => clearInterval(pollInterval);
  }, [debouncedFetch, fetchAssessmentHistory, isRefreshing]);

  // Listen for custom event when assessment is completed
  useEffect(() => {
    const handleAssessmentComplete = () => {
      if (!isRefreshing) {
        setIsRefreshing(true);
        fetchAssessmentHistory(false);
      }
    };

    window.addEventListener('assessmentCompleted', handleAssessmentComplete);
    return () => window.removeEventListener('assessmentCompleted', handleAssessmentComplete);
  }, [fetchAssessmentHistory, isRefreshing]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <div style={styles.loadingText}>Loading assessment history...</div>
      </div>
    );
  }

  if (assessmentHistory.length === 0) {
    return (
      <div style={styles.emptyState}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
          alt="No Data"
          style={{ width: 90, marginBottom: 16, opacity: 0.7 }}
        />
        <div style={{ color: "#64748b", fontWeight: 500, fontSize: "1.1rem" }}>
          No assessment attempts yet. Complete assessments to track your progress.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {assessmentHistory.map((assessment) => (
          <div
            key={assessment.attemptId}
            style={styles.card}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>{assessment.assessmentTitle}</h3>
              <div style={styles.scoreBadge}>{assessment.percentage}%</div>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.courseTag}>{assessment.courseTitle}</div>
              <div style={styles.date}>
                {new Date(assessment.attemptDate).toLocaleDateString()}
              </div>
              <button
                style={styles.viewBtn}
                onClick={() => setSelectedAssessment(assessment)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedAssessment && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAssessment(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{selectedAssessment.assessmentTitle}</h3>
              <button
                onClick={() => setSelectedAssessment(null)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.courseTag}>{selectedAssessment.courseTitle}</div>
              <div style={styles.scoreCircle}>
                <div style={styles.scoreValue}>{selectedAssessment.percentage}%</div>
                <div style={styles.scoreLabel}>Score</div>
              </div>
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Marks Obtained</div>
                  <div style={styles.detailValue}>
                    {selectedAssessment.score}/{selectedAssessment.maxScore}
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Attempt Date</div>
                  <div style={styles.detailValue}>
                    {new Date(selectedAssessment.attemptDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "1rem",
    minHeight: "400px", // Prevent layout shift
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
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
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#64748b",
    fontSize: "1.1rem",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e7ff",
    minHeight: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
    minHeight: "400px", // Prevent layout shift
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    border: "1px solid #e0e7ff",
    height: "100%", // Ensure consistent card height
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    padding: "1.5rem",
    background: "#f8fafc",
    borderBottom: "1px solid #e0e7ff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    margin: 0,
    color: "#4f46e5",
    fontSize: "1.2rem",
    fontWeight: 600,
  },
  scoreBadge: {
    background: "#4f46e5",
    color: "#fff",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontWeight: 600,
  },
  cardBody: {
    padding: "1.5rem",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  courseTag: {
    display: "inline-block",
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "0.25rem 0.75rem",
    borderRadius: "8px",
    fontSize: "0.875rem",
    fontWeight: 500,
    marginBottom: "0.75rem",
  },
  date: {
    color: "#6b7280",
    fontSize: "0.875rem",
    marginBottom: "1rem",
  },
  viewBtn: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.75rem 1.5rem',
    fontSize: '1.1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
    width: '100%',
    textAlign: 'center',
    marginTop: 'auto', // Push button to bottom
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "500px",
    width: "90%",
    position: "relative",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  modalTitle: {
    margin: 0,
    color: "#4f46e5",
    fontSize: "1.25rem",
    fontWeight: 600,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    color: "#6b7280",
    cursor: "pointer",
    padding: "0.5rem",
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.5rem",
  },
  scoreCircle: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  scoreValue: {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  scoreLabel: {
    fontSize: "1rem",
    opacity: 0.9,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1.5rem",
    width: "100%",
  },
  detailItem: {
    textAlign: "center",
  },
  detailLabel: {
    color: "#6b7280",
    fontSize: "0.875rem",
    marginBottom: "0.5rem",
  },
  detailValue: {
    color: "#1f2937",
    fontSize: "1.125rem",
    fontWeight: 600,
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

export default StudentProgressTracker; 