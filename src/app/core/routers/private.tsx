import type { ReactNode } from "react";
import { useIdentity } from "../contexts/identity";
import { Navigate } from "react-router-dom";

export default function Private({ children }: { children: ReactNode }) {
  const { isAuth, loading } = useIdentity();

  if (loading) return null;

  return isAuth ? children : <Navigate to="/" replace />;
}