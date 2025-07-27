import { useRef } from "react";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { app } from '../../firebase';

const db = getFirestore(app);

const Signup = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      alert("Passwords do not match");
      return;
    }

    try {
      await addDoc(collection(db, "mentors"), {
        email: "yassirkhalaf13@gmail.com",
        password: passwordRef.current.value,
        createdAt: serverTimestamp()
      });
      alert("Signup request submitted. Awaiting admin approval.");
    } catch (err) {
      console.error("Signup error:", err);
      alert("Error submitting request");
    }
  };

  return (
    <Card sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2 }}>
      <CardContent>
        <Typography variant="h5" align="center">Sign Up</Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField label="Email" type="email" inputRef={emailRef} fullWidth required margin="normal" />
          <TextField label="Password" type="password" inputRef={passwordRef} fullWidth required margin="normal" />
          <TextField label="Confirm Password" type="password" inputRef={passwordConfirmRef} fullWidth required margin="normal" />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>Submit</Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Signup;
