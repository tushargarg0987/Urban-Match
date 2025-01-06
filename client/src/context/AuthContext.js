import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api"; // Axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to send OTP
  const sendOtp = async (email) => {
    try {
      await api.post(`/users/send-otp?user_email=${email}`);
      return { success: true };
    } catch (err) {
      console.error("Error sending OTP:", err.response?.data?.detail || err.message);
      return { success: false, error: "Network error, try again!" };
    }
  };

  // Function to verify OTP and log in the user
  const verifyOtp = async (email, otp, reg) => {
    try {
      const response = await api.post(`/users/verify-otp?user_email=${email}&otp=${otp}&reg=${reg}`);
      if(response.data && response.data.length > 0) setUser(response.data[0]);
      return { success: true };
    } catch (err) {
      console.error("Error verifying OTP:", err.response?.data?.detail || err.message);
      return { success: false, error: err.response?.data?.detail || "Invalid OTP" };
    }
  };

  // Function to logout the user
  const logout = () => {
    setUser(null);
  };

  // Fetch user profile (optional)
  const fetchUserProfile = async (email) => {
    try {
      const response = await api.get(`/users?email=${email}`);
      setUser(response.data);
    } catch (err) {
      console.error("Error fetching user profile:", err.message);
    }
  };

  // Check for existing session on load (if applicable)
  useEffect(() => {
    // Example logic for checking user session on page load
    // setUser(sessionUser);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, sendOtp, verifyOtp, logout, fetchUserProfile, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
