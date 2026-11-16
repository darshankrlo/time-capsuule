import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import ErrorMessage from "../components/ErrorMessage";
import { validateEmail } from "../utils/validators";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setMessage("");

    const err = validateEmail(email);
    setFieldError(err);
    if (err) return;

    setSubmitting(true);
    try {
      const data = await api("/auth/forgot-password", { method: "POST", body: { email } });
      setMessage(data.message);
    } catch (e2) {
      setSubmitError(e2.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card narrow">
      <h1>Forgot password?</h1>
      <p className="subtitle">Enter your email and we'll send you a reset link.</p>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <span className="field-error">{fieldError}</span>
        </label>
        <ErrorMessage message={submitError} />
        {message && <p className="success">{message}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <p className="muted">
        <Link to="/login">Back to log in</Link>
      </p>
    </div>
  );
}