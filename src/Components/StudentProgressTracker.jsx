import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";

const API_URL = "https://localhost:7136/api";

function StudentProgressTracker() {
  const { user } = useAuth();
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchAssessmentHistory();
  }, []);

  const fetchAssessmentHistory = async () => {
    try {
      setLoading(true);
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
      setAssessmentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading assessment history...</div>;
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
            onClick={() => setSelectedAssessment(assessment)}
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
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e7ff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
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
    fontSize: "0.9rem",
  },
  cardBody: {
    padding: "1.5rem",
  },
  courseTag: {
    display: "inline-block",
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: 500,
    marginBottom: "0.75rem",
  },
  date: {
    color: "#64748b",
    fontSize: "0.9rem",
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
    borderRadius: "16px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "1.5rem",
    background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.3rem",
    fontWeight: 600,
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "1.5rem",
    cursor: "pointer",
    padding: "0.5rem",
    "&:hover": {
      opacity: 0.8,
    },
  },
  modalBody: {
    padding: "2rem",
  },
  scoreCircle: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    margin: "0 auto 2rem",
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
  },
  detailItem: {
    textAlign: "center",
  },
  detailLabel: {
    color: "#64748b",
    fontSize: "0.9rem",
    marginBottom: "0.5rem",
  },
  detailValue: {
    color: "#1e293b",
    fontSize: "1.1rem",
    fontWeight: 600,
  },
};

export default StudentProgressTracker; 