import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./components/Profile/Dashboard";
import ProfilePage from "./components/Profile/ProfileForm";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Login from "./components/Auth/LoginForm";
import Register from "./components/Auth/RegisterForm";
import { useAuth } from "./context/AuthContext";

function App() {
  const {user} = useAuth();
  return (
    <Router>
      <Header />
      <div className="flex" style={{height: '87vh', justifyContent: 'center', alignContent: 'center'}}>
        <main className="flex-1">
          <Routes>
            <Route path="/" element={user == null ? <Navigate to="/login" replace={true} /> : <Navigate to="/dashboard" replace={true} />} />
            <Route path="/client" element={user == null ? <Navigate to="/login" replace={true} /> : <Navigate to="/dashboard" replace={true} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
