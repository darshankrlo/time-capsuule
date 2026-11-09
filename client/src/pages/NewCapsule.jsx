import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import CapsuleForm from "../components/CapsuleForm";

export default function NewCapsule() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(formData) {
    setSubmitError("");
    setSubmitting(true);
    try {
      await api("/capsules", { method: "POST", body: formData, token });
      navigate("/dashboard");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h1>New capsule</h1>
      <CapsuleForm onSubmit={handleSubmit} submitting={submitting} submitError={submitError} />
    </div>
  );
}