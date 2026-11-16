import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import ErrorMessage from "../components/ErrorMessage";
import { validatePassword } from "../utils/validators";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");

  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const newErrors = {
      password: validatePassword(form.password),
      confirm: form.password === form.confirm ? "" : "Passwords do not match",
    };
    setErrors(newErrors);
    if (newErrors.password || newErrors.confirm) return;

    setSubmitting(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: { token, password: form.password },
      });
      setDone(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="card narrow">
        <h1>Invalid link</h1>
        <p className="subtitle">This reset link is missing its token.</p>
        <Link to="/forgot-password">Request a new link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card narrow">
        <h1>Password updated ✅</h1>
        <p className="subtitle">You can now log in with your new password.</p>
        <Link to="/login" className="btn">Go to log in</Link>
      </div>
    );
  }

  return (
    <div className="card narrow">
      <h1>Choose a new password</h1>
      <p className="subtitle">Use at least 8 characters.</p>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          New password
          <input name="password" type="password" value={form.password} onChange={handleChange} />
          <span className="field-error">{errors.password}</span>
        </label>
        <label>
          Confirm password
          <input name="confirm" type="password" value={form.confirm} onChange={handleChange} />
          <span className="field-error">{errors.confirm}</span>
        </label>
        <ErrorMessage message={submitError} />
        <button type="submit" disabled={submitting}>
          {submitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}