import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function MentorCreateUser() {
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get("email") || "";
  const [password, setPassword] = useState("");
  const auth = getAuth();

  const createAccount = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, emailFromUrl, password);
      alert("Account created successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to create account.");
    }
  };

  return (
    <form onSubmit={createAccount}>
      <h2>Create Your Mentor Account</h2>
      <input type="email" value={emailFromUrl} readOnly />
      <input
        type="password"
        placeholder="Create Password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Create Account</button>
    </form>
  );
}

