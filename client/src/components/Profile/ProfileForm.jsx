import { useEffect, useState } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    city: "",
    email: "",
    interests: [],
  });
  const {user, setUser} = useAuth()
  // const user = {id: 4}
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/users/${user.id}`);
        setProfile(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          age: response.data.age,
          gender: response.data.gender,
          city: response.data.city,
          interests: response.data.interests.join(", "),
        });
      } catch (err) {
        setMessage(err.response?.data?.detail || "Failed to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Ensure interests is an array and properly trimmed
      const updatedProfile = {
        ...formData,
        interests: Array.isArray(formData.interests)
          ? formData.interests
          : formData.interests.split(",").map((i) => i.trim()),
      };
      console.log(updatedProfile); // Debug to verify structure before sending
  
      await axios.put(`/users/${user.id}`, updatedProfile);
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err); // Log the error for debugging
      setMessage(err.response?.data?.detail || "Failed to update profile");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/users/${user.id}`);
      setMessage("Profile deleted successfully!");
      setProfile(null);
      setUser(null)
      navigate('/login')
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to delete profile");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      {message && <p className="mb-4 text-green-500">{message}</p>}
      {profile ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Age"
            className="w-full border p-2 rounded"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Gender"
            className="w-full border p-2 rounded"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="City"
            className="w-full border p-2 rounded"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Interests (comma-separated)"
            className="w-full border p-2 rounded"
            value={formData.interests}
            onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Update Profile
          </button>
        </form>
      ) : (
        <p>No profile found. Please register first.</p>
      )}
      {profile && (
        <button
          onClick={handleDelete}
          className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Delete Profile
        </button>
      )}
    </div>
  );
}
