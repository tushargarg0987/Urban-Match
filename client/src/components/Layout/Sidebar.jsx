import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4 shadow">
      <ul className="space-y-4">
        <li>
          <Link to="/dashboard" className="block p-2 rounded bg-blue-500 text-white hover:bg-blue-600">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/profile" className="block p-2 rounded bg-blue-500 text-white hover:bg-blue-600">
            Profile
          </Link>
        </li>
        <li>
          <Link to="/" className="block p-2 rounded bg-red-500 text-white hover:bg-red-600">
            Logout
          </Link>
        </li>
      </ul>
    </aside>
  );
}
