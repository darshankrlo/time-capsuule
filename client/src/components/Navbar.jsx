import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="brand">
        <span className="brand-icon">⏳</span>
        Time Capsule
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/capsules/new" className="btn">+ New capsule</Link>
            <button className="ghost" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="btn">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}