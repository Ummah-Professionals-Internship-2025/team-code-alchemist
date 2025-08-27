import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import app from "../firebase";
import emailjs from "emailjs-com";

const db = getFirestore(app);

const AdminDashboard = () => {
  const [pendingMentors, setPendingMentors] = useState([]);

  useEffect(() => {
    const fixMissingStatusFields = async () => {
      const querySnapshot = await getDocs(collection(db, "pendingMentors"));
      const updates = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        if (!data.status) {
          const docRef = doc(db, "pendingMentors", docSnap.id);
          await updateDoc(docRef, { status: "pending" });
          console.log(`Set status: "pending" for ${data.email}`);
        }
      });
      await Promise.all(updates);
    };

    fixMissingStatusFields();

    const unsub = onSnapshot(collection(db, "pendingMentors"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((pendingMentor) => pendingMentor.status === "pending");
      setPendingMentors(data);
    });

    return () => unsub();
  }, []);

  // ✅ integrated your handleApprove function here
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
      alert(`Denied user: ${user.name}`);
    } catch (err) {
      console.error("Deny failed:", err);
      alert("Failed to deny user");
    }
  };

  return (
    <Box sx={{ mt: 4, mx: "auto", maxWidth: 600, color: "#03527C" }}>
      <Typography variant="h4" gutterBottom>
        Pending Mentor Approvals
      </Typography>
      {pendingMentors.length === 0 && (
        <Typography>No pending users.</Typography>
      )}
      {pendingMentors.map((user) => (
        <Card key={user.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#E8F0FA",
                border: "1px solid #FDBB36",
                padding: 2,
                width: "100%",
                color: "black",
                boxShadow: "none",
              }}
            >
              <Typography>Email: {user.email}</Typography>
              <Typography>Name: {user.name}</Typography>
              <Typography>University: {user.university}</Typography>
              <Typography>
                Years of Experience: {user.yearsOfExperience}
              </Typography>
              <Typography>Industry: {user.industry}</Typography>
              <Typography>Skills: {user.skills}</Typography>
              <Typography>Availability: {user.availability}</Typography>
              <Typography>
                Resume:{" "}
                <a href={user.resumeURL} target="_blank" rel="noreferrer">
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
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default AdminDashboard;
