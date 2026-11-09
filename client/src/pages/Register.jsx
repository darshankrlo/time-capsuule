import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "../components/ErrorMessage";
import { validateName, validateEmail, validatePassword } from "../utils/validators";

export default function Register() {
  const { token, saveSession } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const data = await api("/auth/register", { method: "POST", body: form });
      saveSession(data);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card narrow">
        <h1>Create your account</h1>
        <p className="subtitle">Start writing letters to your future self.</p>
        <form onSubmit={handleSubmit} noValidate>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} />
          <span className="field-error">{errors.name}</span>
        </label>
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
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="muted">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}