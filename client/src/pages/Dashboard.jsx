import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import CapsuleCard from "../components/CapsuleCard";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function Dashboard() {
  const { user, token } = useAuth();
  const [capsules, setCapsules] = useState([]);
  const [tab, setTab] = useState("locked");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api("/capsules", { token });
        setCapsules(data.capsules);
        const hasLocked = data.capsules.some((c) => c.status === "locked");
        if (!hasLocked && data.capsules.length > 0) setTab("unlocked");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <Loader text="Loading your capsules..." />;
  if (error) return <ErrorMessage message={error} />;

  const lockedCount = capsules.filter((c) => c.status === "locked").length;
  const unlockedCount = capsules.length - lockedCount;
  const visible = capsules.filter((c) => c.status === tab);

  return (
    <div>
      <div className="page-header">
        <h1>Hello{user ? `, ${user.name.split(" ")[0]}` : ""} 👋</h1>
        <p className="subtitle">Letters from your past self, waiting for the right moment.</p>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-num">{lockedCount}</div>
          <div className="stat-label">Sealed capsules</div>
        </div>
        <div className="stat">
          <div className="stat-num">{unlockedCount}</div>
          <div className="stat-label">Ready to read</div>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "locked" ? "active" : ""}`} onClick={() => setTab("locked")}>
          Locked
        </button>
        <button className={`tab ${tab === "unlocked" ? "active" : ""}`} onClick={() => setTab("unlocked")}>
          Unlocked
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">{tab === "locked" ? "✉️" : "📭"}</div>
          <h3>No {tab} capsules yet</h3>
          <p className="muted">
            {tab === "locked"
              ? capsules.length > 0
                ? "All your capsules are open. Seal a new one for the future."
                : "Write a letter to your future self and seal it."
              : "Your unlocked capsules will show up here."}
          </p>
          {tab === "locked" && (
            <Link to="/capsules/new" className="btn">
              {capsules.length > 0 ? "Seal a new capsule" : "Write your first letter"}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid">
          {visible.map((c) => (
            <CapsuleCard key={c.id} capsule={c} />
          ))}
        </div>
      )}
    </div>
  );
}