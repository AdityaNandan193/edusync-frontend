import React, { useState } from "react";
import axios from "axios";
import Notification from "./Notification";
import { API_URL } from '../config';

function CourseForm({ course, onClose, instructorId }) {
  const [title, setTitle] = useState(course ? course.title : "");
  const [description, setDescription] = useState(course ? course.description : "");
  const [mediaUrl, setMediaUrl] = useState(course ? course.mediaUrl : "");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const validateUrl = (url) => {
    if (!url) return true; // URL is optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setNotification({ message: "Please select a file first", type: "error" });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_URL}/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = response.data.fileUrl;
      setMediaUrl(uploadedUrl);
      setNotification({ message: "File uploaded successfully!", type: "success" });
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
      setNotification({ message: `Error uploading file: ${errorMessage}`, type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validate URL format
    if (mediaUrl && !validateUrl(mediaUrl)) {
      setErrors({ mediaUrl: "Please enter a valid URL (http://, https://, or ftp://)" });
      setLoading(false);
      return;
    }

    const payload = {
      Title: title,
      Description: description,
      MediaUrl: mediaUrl,
      InstructorId: instructorId
    };

    try {
      if (course) {
        await axios.put(`${API_URL}/Course/${course.courseId}`, payload);
        setNotification({ message: "Course updated successfully!", type: "success" });
        setTimeout(() => onClose(true), 1000);
      } else {
        await axios.post(`${API_URL}/Course`, payload);
        setNotification({ message: "Course created successfully!", type: "success" });
        setTimeout(() => onClose(true), 1000);
      }
    } catch (error) {
      console.error("Error saving course:", error.response?.data);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        setNotification({ message: "Error saving course", type: "error" });
      } else {
        setNotification({ 
          message: error.response?.data?.message || "Error saving course", 
          type: "error" 
        });
      }
    } finally {
      setLoading(false);
    }
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
        <h3>{course ? "Edit Course" : "Add Course"}</h3>
        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          style={styles.input}
        />
        {errors.Title && <div style={styles.error}>{errors.Title}</div>}
        
        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          style={styles.input}
        />

        <div style={styles.fileUploadSection}>
          <h4 style={styles.sectionTitle}>Course Material</h4>
          <div style={styles.fileUploadContainer}>
            <input
              type="file"
              onChange={handleFileChange}
              style={styles.fileInput}
              id="fileInput"
            />
            <label htmlFor="fileInput" style={styles.fileInputLabel}>
              {selectedFile ? selectedFile.name : "Choose File"}
            </label>
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
              style={{
                ...styles.uploadButton,
                opacity: !selectedFile || uploading ? 0.7 : 1,
                cursor: !selectedFile || uploading ? "not-allowed" : "pointer"
              }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {mediaUrl && (
            <div style={styles.mediaUrlContainer}>
              <p style={styles.mediaUrlLabel}>Uploaded Material:</p>
              <div style={styles.mediaUrlWrapper}>
                <input
                  type="text"
                  value={mediaUrl}
                  readOnly
                  style={styles.mediaUrlInput}
                />
              </div>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.viewLink}
              >
                View Material
              </a>
            </div>
          )}
        </div>
        
        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={() => onClose(false)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Saving..." : (course ? "Update Course" : "Create Course")}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  form: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  error: {
    color: "red",
    fontSize: "0.875rem",
    marginTop: "-0.5rem",
    marginBottom: "1rem",
  },
  fileUploadSection: {
    marginBottom: "1.5rem",
    padding: "1rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  sectionTitle: {
    marginBottom: "1rem",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
  fileUploadContainer: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
    marginBottom: "1rem",
  },
  fileInput: {
    display: "none",
  },
  fileInputLabel: {
    padding: "0.5rem 1rem",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  uploadButton: {
    padding: "0.5rem 1rem",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  mediaUrlContainer: {
    marginTop: "1rem",
  },
  mediaUrlLabel: {
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
    color: "#666",
  },
  mediaUrlWrapper: {
    display: "flex",
    gap: "0.5rem",
  },
  mediaUrlInput: {
    flex: 1,
    padding: "0.5rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "0.875rem",
    backgroundColor: "#f8f8f8",
  },
  viewLink: {
    display: "block",
    marginTop: "0.5rem",
    color: "#4f46e5",
    textDecoration: "none",
    fontSize: "0.875rem",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  cancelButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  submitButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default CourseForm;