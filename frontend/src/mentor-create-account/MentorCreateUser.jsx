import React, { useState } from "react";
import { useAuth } from "../contexts/index";
import { doCreateUserWithEmailAndPassword } from "../Auth";


export default function MentorCreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  // const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      await doCreateUserWithEmailAndPassword(email, password, name);
      alert("user created");
      // history.push("/mentor-signin");
    } catch (error) {
      setError("Failed to create an account");
      if (error.code === "auth/email-already-in-use") {
        alert("Email already in use");
      }
    }
  }

  return (
    <div className="form-container">
      <div className="form-content">
        <h1 className="form-title">Mentor Sign Up</h1>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="John Doe"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="example@gmail.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              className="form-input"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">
            Sign Up
          </button>
        </form>
        <p className="form-text">
          Already have an account?
          {/* <Link to="/mentor-signin">Sign In</Link> */}
        </p>
      </div>
    </div>
  );
}
