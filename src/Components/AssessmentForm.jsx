import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import Notification from "./Notification";
import { API_URL } from '../config';

function AssessmentForm({ assessment, onClose, courses }) {
  const { user } = useAuth();
  const [courseId, setCourseId] = useState(assessment ? assessment.courseId : (courses[0]?.courseId || ""));
  const [title, setTitle] = useState(assessment ? assessment.title : "");
  const [maxScore, setMaxScore] = useState(assessment ? assessment.maxScore : 1);
  const [questions, setQuestions] = useState(() => {
    if (assessment && assessment.questions) {
      try {
        const parsed = JSON.parse(assessment.questions);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [{
          question: assessment.questions,
          options: ["", "", "", ""],
          correctIndex: 0,
        }];
      }
    }
    return [{
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
    }];
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Add event listener for browser back button
  useEffect(() => {
    const handleBackButton = (e) => {
      e.preventDefault();
      handleClose();
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, []);

  const handleQuestionChange = (idx, value) => {
    setQuestions(qs => {
      const copy = [...qs];
      copy[idx].question = value;
      return copy;
    });
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    setQuestions(qs => {
      const copy = [...qs];
      copy[qIdx].options[optIdx] = value;
      return copy;
    });
  };

  const handleCorrectIndexChange = (qIdx, value) => {
    setQuestions(qs => {
      const copy = [...qs];
      copy[qIdx].correctIndex = parseInt(value, 10);
      return copy;
    });
  };

  const addQuestion = (idx) => {
    setQuestions(qs => {
      const copy = [...qs];
      copy.splice(idx + 1, 0, { question: "", options: ["", "", "", ""], correctIndex: 0 });
      return copy;
    });
  };

  const removeQuestion = (idx) => {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!title.trim() || !courseId) {
      setNotification({ message: "Title and course are required.", type: "error" });
      setLoading(false);
      return;
    }
    if (questions.some(q => !q.question.trim() || q.options.some(opt => !opt.trim()))) {
      setNotification({ message: "All questions and options are required.", type: "error" });
      setLoading(false);
      return;
    }

    const payload = {
      Title: title,
      Questions: JSON.stringify(questions),
      MaxScore: questions.length
    };

    try {
      if (assessment) {
        await axios.put(`${API_URL}/Assessment/${assessment.assessmentId}`, payload);
        setNotification({ message: "Assessment updated successfully!", type: "success" });
        setTimeout(() => onClose(true), 1000);
      } else {
        await axios.post(`${API_URL}/Assessment`, {
          ...payload,
          CourseId: courseId
        });
        setNotification({ message: "Assessment created successfully!", type: "success" });
        setTimeout(() => onClose(true), 1000);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setNotification({ message: "Your session has expired. Please log in again.", type: "error" });
        setTimeout(() => onClose(false), 1000);
      } else {
        setNotification({ message: "Error saving assessment", type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose(false);
  };

  return (
    <div style={styles.overlay}>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.header}>
          <button
            type="button"
            onClick={handleClose}
            style={styles.backBtn}
            title="Back to Dashboard"
          >
            ← Back
          </button>
          <h2 style={styles.heading}>
            {assessment ? "Edit Assessment" : "Add New Assessment"}
          </h2>
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Course:</label>
          <select
            value={courseId}
            onChange={e => setCourseId(e.target.value)}
            style={styles.select}
            required
          >
            {courses.map(c => (
              <option key={c.courseId} value={c.courseId}>{c.title}</option>
            ))}
          </select>
        </div>
        <div style={styles.row}>
          <label style={styles.label}>Title:</label>
          <input
            type="text"
            placeholder="Assessment Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.mcqScroll}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#4f46e5", textAlign: "center" }}>MCQ Questions</h3>
          {questions.map((q, qIdx) => (
            <div key={qIdx} style={styles.questionBlock}>
              <div style={styles.qHeader}>
                <span style={styles.qNumber}>Q{qIdx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIdx)}
                  disabled={questions.length === 1}
                  style={styles.removeBtn}
                  title="Remove this question"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder={`Enter question ${qIdx + 1}`}
                value={q.question}
                onChange={e => handleQuestionChange(qIdx, e.target.value)}
                required
                style={styles.input}
              />
              <div>
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} style={styles.optionRow}>
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={q.correctIndex === optIdx}
                      onChange={() => handleCorrectIndexChange(qIdx, optIdx)}
                      style={styles.radio}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${optIdx + 1}`}
                      value={opt}
                      onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                      required
                      style={styles.optionInput}
                    />
                    <span style={styles.correctLabel}>
                      {q.correctIndex === optIdx ? "Correct" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => addQuestion(qIdx)}
                  style={styles.addBtn}
                >
                  + Add Question
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.actions}>
          <button type="submit" disabled={loading} style={styles.saveBtn}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={handleClose} style={styles.cancelBtn}>
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
    background: "rgba(0,0,0,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  form: {
    background: "#fff",
    padding: "2.5rem 2rem",
    borderRadius: "24px",
    minWidth: "370px",
    maxWidth: "98vw",
    width: "100%",
    maxHeight: "95vh",
    overflowY: "auto",
    boxShadow: "0 8px 32px rgba(79,70,229,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
    border: "1.5px solid #e0e7ff",
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "0.5rem",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 0,
    background: "#f1f5f9",
    color: "#4f46e5",
    border: "1px solid #e0e7ff",
    borderRadius: "4px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    transition: "background 0.2s",
  },
  heading: {
    margin: 0,
    marginBottom: "0.5rem",
    color: "#4f46e5",
    fontWeight: 700,
    fontSize: "1.7rem",
    letterSpacing: "0.5px",
    textAlign: "center",
    width: "100%",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "0.5rem",
  },
  label: {
    minWidth: "80px",
    fontWeight: 500,
    color: "#374151",
  },
  select: {
    flex: 1,
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #c7d2fe",
    background: "#f8fafc",
    color: "#22223b",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #c7d2fe",
    background: "#f8fafc",
    color: "#22223b",
    marginBottom: 0,
  },
  mcqScroll: {
    maxHeight: "320px",
    overflowY: "auto",
    marginBottom: "1rem",
    padding: "0.5rem 0.5rem 0.5rem 0",
    background: "#f1f5f9",
    borderRadius: "12px",
    border: "1px solid #e0e7ff",
  },
  mcqHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  questionBlock: {
    background: "#fff",
    borderRadius: "12px",
    padding: "1.2rem",
    marginBottom: "1.2rem",
    border: "1px solid #e0e7ff",
    boxShadow: "0 2px 8px rgba(79,70,229,0.06)",
    transition: "box-shadow 0.2s",
  },
  qHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
  },
  qNumber: {
    background: "#6366f1",
    color: "#fff",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "1rem",
    marginRight: "0.5rem",
  },
  removeBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    fontSize: "1.1rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    marginBottom: 0,
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  radio: {
    accentColor: "#4f46e5",
    marginRight: "0.5rem",
  },
  optionInput: {
    flex: 1,
    padding: "8px",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #c7d2fe",
    background: "#f8fafc",
    color: "#22223b",
  },
  correctLabel: {
    color: "#22c55e",
    fontWeight: 500,
    fontSize: "0.95rem",
    marginLeft: "0.5rem",
    minWidth: "60px",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "0.5rem",
  },
  saveBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "10px 22px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    boxShadow: "0 1px 4px rgba(79,70,229,0.08)",
    transition: "background 0.2s",
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#333",
    border: "none",
    borderRadius: "4px",
    padding: "10px 22px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    boxShadow: "0 1px 4px rgba(79,70,229,0.04)",
    transition: "background 0.2s",
  },
  addBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "7px 18px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
    boxShadow: "0 1px 4px rgba(34,197,94,0.08)",
    transition: "background 0.2s",
  },
};

export default AssessmentForm;