import React from "react";

function AssessmentViewer({ questions }) {
  // If questions is a string, parse it
  let parsedQuestions = [];
  try {
    parsedQuestions = typeof questions === "string" ? JSON.parse(questions) : questions;
  } catch {
    return <div style={styles.error}>Invalid questions format.</div>;
  }

  if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
    return <div style={styles.error}>No questions to display.</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Assessment Preview</h2>
      {parsedQuestions.map((q, idx) => (
        <div key={idx} style={styles.questionBlock}>
          <div style={styles.questionText}>
            <span style={styles.qNumber}>Q{idx + 1}.</span> {q.question}
          </div>
          <ul style={styles.optionsList}>
            {q.options.map((opt, optIdx) => (
              <li
                key={optIdx}
                style={{
                  ...styles.option,
                  ...(q.correctIndex === optIdx ? styles.correct : {}),
                }}
              >
                <span style={styles.optionLabel}>
                  {String.fromCharCode(65 + optIdx)}.
                </span>{" "}
                {opt}
                {q.correctIndex === optIdx && (
                  <span style={styles.correctBadge}>Correct</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    background: "#f8fafc",
    borderRadius: "18px",
    padding: "2rem",
    maxWidth: "700px",
    margin: "0 auto",
    boxShadow: "0 2px 16px rgba(79,70,229,0.08)",
  },
  heading: {
    color: "#4f46e5",
    fontWeight: 700,
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  questionBlock: {
    background: "#fff",
    borderRadius: "10px",
    padding: "1.2rem 1rem",
    marginBottom: "1.5rem",
    border: "1px solid #e0e7ff",
    boxShadow: "0 1px 4px rgba(79,70,229,0.04)",
  },
  questionText: {
    fontWeight: 600,
    fontSize: "1.1rem",
    marginBottom: "0.7rem",
    color: "#22223b",
    display: "flex",
    alignItems: "center",
  },
  qNumber: {
    background: "#6366f1",
    color: "#fff",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: "1rem",
    marginRight: "0.7rem",
  },
  optionsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  option: {
    padding: "0.6rem 1rem",
    borderRadius: "6px",
    marginBottom: "0.5rem",
    background: "#f1f5f9",
    color: "#22223b",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    position: "relative",
    border: "1px solid #e0e7ff",
  },
  correct: {
    background: "#e0fce6",
    color: "#15803d",
    border: "1.5px solid #22c55e",
  },
  optionLabel: {
    fontWeight: 700,
    marginRight: "0.7rem",
    color: "#6366f1",
  },
  correctBadge: {
    marginLeft: "auto",
    background: "#22c55e",
    color: "#fff",
    borderRadius: "12px",
    padding: "2px 12px",
    fontSize: "0.9rem",
    fontWeight: 600,
    marginRight: "0.5rem",
  },
  error: {
    color: "#ef4444",
    background: "#fef2f2",
    padding: "1rem",
    borderRadius: "8px",
    textAlign: "center",
  },
};

export default AssessmentViewer;