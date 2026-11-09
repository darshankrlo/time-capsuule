import { useState } from "react";
import ErrorMessage from "./ErrorMessage";

function toLocalInput(date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
}

export default function CapsuleForm({ onSubmit, submitting, submitError }) {
  const [form, setForm] = useState({ title: "", content: "", unlockAt: "" });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.trim().length > 150) e.title = "Title is too long";

    if (form.content.trim().length < 20) e.content = "Write at least 20 characters";
    else if (form.content.length > 10000) e.content = "Letter is too long (max 10000)";

    if (!form.unlockAt) e.unlockAt = "Pick an unlock date";
    else if (new Date(form.unlockAt) <= new Date()) e.unlockAt = "Date must be in the future";

    if (file && file.size > 5 * 1024 * 1024) e.file = "File must be under 5 MB";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const data = new FormData();
    data.append("title", form.title.trim());
    data.append("content", form.content.trim());
    data.append("unlockAt", new Date(form.unlockAt).toISOString());
    if (file) data.append("attachment", file);
    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} />
        <span className="field-error">{errors.title}</span>
      </label>
      <label>
        Your letter
        <textarea name="content" rows="8" value={form.content} onChange={handleChange} />
        <span className="muted">{form.content.length}/10000</span>
        <span className="field-error"> {errors.content}</span>
      </label>
      <label>
        Unlock date
        <input
          name="unlockAt"
          type="datetime-local"
          min={toLocalInput(new Date())}
          value={form.unlockAt}
          onChange={handleChange}
        />
        <span className="field-error">{errors.unlockAt}</span>
      </label>
      <label>
        Attachment (optional: PNG, JPEG, WEBP or PDF, up to 5 MB)
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
        <span className="field-error">{errors.file}</span>
      </label>
      <ErrorMessage message={submitError} />
      <button type="submit" disabled={submitting}>
        {submitting ? "Sealing..." : "Seal capsule"}
      </button>
    </form>
  );
}