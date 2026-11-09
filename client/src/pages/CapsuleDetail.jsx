import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function CapsuleDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      setLocked(false);
      try {
        const data = await api(`/capsules/${id}`, { token });
        setCapsule(data.capsule);
      } catch (err) {
        if (err.code === "CAPSULE_LOCKED") setLocked(true);
        else setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token]);

  async function handleDelete() {
    if (!window.confirm("Delete this capsule permanently?")) return;
    try {
      await api(`/capsules/${id}`, { method: "DELETE", token });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Loader />;

  if (locked) {
    return (
      <div className="card">
        <h1>🔒 Still sealed</h1>
        <p className="muted">This capsule can't be opened until its unlock date.</p>
        <Link to="/dashboard">Back to dashboard</Link>
        {" · "}
        <button className="secondary" onClick={handleDelete}>Delete</button>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ErrorMessage message={error} />
        <Link to="/dashboard">Back to dashboard</Link>
      </div>
    );
  }

  const { analysis } = capsule;

  return (
    <div>
      <Link to="/dashboard">← Back</Link>
      <div className="card">
        <h1>{capsule.title}</h1>
        <p className="muted">Unlocked {new Date(capsule.unlock_at).toLocaleString()}</p>
        <p className="letter">{capsule.content}</p>
        {capsule.attachments.length > 0 && (
          <p className="muted">Attachment: {capsule.attachments[0].filename}</p>
        )}
      </div>

      <div className="card">
        <h2>Reflection</h2>
        {analysis ? (
          <>
            <p><b>Mood:</b> {analysis.mood}</p>
            <p>
              <b>Themes:</b>{" "}
              {analysis.themes.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </p>
            <p>{analysis.summary}</p>
            <p><i>{analysis.reflectionQuestion}</i></p>
          </>
        ) : (
          <p className="muted">No AI analysis is available for this capsule.</p>
        )}
      </div>

      <button className="secondary" onClick={handleDelete}>Delete capsule</button>
    </div>
  );
}