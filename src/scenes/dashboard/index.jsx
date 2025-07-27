import React, { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { getFirestore, collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { app } from "../../firebase";
import { approve } from "../../approve";


const db = getFirestore(app);

const Dashboard = () => {
  const [mentors, setmentors] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "mentors"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setmentors(data);
    });

    return () => unsub();
  }, []);

  const handleApprove = async (user) => {
    try {
      await approve(user.email);
      await deleteDoc(doc(db, "mentors", user.id));
      alert(`Approved user: ${user.email}`);
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Failed to approve user");
    }
  };

  const handleDeny = async (user) => {
    try {
      await deleteDoc(doc(db, "mentors", user.id));
      alert(`Denied user: ${user.email}`);
    } catch (err) {
      console.error("Deny failed:", err);
      alert("Failed to deny user");
    }
  };

  return (
    <Box sx={{ mt: 4, mx: "auto", maxWidth: 600 }}>
      <Typography variant="h4" gutterBottom>Pending Signups</Typography>
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

export default Dashboard;
