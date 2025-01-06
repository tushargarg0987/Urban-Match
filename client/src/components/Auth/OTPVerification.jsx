import { useState } from "react";
import axios from "../../utils/api";

export default function OtpVerificationForm({ email, onSuccess }) {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/users/verify-otp", { user_email: email, otp });
      setMessage(response.data.message);
      onSuccess();
    } catch (error) {
      setMessage(error.response.data.detail || "Invalid OTP");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold">Verify OTP</h2>
      <form onSubmit={handleVerifyOtp}>
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full border p-2 rounded mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Verify
        </button>
      </form>
      {message && <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
    </div>
  );
}
