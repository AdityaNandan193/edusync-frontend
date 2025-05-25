import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { API_URL } from '../config';

function InstructorAnalytics() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all results
      const resultsRes = await axios.get(`${API_URL}/Result`);
      // Fetch all assessments
      const assessmentsRes = await axios.get(`${API_URL}/Assessment`);
      // Fetch all courses
      const coursesRes = await axios.get(`${API_URL}/Course`);
      
      // Filter courses to only include those created by the logged-in instructor
      const instructorCourses = coursesRes.data.filter(
        course => course.instructorId === user.userId
      );
      setCourses(instructorCourses);

      // Filter assessments to only include those from the instructor's courses
      const instructorAssessments = assessmentsRes.data.filter(assessment =>
        instructorCourses.some(course => course.courseId === assessment.courseId)
      );
      setAssessments(instructorAssessments);

      // Filter results to only include those from the instructor's assessments
      const instructorResults = resultsRes.data.filter(result =>
        instructorAssessments.some(assessment => assessment.assessmentId === result.assessmentId)
      );
      setResults(instructorResults);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setResults([]);
      setAssessments([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentStats = (assessmentId) => {
    const assessmentResults = results.filter(r => r.assessmentId === assessmentId);
    if (assessmentResults.length === 0) return null;

    const totalAttempts = assessmentResults.length;
    const totalScore = assessmentResults.reduce((sum, r) => sum + r.score, 0);
    const avgScore = totalScore / totalAttempts;
    const maxScore = assessmentResults[0].assessment?.questions ? 
      JSON.parse(assessmentResults[0].assessment.questions).length : 0;
    const avgPercentage = Math.round((avgScore / maxScore) * 100);

    return {
      totalAttempts,
      avgScore: avgScore.toFixed(1),
      maxScore,
      avgPercentage
    };
  };

  if (loading) {
    return <div style={styles.loading}>Loading analytics...</div>;
  }

  if (assessments.length === 0) {
    return (
      <div style={styles.emptyState}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
          alt="No Data"
          style={{ width: 90, marginBottom: 16, opacity: 0.7 }}
        />
        <div style={{ color: "#64748b", fontWeight: 500, fontSize: "1.1rem" }}>
          No assessment data available yet. Create courses and assessments to see student performance analytics.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.sectionTitle}>Student Performance Analytics</h2>
      
      <div style={styles.grid}>
        {assessments.map((assessment) => {
          const stats = getAssessmentStats(assessment.assessmentId);
          if (!stats) return null;

          return (
            <div key={assessment.assessmentId} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{assessment.title}</h3>
                <div style={styles.courseTag}>
                  {courses.find(c => c.courseId === assessment.courseId)?.title || 'Unknown Course'}
                </div>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Total Attempts:</span>
                  <span style={styles.statValue}>{stats.totalAttempts}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Average Score:</span>
                  <span style={styles.statValue}>
                    {stats.avgScore}/{stats.maxScore}
                  </span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Average Percentage:</span>
                  <span style={styles.statValue}>{stats.avgPercentage}%</span>
                </div>
              </div>
              <div style={styles.actions}>
                <button
                  onClick={() => setSelectedAssessment(assessment)}
                  style={styles.viewButton}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedAssessment && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                Detailed Results: {selectedAssessment.title}
              </h3>
              <button
                onClick={() => setSelectedAssessment(null)}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Score</th>
                    <th style={styles.th}>Percentage</th>
                    <th style={styles.th}>Attempt Date</th>
                  </tr>
                </thead>
                <tbody>
                  {results
                    .filter(r => r.assessmentId === selectedAssessment.assessmentId)
                    .map((result) => {
                      const maxScore = JSON.parse(selectedAssessment.questions).length;
                      const percentage = Math.round((result.score / maxScore) * 100);
                      
                      return (
                        <tr key={result.resultId} style={styles.tr}>
                          <td style={styles.td}>{result.user?.name || 'Unknown Student'}</td>
                          <td style={styles.td}>{result.score}/{maxScore}</td>
                          <td style={styles.td}>{percentage}%</td>
                          <td style={styles.td}>
                            {new Date(result.attemptDate).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  loading: {
    textAlign: "center",
    padding: "2rem",
    color: "#4f46e5",
    fontSize: "1.1rem",
  },
  sectionTitle: {
    color: "#4f46e5",
    fontSize: "1.8rem",
    marginBottom: "2rem",
    fontWeight: 700,
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
    border: "1px solid #e0e7ff",
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
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.75rem",
    padding: "0.5rem 0",
    borderBottom: "1px solid #f1f5f9",
  },
  statLabel: {
    color: "#64748b",
    fontWeight: 500,
  },
  statValue: {
    color: "#4f46e5",
    fontWeight: 600,
  },
  actions: {
    padding: "1rem 1.5rem",
    background: "#f8fafc",
    borderTop: "1px solid #e0e7ff",
  },
  viewButton: {
    width: "100%",
    padding: "0.75rem",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background 0.2s",
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
    width: "90%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
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
    fontSize: "1.5rem",
    fontWeight: 600,
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    color: "#64748b",
    cursor: "pointer",
    padding: "0.5rem",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    background: "#f8fafc",
    padding: "1rem",
    textAlign: "left",
    color: "#4f46e5",
    fontWeight: 600,
    borderBottom: "2px solid #e0e7ff",
  },
  tr: {
    borderBottom: "1px solid #e0e7ff",
  },
  td: {
    padding: "1rem",
    color: "#1e293b",
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginTop: '2rem',
  },
  courseTag: {
    display: 'inline-block',
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 500,
    marginTop: '0.5rem',
  },
};

export default InstructorAnalytics; 