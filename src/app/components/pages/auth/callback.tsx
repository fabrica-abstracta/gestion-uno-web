import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useIdentity } from "../../../core/contexts/identity";
import { notifyError } from "../../../core/helpers/shared";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAccount } = useIdentity();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      notifyError("No se recibió token de autenticación");
      navigate("/");
      return;
    }

    try {
      if (import.meta.env.DEV) {
        localStorage.setItem("accessToken", token);
      }

      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Token inválido");
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const account = {
        id: payload.id,
        names: payload.names,
        paternalName: payload.paternalName,
        maternalName: payload.maternalName,
        email: payload.email,
        subscription: payload.subscription,
        session: payload.session
      };
      
      setAccount(account);
      localStorage.setItem("account", JSON.stringify(account));
      navigate("/");
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Error procesando autenticación");
      navigate("/");
    }
  }, [searchParams, navigate, setAccount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completando inicio de sesión...
        </h2>
        <p className="text-sm text-gray-600">
          Por favor espera mientras procesamos tu autenticación
        </p>
      </div>
    </div>
  );
}
