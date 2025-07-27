import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// I think this isnt safe but I was running into issues with the apiKey retrieval

const app = initializeApp({
  apiKey: "AIzaSyCX_TtcyA9zBO9Pw34vZdj2Lux002a22iA",
  authDomain: "ummahprof-55270.firebaseapp.com",
  projectId: "ummahprof-55270",
  storageBucket: "ummahprof-55270.firebasestorage.app",
  messagingSenderId: "93492888365",
  appId: "1:93492888365:web:27554532dce28a579cc9a4",
  measurementId: "G-FXY5K0796S",
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
