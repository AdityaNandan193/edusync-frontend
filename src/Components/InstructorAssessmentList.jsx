import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import AssessmentForm from "./AssessmentForm";
import AssessmentViewer from "./AssessmentViewer";
import DeleteConfirmation from "../components/DeleteConfirmation";
import { toast } from "react-toastify";
import { fetchWithCache, invalidateCache, styles as sharedStyles } from "../utils/dataFetching";

const API_URL = "https://localhost:7136/api";

function InstructorAssessmentList({ courses, showAssessments, onNewAssessment }) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAssessment, setEditAssessment] = useState(null);
  const [viewAssessment, setViewAssessment] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, assessmentId: null });

  const fetchAssessments = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await fetchWithCache('Assessment', forceRefresh);
      
      // Filter assessments based on course IDs that belong to this instructor
      const courseIds = courses.map(course => course.courseId);
      const filtered = data.filter(assessment => 
        courseIds.includes(assessment.courseId)
      );
      
      // Check for new assessments
      if (assessments.length > 0 && filtered.length > assessments.length) {
        const newAssessment = filtered.find(assessment => 
          !assessments.some(a => a.assessmentId === assessment.assessmentId)
        );
        if (newAssessment && onNewAssessment) {
          onNewAssessment(newAssessment);
        }
      }
      
      setAssessments(filtered);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setAssessments([]);
      toast.error("Failed to fetch assessments");
    } finally {
      setLoading(false);
    }
  }, [courses, assessments.length, onNewAssessment]);

  useEffect(() => {
    if (showAssessments) {
      fetchAssessments();
    }
  }, [showAssessments, fetchAssessments]);

  const handleDelete = async (id) => {
    setDeleteConfirmation({ isOpen: true, assessmentId: id });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/Assessment/${deleteConfirmation.assessmentId}`);
      invalidateCache('Assessment');
      toast.success("Assessment deleted successfully");
      fetchAssessments(true);
    } catch (error) {
      console.error("Error deleting assessment:", error);
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        return;
      }
      toast.error("Failed to delete assessment");
    } finally {
      setDeleteConfirmation({ isOpen: false, assessmentId: null });
    }
  };

  const handleEdit = (assessment) => {
    setEditAssessment(assessment);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditAssessment(null);
    setShowForm(true);
  };

  const handleFormClose = (refresh = false) => {
    setShowForm(false);
    setEditAssessment(null);
    if (refresh) {
      invalidateCache('Assessment');
      fetchAssessments(true);
      toast.success(editAssessment ? "Assessment updated successfully" : "Assessment created successfully");
    }
  };

  // Only render the list if showAssessments is true
  if (!showAssessments) return null;

  return (
    <div style={styles.dashboardBg}>
      <div style={sharedStyles.header}>
        <button style={styles.addBtn} onClick={handleAdd}>
          + Add Assessment
        </button>
      </div>
      {loading && assessments.length === 0 ? (
        <div style={sharedStyles.loadingContainer}>
          <div style={sharedStyles.loadingSpinner}></div>
          <div style={{ color: '#4f46e5', fontWeight: 500 }}>Loading assessments...</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {assessments.length === 0 ? (
            <div style={styles.emptyState}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                alt="No Assessments"
                style={{ width: 90, marginBottom: 16, opacity: 0.7 }}
              />
              <div style={{ color: "#64748b", fontWeight: 500, fontSize: "1.1rem" }}>
                No assessments found. Click <b>+ Add Assessment</b> to create one!
              </div>
            </div>
          ) : (
            assessments.map((a) => (
              <div key={a.assessmentId} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>{a.title}</h4>
                  <span style={styles.scoreBadge}>{a.maxScore} pts</span>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.courseTag}>
                    {courses.find((c) => c.courseId === a.courseId)?.title || "Unknown"}
                  </div>
                </div>
                <div style={styles.actions}>
                  <button style={styles.viewBtn} onClick={() => setViewAssessment(a)}>View</button>
                  <button style={styles.editBtn} onClick={() => handleEdit(a)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(a.assessmentId)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {showForm && (
        <AssessmentForm
          assessment={editAssessment}
          onClose={handleFormClose}
          courses={courses}
        />
      )}
      {viewAssessment && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button
              style={styles.closeBtn}
              onClick={() => setViewAssessment(null)}
              title="Close"
            >
              ✕
            </button>
            <AssessmentViewer questions={viewAssessment.questions} />
          </div>
        </div>
      )}
      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, assessmentId: null })}
        onConfirm={confirmDelete}
        title="Delete Assessment"
        message="Are you sure you want to delete this assessment? This action cannot be undone."
      />
    </div>
  );
}

const styles = {
  dashboardBg: {
    minHeight: "100vh",
    background: "linear-gradient(120deg, #e0e7ff 0%, #f8fafc 100%)",
    padding: "2.5rem 0 3rem 0",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    maxWidth: 900,
    margin: "0 auto 2rem auto",
    padding: "0 1rem",
    gap: "1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "2rem",
    maxWidth: 900,
    margin: "0 auto",
    padding: "0 1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 4px 24px rgba(79,70,229,0.10)",
    padding: "1.5rem 1.2rem 1.2rem 1.2rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 180,
    border: "1.5px solid #e0e7ff",
    transition: "box-shadow 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: "1.2rem",
    color: "#3730a3",
    margin: 0,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  scoreBadge: {
    background: "#6366f1",
    color: "#fff",
    borderRadius: "12px",
    padding: "4px 14px",
    fontWeight: 600,
    fontSize: "1rem",
    marginLeft: 10,
    letterSpacing: "0.5px",
  },
  cardBody: {
    marginBottom: 16,
  },
  courseTag: {
    display: "inline-block",
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "4px 12px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 500,
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
  },
  viewBtn: {
    background: "#f1f5f9",
    color: "#3730a3",
    border: "1px solid #c7d2fe",
    borderRadius: "4px",
    padding: "7px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "background 0.2s",
  },
  editBtn: {
    background: "#e0e7ff",
    color: "#4f46e5",
    border: "1px solid #c7d2fe",
    borderRadius: "4px",
    padding: "7px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "background 0.2s",
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: "4px",
    padding: "7px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "background 0.2s",
  },
  addBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    boxShadow: "0 1px 4px rgba(79,70,229,0.08)",
    transition: "background 0.2s",
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
  emptyState: {
    gridColumn: "1/-1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "3rem 0",
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 2px 16px rgba(79,70,229,0.06)",
    border: "1.5px solid #e0e7ff",
  },
  loading: {
    gridColumn: "1/-1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "3rem 0",
    background: "#fff",
    borderRadius: "18px",
    boxShadow: "0 2px 16px rgba(79,70,229,0.06)",
    border: "1.5px solid #e0e7ff",
  },
};

export default InstructorAssessmentList;