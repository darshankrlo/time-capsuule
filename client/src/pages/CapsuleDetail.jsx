import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";
import Attachment from "../components/Attachment";

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
      <div className="card sealed">
        <div className="sealed-icon">🔒</div>
        <h1>Still sealed</h1>
        <p className="subtitle">This capsule can't be opened until its unlock date.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link to="/dashboard" className="btn secondary">Back to dashboard</Link>
          <button className="danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ErrorMessage message={error} />
        <Link to="/dashboard" className="back-link">← Back to dashboard</Link>
      </div>
    );
  }

  const { analysis } = capsule;

  return (
    <div>
      <Link to="/dashboard" className="back-link">← Back</Link>

      <div className="card letter-paper">
        <span className="badge unlocked">🔓 Unlocked</span>
        <h1 style={{ marginTop: "0.6rem" }}>{capsule.title}</h1>
        <p className="muted">Opened {new Date(capsule.unlock_at).toLocaleString()}</p>
        <p className="letter">{capsule.content}</p>
        {capsule.attachments.length > 0 && (
            <Attachment capsuleId={id} file={capsule.attachments[0]} token={token} />
        )}
      </div>

      <div className="card">
        <h2>✨ Reflection</h2>
        {analysis ? (
          <div className="reflection-grid">
            <div className="reflection-item">
              <div className="label">Mood</div>
              {analysis.mood}
            </div>
            <div className="reflection-item">
              <div className="label">Themes</div>
              {analysis.themes.map((t) => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            <div className="reflection-item" style={{ gridColumn: "1 / -1" }}>
              <div className="label">Summary</div>
              {analysis.summary}
            </div>
            <div className="reflection-item reflection-question">
              <div className="label">A question for today's you</div>
              {analysis.reflectionQuestion}
            </div>
          </div>
        ) : (
          <p className="muted">No AI analysis is available for this capsule.</p>
        )}
      </div>

      <button className="danger" onClick={handleDelete}>Delete capsule</button>
    </div>
  );
}