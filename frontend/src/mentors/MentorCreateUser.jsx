import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function MentorCreateUser() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const e = params.get("email") || "";
    setEmail(e);
  }, [location.search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Missing email in link.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    try {
      alert(`(Demo) Password set for ${email}`);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to create account.");
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 420, margin: "40px auto" }}>
      <h2>Create Your Password</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input style={{ width: "100%" }} type="email" value={email} readOnly />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>New password</label>
          <input
            style={{ width: "100%" }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Confirm password</label>
          <input
            style={{ width: "100%" }}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
          />
        </div>
        <button type="submit" style={{ width: "100%" }}>Set Password</button>
      </form>
    </div>
  );
}
