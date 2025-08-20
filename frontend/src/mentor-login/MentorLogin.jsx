import React, { useState } from "react";
import "./MentorLogin.css";
import { doSignInWithEmailAndPassword } from "../Auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function MentorLogin() {
  // const {userLoggedIn} = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

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
      await doSignInWithEmailAndPassword(
        formData.email,
        formData.password
      ).then(alert("signed in"));
      navigate("/mentor-dashboard");
      setIsSigningIn(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-content">
        <h1 className="form-title">Mentor Log In</h1>

        <div>
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
