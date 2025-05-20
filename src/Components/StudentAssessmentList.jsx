import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = "https://localhost:7136/api";

function StudentAssessmentList({ onNewAssessment }) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchAssessments();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${API_URL}/Course`);
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/Assessment`);
      setAssessments(res.data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      if (error.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
      }
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAttempt = async (assessment) => {
    try {
      const res = await axios.get(`${API_URL}/Assessment/${assessment.assessmentId}`);
      setSelectedAssessment(res.data);
      setAnswers({});
      setResult(null);
    } catch (error) {
      alert("Error loading assessment. Please try again.");
    }
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (!selectedAssessment) return;

    try {
      // Convert answers object to array of selected answers
      const selectedAnswers = Object.entries(answers).map(([_, optionIndex]) => optionIndex);

      const payload = {
        assessmentId: selectedAssessment.assessmentId,
        userId: user.userId,
        selectedAnswers: selectedAnswers
      };

      console.log('Submitting assessment with payload:', payload);
      const res = await axios.post(`${API_URL}/Result/attempt`, payload);
      console.log('Assessment submission response:', res.data);
      
      // Calculate percentage
      const questions = JSON.parse(selectedAssessment.questions);
      const percentage = Math.round((res.data.score / questions.length) * 100);
      
      setResult({
        ...res.data,
        percentage,
        maxScore: questions.length
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      alert("Error submitting assessment. Please try again.");
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading assessments...</div>;
  }

  if (selectedAssessment) {
    const questions = JSON.parse(selectedAssessment.questions);
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{selectedAssessment.title}</h2>
          <button 
            onClick={() => setSelectedAssessment(null)} 
            style={styles.backButton}
          >
            Back to List
          </button>
        </div>

        {result ? (
          <div style={styles.resultContainer}>
            <h3 style={styles.resultTitle}>Assessment Result</h3>
            <div style={styles.resultDetails}>
              <p>Score: {result.score}/{selectedAssessment.maxScore}</p>
              <p>Percentage: {result.percentage}%</p>
            </div>
            <button 
              onClick={() => {
                setSelectedAssessment(null);
                setResult(null);
              }}
              style={styles.button}
            >
              Back to Assessments
            </button>
          </div>
        ) : (
          <div style={styles.questionsContainer}>
            {questions.map((question, qIndex) => (
              <div key={qIndex} style={styles.questionBlock}>
                <h3 style={styles.questionText}>
                  <span style={styles.qNumber}>{qIndex + 1}</span>
                  {question.question}
                </h3>
                <ul style={styles.optionsList}>
                  {question.options.map((option, oIndex) => (
                    <li
                      key={oIndex}
                      style={{
                        ...styles.option,
                        ...(answers[qIndex] === oIndex && styles.selectedOption)
                      }}
                      onClick={() => handleAnswerSelect(qIndex, oIndex)}
                    >
                      <span style={styles.optionLabel}>{String.fromCharCode(65 + oIndex)}.</span>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button 
              onClick={handleSubmit}
              style={styles.submitButton}
              disabled={Object.keys(answers).length !== questions.length}
            >
              Submit Assessment
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.sectionTitle}>Available Assessments</h2>
      {assessments.length === 0 ? (
        <div style={styles.emptyState}>No assessments available at the moment.</div>
      ) : (
        <div style={styles.grid}>
          {assessments.map((assessment) => (
            <div key={assessment.assessmentId} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{assessment.title}</h3>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.courseTag}>
                  {courses.find(c => c.courseId === assessment.courseId)?.title || 'Unknown Course'}
                </div>
                <p style={styles.assessmentInfo}>
                  Total Questions: {JSON.parse(assessment.questions).length}
                </p>
                <p style={styles.assessmentInfo}>
                  Maximum Score: {assessment.maxScore}
                </p>
              </div>
              <div style={styles.actions}>
                <button
                  onClick={() => handleAttempt(assessment)}
                  style={styles.attemptButton}
                >
                  Attempt Assessment
                </button>
              </div>
            </div>
          ))}
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
    transition: "transform 0.2s",
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
  assessmentInfo: {
    margin: "0.5rem 0",
    color: "#64748b",
    fontSize: "0.95rem",
  },
  actions: {
    padding: "1rem 1.5rem",
    background: "#f8fafc",
    borderTop: "1px solid #e0e7ff",
  },
  attemptButton: {
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
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "#64748b",
    fontSize: "1.1rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  title: {
    color: "#4f46e5",
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: 700,
  },
  backButton: {
    padding: "0.5rem 1rem",
    background: "#f1f5f9",
    color: "#4f46e5",
    border: "1px solid #e0e7ff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },
  questionsContainer: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  questionBlock: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e0e7ff",
  },
  questionText: {
    color: "#1e293b",
    fontSize: "1.1rem",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
  },
  qNumber: {
    background: "#4f46e5",
    color: "#fff",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "0.75rem",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  optionsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  option: {
    padding: "0.75rem 1rem",
    marginBottom: "0.5rem",
    background: "#f8fafc",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid #e0e7ff",
    display: "flex",
    alignItems: "center",
  },
  selectedOption: {
    background: "#e0e7ff",
    borderColor: "#4f46e5",
  },
  optionLabel: {
    fontWeight: 600,
    marginRight: "0.75rem",
    color: "#4f46e5",
  },
  submitButton: {
    width: "100%",
    padding: "1rem",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1.1rem",
    marginTop: "1rem",
    transition: "background 0.2s",
  },
  resultContainer: {
    background: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e0e7ff",
  },
  resultTitle: {
    color: "#4f46e5",
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
  },
  resultDetails: {
    marginBottom: "2rem",
  },
  button: {
    padding: "0.75rem 1.5rem",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "background 0.2s",
  },
  courseTag: {
    display: "inline-block",
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "4px 12px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 500,
    marginBottom: "12px",
  },
};

export default StudentAssessmentList; 