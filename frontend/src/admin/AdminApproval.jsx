import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import emailjs from "emailjs-com";

export default function AdminApproval() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      try {

        const q = query(collection(db, "pendingMentors"), where("status", "==", "pending"));
        const snap = await getDocs(q);
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPending(rows);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Failed to load.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (m) => {
    const signupLink = `${window.location.origin}/create-password?email=${encodeURIComponent(
      m.email || ""
    )}`;

    const params = {
      to_email: m.email,               
      mentor_name: m.name || "Mentor",
      signup_link: signupLink,
    };

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        params,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      );

    
      await deleteDoc(doc(db, "pendingMentors", m.id));
      setPending((list) => list.filter((x) => x.id !== m.id));
      alert(`Approved & sent link to ${m.email}`);
    } catch (e) {
      console.error("Email/cleanup failed:", e);
      alert(`Failed to send: ${e?.text || e?.message || e}`);
    }
  };

  const handleDeny = async (m) => {
    try {
      await deleteDoc(doc(db, "pendingMentors", m.id));
      setPending((list) => list.filter((x) => x.id !== m.id));
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to deny.");
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h2>Pending Mentor Approvals</h2>
      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {!loading && !pending.length && <p>No pending mentors.</p>}

      {pending.map((m) => (
        <div key={m.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginTop: 12 }}>
          <div><b>Name:</b> {m.name || "—"}</div>
          <div><b>Email:</b> {m.email || "—"}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => handleApprove(m)}>Approve + Send Link</button>
            <button onClick={() => handleDeny(m)}>Deny</button>
          </div>
        </div>
      ))}
    </div>
  );
}