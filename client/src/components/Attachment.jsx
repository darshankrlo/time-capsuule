import { useEffect, useState } from "react";
import { apiBlob } from "../api/client";

export default function Attachment({ capsuleId, file, token }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    apiBlob(`/capsules/${capsuleId}/attachment`, token)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [capsuleId, token]);

  if (failed) return <p className="muted">📎 {file.filename} (preview unavailable)</p>;
  if (!url) return <p className="muted">Loading attachment...</p>;

  if (file.mimeType?.startsWith("image/")) {
    return <img src={url} alt={file.filename} className="attachment-img" />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="btn secondary">
      📎 Open {file.filename}
    </a>
  );
}