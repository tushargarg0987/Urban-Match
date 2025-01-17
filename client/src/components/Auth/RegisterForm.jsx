import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";

const Register = () => {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [questionnaire, setQuestionnaire] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    city: "",
    interests: "",
  });
  const { setUser } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading to true
    const result = await sendOtp(email);
    setLoading(false); // Set loading to false once the API responds
    if (result.success) {
      setStep(2);
    } else {
      setError(result.error);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await verifyOtp(email, otp, true);
    setLoading(false);
    if (result.success) {
      setStep(3);
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading before the request
    try {
      const res = await api.post("/users", {
        ...formData,
        email,
        interests: Array.isArray(formData.interests)
          ? formData.interests
          : formData.interests.split(",").map((i) => i.trim()),
        questionnaire,
      });
      setUser(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false); // Set loading to false after the request
    }
  };

  const handleQuestionnaireChange = (question, answer) => {
    setQuestionnaire((prev) => ({ ...prev, [question]: answer }));
  };

  const questionnaireQuestions = [
    "What are your hobbies?",
    "Do you prefer indoor or outdoor activities?",
    "Do you smoke?",
    "Do you drink alcohol?",
    "What kind of books do you like to read?",
    "What is your favorite type of music?",
    "Do you enjoy traveling? If yes, where do you want to go?",
    "Are you a morning person or a night owl?",
    "What kind of movies or shows do you enjoy?",
    "What is your preferred way to relax?",
    "Do you have any dietary preferences or restrictions?",
    "How do you usually spend your weekends?",
    "What kind of people do you like to talk to?",
    "How do you usually introduce yourself to new people?",
    "What’s one habit or routine you follow daily?",
  ];

  return (
    <div className="flex items-center justify-center h-[100%] flex-1 bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4">
          {step === 1 && "Register: Step 1 - Verify Email"}
          {step === 2 && "Register: Step 2 - Enter OTP"}
          {step === 3 && "Register: Step 3 - Fill Details"}
          {step === 4 && "Register: Step 4 - Personality Questionnaire"}
        </h1>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                <div className="spinner-border animate-spin w-5 h-5 border-4 border-t-4 border-white rounded-full"></div>
              ) : (
                "Send OTP"
              )}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-blue-500 hover:underline">
                Already have an account? Login
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-lg p-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border animate-spin w-5 h-5 border-4 border-t-4 border-white rounded-full"></div>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-lg p-2"
              required
            />
            <input
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full border rounded-lg p-2"
              required
            />
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full border rounded-lg p-2"
              required
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full border rounded-lg p-2"
              required
            />
            <input
              type="text"
              placeholder="Interests (comma-separated)"
              value={formData.interests}
              onChange={(e) =>
                setFormData({ ...formData, interests: e.target.value })
              }
              className="w-full border rounded-lg p-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border animate-spin w-5 h-5 border-4 border-t-4 border-white rounded-full"></div>
              ) : (
                "Continue to Questionnaire"
              )}
            </button>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleRegister} className="space-y-4" style={{maxHeight: '70vh', overflowX: 'hidden', overflowY: 'scroll'}}>
            {questionnaireQuestions.map((question, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-gray-700">{question}</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  onChange={(e) =>
                    handleQuestionnaireChange(question, e.target.value)
                  }
                  required
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border animate-spin w-5 h-5 border-4 border-t-4 border-white rounded-full"></div>
              ) : (
                "Submit and Register"
              )}
            </button>
          </form>
        )}

        {error && (
          <p className="text-red-600 text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Register;
