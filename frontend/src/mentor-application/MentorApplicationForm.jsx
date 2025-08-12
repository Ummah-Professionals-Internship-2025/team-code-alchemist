import React, { useState, useEffect } from "react";
import Select from "react-select";
import "./MentorSignupStyle.css";
// import { useAuth } from "../contexts/AuthContext";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import AvailabilityForm from "./AvailibilityForm";
import axios from "axios";

// profile builder component

export const initialState = {
  name: "",
  email: "",
  yearsOfExperience: "",
  companies: "",
  skills: "",
  helpIn: "",
  industry: [],
  calendar: "",
  region: "",
  gender: "",
  wouldYouMind: "",
  phone: "",
  companySize: "",
  yearOfGraduation: "",
  ageRange: "",
  university: "",
  resumeURL: "",
  status: "pending",
  availability: [],
};

const industryOptions = [
  { value: "Business", label: "Business" },
  { value: "Education", label: "Education" },
  { value: "Engineering", label: "Engineering" },
  { value: "Finance", label: "Finance" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Law", label: "Law" },
  { value: "Social Services", label: "Social Services" },
  { value: "Science", label: "Science" },
  { value: "Arts", label: "Arts" },
  { value: "Other", label: "Other" },
];

const companySizeOptions = [
  {
    value: "Small Company (1-50 employees)",
    label: "Small Company (1-50 employees)",
  },
  {
    value: "Medium Company (51-500 employees)",
    label: "Medium Company (51-500 employees)",
  },
  {
    value: "Large Company (500+ employees)",
    label: "Large Company (500+ employees)",
  },
];

const helpingOptions = [
  { value: "resume_review", label: "Resume Review" },
  { value: "interview_skills", label: "Interview Skills" },
  { value: "career_fair_prep", label: "Career Fair Prep" },
  { value: "personal_project_guidance", label: "Personal Project Guidance" },
  { value: "mock_interviews", label: "Mock Interviews" },
  { value: "career_path_exploration", label: "Career Path Exploration" },
  { value: "portfolio_feedback", label: "Portfolio Feedback" },
  { value: "job_search_strategy", label: "Job Search Strategy" },
  { value: "tech_industry_insights", label: "Tech Industry Insights" },
];

function MentorApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(initialState);
  // const { currentUser, signup } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState(new Set());
  const [resumeFile, setResumeFile] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleIndustryChange = (selectedOptions) => {
    setForm({
      ...form,
      industry: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };

  const handleAvailabilityChange = (selectedSlots) => {
    setAvailability(selectedSlots);
  };

  const handleResumeChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  useEffect(() => {
    const availabilityArray = Array.from(availability);
    form.availability = availabilityArray;
  }, [availability]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!resumeFile) {
      return setError("Please upload your resume");
    }
    // resume url
    const formData = new FormData();
    formData.append("resume", resumeFile);
    const resumeResponse = await axios.post("/api/applications", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    form.resumeURL = resumeResponse.data.resumeUrl;
    console.log(form);

    try {
      await addDoc(collection(db, "pendingMentors"), form);
      alert("Data submitted!");
      setForm(initialState);
      setSubmitted(true);
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  }

  return (
    <div className="form-container">
      <div>
        <h3 className="title is-3">Ummah Professionals</h3>
      </div>
      {error && <h1 className="Danger">{error}</h1>}

      <div className="form-card scrollable-form">
        <button className="btn">{"< Back"}</button>
        <h2>Mentor Application</h2>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="field">
            <label className="label" htmlFor="name">
              Full Name <span className="required">*</span>
            </label>
            <div className="control">
              <input
                id="name"
                className="input"
                type="text"
                placeholder="Enter name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label className="label" htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <div className="control">
              <input
                id="email"
                className="input"
                type="email"
                placeholder="e.g. alex@example.com"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Years of Experience */}
          <div className="field">
            <label className="label" htmlFor="yearsOfExperience">
              Years of Experience
            </label>
            <div className="control">
              <input
                id="yearsOfExperience"
                className="input"
                type="number"
                placeholder="e.g. 5"
                name="yearsOfExperience"
                value={form.yearsOfExperience}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* Company and Past Companies */}
          <div className="field">
            <label className="label" htmlFor="companies">
              Company and Past Companies
            </label>
            <div className="control">
              <input
                id="companies"
                className="input"
                type="text"
                placeholder="e.g. Google, Microsoft, Apple"
                name="companies"
                value={form.companies}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Company Size */}
          <div className="field">
            <label className="label">
              Company Size <span className="required">*</span>
            </label>
            <div className="control">
              <Select
                name="companySize"
                options={companySizeOptions}
                value={companySizeOptions.find(
                  (opt) => opt.value === form.companySize
                )}
                onChange={(selectedOption) =>
                  setForm((prev) => ({
                    ...prev,
                    companySize: selectedOption?.value || "",
                  }))
                }
                classNamePrefix="react-select"
                placeholder="Select company size..."
                isClearable
                required
              />
            </div>
          </div>

          {/* Skills */}
          <div className="field">
            <label className="label" htmlFor="skills">
              Skills (3-5)
            </label>
            <div className="control">
              <input
                id="skills"
                className="input"
                type="text"
                placeholder="e.g. JavaScript, React, Node.js"
                name="skills"
                value={form.skills}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Industry */}
          <div className="field">
            <label className="label">
              Industry <span className="required">*</span>
            </label>
            <div className="control">
              <Select
                isMulti
                name="industry"
                options={industryOptions}
                value={industryOptions.filter((opt) =>
                  form.industry.includes(opt.value)
                )}
                onChange={handleIndustryChange}
                classNamePrefix="react-select"
                placeholder="Select industry..."
                required
              />
            </div>
          </div>

          {/* Help In */}
          <div className="field">
            <label className="label" htmlFor="helpIn">
              What do you want to help in
            </label>
            <div className="control">
              <Select
                name="helpIn"
                options={[
                  { value: "resume_review", label: "Resume Review" },
                  { value: "interview_skills", label: "Interview Skills" },
                  { value: "career_fair_prep", label: "Career Fair Prep" },
                  {
                    value: "personal_project_guidance",
                    label: "Personal Project Guidance",
                  },
                  { value: "mock_interviews", label: "Mock Interviews" },
                  {
                    value: "career_path_exploration",
                    label: "Career Path Exploration",
                  },
                  { value: "portfolio_feedback", label: "Portfolio Feedback" },
                  {
                    value: "job_search_strategy",
                    label: "Job Search Strategy",
                  },
                  {
                    value: "tech_industry_insights",
                    label: "Tech Industry Insights",
                  },
                ]}
                value={
                  form.helpIn
                    ? {
                        value: form.helpIn,
                        label: form.helpIn
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  setForm((prev) => ({
                    ...prev,
                    helpIn: selectedOption?.value || "",
                  }))
                }
                classNamePrefix="react-select"
                placeholder="Select a topic..."
                isClearable
              />
            </div>
          </div>

          {/* Calendar */}
          <div className="field">
            <label className="label" htmlFor="calendar">
              Do you want to put your Google/Outlook calendar?
            </label>
            <div className="control">
              <div className="select">
                <select
                  id="calendar"
                  className="input"
                  name="calendar"
                  value={form.calendar}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Region */}
          <div className="field">
            <label className="label" htmlFor="region">
              Region
            </label>
            <div className="control">
              <div className="select">
                <select
                  id="region"
                  className="form-select"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="NA-East">NA - East</option>
                  <option value="NA-Central">NA - Central</option>
                  <option value="NA-West">NA - West</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="field">
            <label className="label" htmlFor="gender">
              Gender
            </label>
            <div className="control">
              <div className="select">
                <select
                  id="gender"
                  className="form-select"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cross-Gender Teaching */}
          <div className="field">
            <label className="label" htmlFor="wouldYouMind">
              Would you be alright with teaching the opposite gender, given a
              shortage?
            </label>
            <div className="control">
              <div className="select">
                <select
                  id="wouldYouMind"
                  className="form-select"
                  name="wouldYouMind"
                  value={form.wouldYouMind}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="yes - Dont mind">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="field">
            <label className="label">General Availability</label>
            <div className="control">
              <AvailabilityForm
                selectedSlots={availability}
                onAvailabilityChange={handleAvailabilityChange}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="field">
            <label className="label" htmlFor="phone">
              Phone Number
            </label>
            <div className="control">
              <input
                id="phone"
                className="input"
                type="tel"
                placeholder="e.g. (555) 123-4567"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Year of Graduation */}
          <div className="field">
            <label className="label" htmlFor="yearOfGraduation">
              Year of Graduation
            </label>
            <div className="control">
              <input
                id="yearOfGraduation"
                className="input"
                type="number"
                placeholder="e.g. 2020"
                name="yearOfGraduation"
                value={form.yearOfGraduation}
                onChange={handleChange}
                min="1950"
                max="2030"
              />
            </div>
          </div>

          {/* Age Range */}
          <div className="field">
            <label className="label" htmlFor="ageRange">
              Age Range for Mentee Pairing
            </label>
            <div className="control">
              <input
                id="ageRange"
                className="input"
                type="text"
                placeholder="e.g. 20-25, 18-30"
                name="ageRange"
                value={form.ageRange}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* University */}
          <div className="field">
            <label className="label" htmlFor="university">
              University
            </label>
            <div className="control">
              <input
                id="university"
                className="input"
                type="text"
                placeholder="e.g. Harvard University"
                name="university"
                value={form.university}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="field">
            <label className="label" htmlFor="resume">
              Resume
            </label>
            <div className="control">
              <div className="file-input-wrapper">
                <input
                  type="file"
                  name="resume"
                  onChange={handleResumeChange}
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  className="file-input"
                />
                <label htmlFor="resume" className="file-label">
                  Choose File
                </label>
                {resumeFile && (
                  <span className="file-name">{resumeFile.name}</span>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="field">
            <div className="control">
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MentorApplicationForm;
