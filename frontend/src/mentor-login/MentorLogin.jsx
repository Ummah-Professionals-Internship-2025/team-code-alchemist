import React, { useState } from "react";
import "./MentorLogin.css";
import { useAuth } from "../contexts/index";
import { doSignInWithEmailAndPassword } from "../Auth";

function MentorLogin() {
  // const {userLoggedIn} = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      await doSignInWithEmailAndPassword(formData.email, formData.password);
      alert(`Hello ${formData.fullName}`);
    }
  };

  return (
    <div className="form-container">
      <div className="form-content">
        <h1 className="form-title">Mentor Log In</h1>

        <div>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name:
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="form-input"
              placeholder="ex. Ahmed Ali"
              value={formData.fullName}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Value"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Value"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <button className="submit-btn" type="submit" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default MentorLogin;
