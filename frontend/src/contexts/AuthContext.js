// UNSAFE EXECUTE -> DB api keys are easily accessed. must update 'firebase.js' to connect to env
// Creates user. Does not update database

import React, { useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();

  function signup(email, password) {
    console.log(email, password, "done");
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Success
      })
      .catch((error) => {
        // Error
      });
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
