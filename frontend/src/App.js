import logo from "./logo.svg";
import "./App.css";
import MentorSignupForm from "./mentor-signup-form/MentorSignupForm2";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <MentorSignupForm></MentorSignupForm>
    </AuthProvider>
  );
}

export default App;
