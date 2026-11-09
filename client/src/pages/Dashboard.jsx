import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import CapsuleCard from "../components/CapsuleCard";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function Dashboard() {
  const { token } = useAuth();
  const [capsules, setCapsules] = useState([]);
  const [tab, setTab] = useState("locked");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await api("/capsules", { token });
        setCapsules(data.capsules);
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

  const visible = capsules.filter((c) => c.status === tab);

  return (
    <div>
      <div className="row">
        <h1>My capsules</h1>
        <Link to="/capsules/new" className="btn">New capsule</Link>
      </div>

      <div className="tabs">
        <button className={tab === "locked" ? "" : "secondary"} onClick={() => setTab("locked")}>
          Locked
        </button>
        <button className={tab === "unlocked" ? "" : "secondary"} onClick={() => setTab("unlocked")}>
          Unlocked
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="muted">No {tab} capsules yet.</p>
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