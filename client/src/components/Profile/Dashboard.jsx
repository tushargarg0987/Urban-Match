import { useEffect, useState } from "react";
import axios from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage({ userEmail }) {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState("");
  const {user} = useAuth();

  useEffect(() => {
    console.log("User:",user  )
    const fetchMatches = async () => {
      try {
        const response = await axios.get(`/users/${user.id}/matches`);
        setMatches(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch matches");
      }
    };

    fetchMatches();
  }, [userEmail, user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>
      {error && <p className="text-red-500">{error}</p>}
      {matches.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="p-4 border rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{match.name}</h2>
            <p>Age: {match.age}</p>
            <p>Gender: {match.gender}</p>
            <p>City: {match.city}</p>
            <p>Interests: {match.interests.join(", ")}</p>
          </div>
        ))}
      </div> : <h4>No matches found for you currently. Try updating your profile!!</h4>}
    </div>
  );
}
