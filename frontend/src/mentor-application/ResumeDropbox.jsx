import React, { useState } from 'react';

export default function ResumeUpload({ onResumeSelect, selectedResume }) {
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      // Validate file size (5MB limit for resumes)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('Resume file size must be less than 5MB');
        return;
      }
      
      // Validate file type - only resume formats
      const fileExtension = '.' + selectedFile.name.split('.').pop().toLowerCase();
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      
      if (!allowedTypes.includes(fileExtension)) {
        alert('Please upload a resume in PDF, DOC, or DOCX format');
        return;
      }
      
      // Call parent callback with selected file
      if (onResumeSelect) {
        onResumeSelect(selectedFile);
      }
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeResume = () => {
    if (onResumeSelect) {
      onResumeSelect(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        .resume-upload-container {
          max-width: 100%;
        }
        
        .upload-area {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          background-color: #fafafa;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .upload-area:hover,
        .upload-area.drag-active {
          border-color: #007bff;
          background-color: #f0f8ff;
        }
        
        .upload-icon {
          font-size: 40px;
          color: #ccc;
          margin-bottom: 12px;
        }
        
        .upload-text {
          color: #666;
          font-size: 16px;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .upload-subtext {
          color: #999;
          font-size: 14px;
        }
        
        .file-input {
          display: none;
        }
        
        .resume-preview {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .resume-info {
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .resume-icon {
          width: 40px;
          height: 40px;
          background: #28a745;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          margin-right: 12px;
        }
        
        .resume-details h4 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        
        .resume-details p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
        
        .remove-btn {
          padding: 6px 12px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .remove-btn:hover {
          background-color: #c82333;
        }
      `}</style>
      
      <div className="resume-upload-container">
        {!selectedResume ? (
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('resume-input').click()}
          >
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              Upload Your Resume
            </div>
            <div className="upload-subtext">
              Drag and drop or click to browse<br />
              PDF, DOC, DOCX • Max 5MB
            </div>
            <input
              id="resume-input"
              type="file"
              className="file-input"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="resume-preview">
            <div className="resume-info">
              <div className="resume-icon">
                {selectedResume.name.split('.').pop().toUpperCase()}
              </div>
              <div className="resume-details">
                <h4>{selectedResume.name}</h4>
                <p>{formatFileSize(selectedResume.size)}</p>
              </div>
            </div>
            <button 
              className="remove-btn" 
              onClick={removeResume}
              type="button"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}