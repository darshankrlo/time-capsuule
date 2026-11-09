import { Link } from "react-router-dom";

export default function CapsuleCard({ capsule }) {
  const unlockDate = new Date(capsule.unlock_at).toLocaleString();
  const isLocked = capsule.status === "locked";

  return (
    <div className="card">
      <h3>{capsule.title}</h3>
      <p className="muted">
        {isLocked ? "🔒 Unlocks" : "🔓 Unlocked"} {unlockDate}
      </p>
      {capsule.tags.length > 0 && (
        <p>
          {capsule.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </p>
      )}
      <Link to={`/capsules/${capsule.id}`}>Open</Link>
    </div>
  );
}