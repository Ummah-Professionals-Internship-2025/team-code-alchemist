import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { app } from "../firebase";
import { db } from "../firebase";
import emailjs from "@emailjs/browser";

const AdminDashboard = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "pendingMentors"),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMentors(data);
    });

    return () => unsub();
  }, []);

  const handleApprove = async (mentor) => {
    const dbId = mentor.id;
    const signupLink = `${window.location.origin}/create-password?dbId=${dbId}&email=${mentor.email}`;

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

      await updateDoc(doc(db, "pendingMentors", mentor.id), {
        status: "approved",
      });

      alert(`Approved & sent link to ${mentor.email}`);
    } catch (error) {
      console.error("Error approving mentor:", error);
      alert(`Failed to send email: ${error?.text || error?.message || error}`);
    }
  };

  const handleDeny = async (user) => {
    try {
      await deleteDoc(doc(db, "pendingMentors", user.id));
      alert(`Denied user: ${user.email}`);
    } catch (err) {
      console.error("Deny failed:", err);
      alert("Failed to deny user");
    }
  };

  return (
    <Box
      sx={{
        mt: 4,
        mx: "auto",
        maxWidth: 600,
        backgroundColor: "#f5f5f5",
        padding: 4,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Pending Mentor Approvals
      </Typography>
      {mentors.length === 0 && <Typography>No pending users.</Typography>}
      {mentors.map((user) => (
        <Card key={user.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography>
              Email: {user.email} , Resume:{" "}
              <a href={user.resumeURL} target="_blank">
                View Resume
              </a>
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleApprove(user)}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDeny(user)}
              >
                Deny
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default AdminDashboard;
