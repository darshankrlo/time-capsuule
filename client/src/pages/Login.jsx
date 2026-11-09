import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import { validateEmail } from "../utils/validators";

export default function Login() {
  const { token, saveSession } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    const newErrors = {
      email: validateEmail(form.email),
      password: form.password ? "" : "Password is required",
    };
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setSubmitting(true);
    try {
      const data = await api("/auth/login", { method: "POST", body: form });
      saveSession(data);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card narrow">
      <h1>Log in</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} />
          <span className="field-error">{errors.email}</span>
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={handleChange} />
          <span className="field-error">{errors.password}</span>
        </label>
        <ErrorMessage message={submitError} />
        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="muted">
        No account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}