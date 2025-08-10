import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import emailjs from "emailjs-com";

export default function AdminApproval() {
  const [pendingMentors, setPendingMentors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPendingMentors = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const mentorsQuery = query(
          collection(db, "pendingMentors"),
          where("status", "==", "pending")
        );
        const snapshot = await getDocs(mentorsQuery);
        const mentorList = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setPendingMentors(mentorList);
      } catch (error) {
        console.error("Error fetching mentors:", error);
        setErrorMessage(error.message || "Failed to load pending mentors.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPendingMentors();
  }, []);

  const handleApprove = async (mentor) => {
    const signupLink = `${window.location.origin}/create-password?email=${encodeURIComponent(
      mentor.email || ""
    )}`;

    const emailParams = {
      to_email: mentor.email,
      mentor_name: mentor.name || "Mentor",
      signup_link: signupLink,
    };

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        emailParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );

      await deleteDoc(doc(db, "pendingMentors", mentor.id));
      setPendingMentors(prev => prev.filter(item => item.id !== mentor.id));

      alert(`Approved & sent link to ${mentor.email}`);
    } catch (error) {
      console.error("Error approving mentor:", error);
      alert(`Failed to send email: ${error?.text || error?.message || error}`);
    }
  };

  const handleDeny = async (mentor) => {
    try {
      await deleteDoc(doc(db, "pendingMentors", mentor.id));
      setPendingMentors(prev => prev.filter(item => item.id !== mentor.id));
    } catch (error) {
      console.error("Error denying mentor:", error);
      alert(error.message || "Failed to deny mentor.");
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h2>Pending Mentor Approvals</h2>
      {isLoading && <p>Loading…</p>}
      {errorMessage && <p style={{ color: "crimson" }}>{errorMessage}</p>}
      {!isLoading && !pendingMentors.length && <p>No pending mentors.</p>}

      {pendingMentors.map((mentor) => (
        <div
          key={mentor.id}
          style={{
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 8,
            marginTop: 12
          }}
        >
          <div><b>Name:</b> {mentor.name || "N/A"}</div>
          <div><b>Email:</b> {mentor.email || "N/A"}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => handleApprove(mentor)}>Approve + Send Link</button>
            <button onClick={() => handleDeny(mentor)}>Deny</button>
          </div>
        </div>
      ))}
    </div>
  );
}
