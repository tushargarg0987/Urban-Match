import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const {user, setUser} = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  }

  return (
    <header className="bg-blue-500 text-white p-4 shadow" style={{height: '7vh'}}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">MatchMaker</h1>
        {user ? <nav>
          <Link to="/dashboard" className="mx-2 hover:underline">
            Dashboard
          </Link>
          <Link to="/profile" className="mx-2 hover:underline">
            Profile
          </Link>
          <Link onClick={handleLogout}>
            Logout
          </Link>
        </nav> : <nav>
          <Link to="/" className="mx-2 hover:underline">
            Login
          </Link>
          <Link to="/register" className="mx-2 hover:underline">
            Register
          </Link>
        </nav>}
      </div>
    </header>
  );
}
