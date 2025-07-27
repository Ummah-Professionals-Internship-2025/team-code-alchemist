import "./App.css";
import MentorSignupForm from "./mentor-signup-form/MentorSignupForm";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <MentorSignupForm></MentorSignupForm>
    </AuthProvider>
  );
}

export default App;
