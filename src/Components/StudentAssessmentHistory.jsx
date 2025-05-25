import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { API_URL } from '../config';

function StudentAssessmentHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentHistory();
  }, []);

  const fetchAssessmentHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/Assessment/history/${user.userId}`);
      setHistory(res.data);
    } catch (error) {
      console.error("Error fetching assessment history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading assessment history...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.sectionTitle}>Assessment History</h2>
      {history.length === 0 ? (
        <div style={styles.emptyState}>No assessment attempts yet.</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Assessment Title</th>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>Percentage</th>
                <th style={styles.th}>Attempt Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((attempt) => (
                <tr key={attempt.attemptId} style={styles.tr}>
                  <td style={styles.td}>{attempt.assessmentTitle}</td>
                  <td style={styles.td}>{attempt.score}/{attempt.maxScore}</td>
                  <td style={styles.td}>{attempt.percentage}%</td>
                  <td style={styles.td}>
                    {new Date(attempt.attemptDate).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  tableContainer: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    border: "1px solid #e0e7ff",
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
    "&:last-child": {
      borderBottom: "none",
    },
  },
  td: {
    padding: "1rem",
    color: "#1e293b",
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
};

export default StudentAssessmentHistory; 