import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) return <Loader />;
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}