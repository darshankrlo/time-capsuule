import { Link } from "react-router-dom";

function timeLeft(date) {
  const ms = new Date(date) - new Date();
  if (ms <= 0) return "Ready to open";
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""} left`;
  const hours = Math.floor(mins / 60);
  if (hours >= 1) return `${hours}h left`;
  return `${mins}m left`;
}

export default function CapsuleCard({ capsule }) {
  const isLocked = capsule.status === "locked";
  const date = new Date(capsule.unlock_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="capsule-card">
      <span className={`badge ${capsule.status}`}>
        {isLocked ? `🔒 ${timeLeft(capsule.unlock_at)}` : "🔓 Unlocked"}
      </span>
      <h3>{capsule.title}</h3>
      <p className="muted">{isLocked ? "Opens" : "Opened"} {date}</p>
      {capsule.tags.length > 0 && (
        <div>
          {capsule.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      )}
      <Link to={`/capsules/${capsule.id}`} className="open-link">
        {isLocked ? "View details →" : "Read letter →"}
      </Link>
    </div>
  );
}