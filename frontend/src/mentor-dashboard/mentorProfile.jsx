import React, { useEffect, useState } from "react";
import "./index.css";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

// Cant update anything yet

function MentorProfile() {
  const user = auth.currentUser;
  const userId = user.uid;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await fetchUserProfile(userId);
        setProfile(profileData);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log(profile);

    loadProfile();
  }, [userId]);

  const fetchUserProfile = async (userId) => {
    const docRef = doc(db, "mentors", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  };

  return (
    <div className="header">
      <div className="profile-section">
        <div className="avatar"></div>
        <div className="profile-info">
          <h1>
            <h1>Name</h1>
            <span className="advisor-badge">Mentor</span>
          </h1>
          <p className="subtitle">Open to help in:</p>
          <div className="help-tags">
            <span className="tag">Healthcare Service</span>
            <span className="tag">Resume or Portfolio Review</span>
            <span className="tag">Mock Interviews</span>
          </div>
          <button>Load Mentor data</button>
        </div>
        <button className="edit-btn header-edit">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z"></path>
          </svg>
        </button>
      </div>

      {/* Information Section */}
      <div className="section">
        <h2>
          Information <span className="asterisk">*</span>
        </h2>
        <div className="info-card">
          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{user.email}</span>
          </div>
          <div className="info-row">
            <span className="label">Phone number:</span>
            <span className="value"></span>
          </div>
          <button className="edit-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Experience Section */}
      <div className="section">
        <h2>Experience</h2>
        <div className="experience-card">
          <div className="experience-row">
            <div className="experience-item">
              <span className="label">Employer:</span>
              <span className="value">
                <span className="asterisk">*</span>
              </span>
            </div>
            <div className="experience-item">
              <span className="label">Experience level:</span>
              <span className="value"></span>
            </div>
          </div>
          <div className="experience-row">
            <div className="experience-item">
              <span className="label">Job Title:</span>
              <span className="value">Name</span>
            </div>
            <div className="experience-item">
              <span className="label">Industry:</span>
              <span className="value"></span>
            </div>
          </div>
          <button className="edit-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Education Section */}
      <div className="section">
        <h2>Education</h2>
        <div className="education-card">
          <div className="education-row">
            <div className="education-item">
              <span className="label">Alma Mater:</span>
              <span className="value">University Name</span>
            </div>
            <div className="education-item">
              <span className="label">Major:</span>
              <span className="value">Name</span>
            </div>
          </div>
          <button className="edit-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Skills Section */}
      <div className="section">
        <h2>Skills</h2>
        <div className="skills-card">
          <div className="skills-list">
            <span className="skill-tag">Skill 1</span>
            <span className="skill-tag">Skill 2</span>
            <span className="skill-tag">Skill 3</span>
          </div>
          <button className="edit-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4Z"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="footer-note">
        <span className="asterisk">*</span>
        Not visible to students
      </div>
    </div>
  );
}

export default MentorProfile;
