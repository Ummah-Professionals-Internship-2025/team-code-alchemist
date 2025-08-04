
import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import {collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { app } from "../firebase";
import { db } from "../firebase";

const AdminDashboard = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pendingMentors"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((mentor) => mentor.status === "pending");
      setMentors(data);
    });

    return () => unsub();
  }, []);

  const handleApprove = async (user) => {
    try {
      const userRef = doc(db, "pendingMentors", user.id);
      await updateDoc(userRef, { status: "approved" });

      alert(`Approved user: ${user.email}`);
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Failed to approve user");
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
    <Box sx={{ mt: 4, mx: "auto", maxWidth: 600, backgroundColor: "#f5f5f5", padding: 4 }}>
      <Typography variant="h4" gutterBottom>Pending Mentor Approvals</Typography>
      {mentors.length === 0 && (
        <Typography>No pending users.</Typography>
      )}
      {mentors.map((user) => (
        <Card key={user.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography>Email: {user.email}</Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button variant="contained" color="success" onClick={() => handleApprove(user)}>Approve</Button>
              <Button variant="outlined" color="error" onClick={() => handleDeny(user)}>Deny</Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default AdminDashboard;
