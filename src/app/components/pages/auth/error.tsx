import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notifyError } from "../../../core/helpers/shared";

export default function AuthError() {
  const navigate = useNavigate();

  useEffect(() => {
    notifyError("No se pudo completar el inicio de sesión");
    navigate("/");
  }, [navigate]);

  return null;
}
