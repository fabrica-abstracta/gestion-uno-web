import type { LoadState } from "../../components/atoms/modal";
import { toast, Slide } from "react-toastify";
import Spinner from "../../components/atoms/spinner";

export function setModalState<
  T extends {
    modal: LoadState;
    modals: Record<string, boolean>;
  }
>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  modalKey: keyof T["modals"],
  value: boolean,
  load: LoadState = value ? "ok" : "idle"
) {
  setState(prev => {
    const newModals = Object.fromEntries(
      Object.keys(prev.modals).map(key => [
        key,
        key === modalKey ? value : false
      ])
    ) as T["modals"];

    return {
      ...prev,
      modal: load,
      modals: newModals
    };
  });
}

type ApiResponse = {
  message: string;
  code: string;
};

type ApiError = {
  error?: {
    code: string;
    message: string;
    details?: {
      endpoint?: string;
      method?: string;
      [key: string]: any;
    };
  };
  message?: string;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};

export function notifySuccess(res: ApiResponse) {
  toast.success(res.message, {
    autoClose: 2200,
    hideProgressBar: false,
    transition: Slide,
  });
}

export function notifyError(err: any, onReportIncident?: (errorData: any) => void) {
  const data = err?.response?.data as ApiError | undefined;
  const errorCode = data?.error?.code || data?.code || "ERROR";
  const errorMessage = data?.error?.message || data?.message || "Ocurrió algo inesperado";
  const errorDetails = data?.error?.details;
  const validationErrors = data?.errors; // Array de errores de validación

  toast.error(
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        <span className="text-xs font-mono text-red-600 uppercase tracking-widest">
          {errorCode}
        </span>
        <span className="text-sm font-medium text-gray-900">
          {errorMessage}
        </span>
      </div>
      
      {/* Mostrar errores de validación si existen */}
      {validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0 && (
        <div className="flex flex-col gap-1 mt-1 pl-3 border-l-2 border-red-300">
          {validationErrors.map((error: any, index: number) => (
            <div key={index} className="text-xs text-gray-700">
              <span className="font-semibold text-red-700">{error.field}:</span>{" "}
              <span>{error.message}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Solo mostrar botón de reporte si NO es un error de validación */}
      {onReportIncident && (!validationErrors || !Array.isArray(validationErrors) || validationErrors.length === 0) && (
        <button
          onClick={() => {
            onReportIncident({
              code: errorCode,
              message: errorMessage,
              endpoint: errorDetails?.endpoint || "Unknown",
              method: errorDetails?.method || "Unknown",
              details: errorDetails || { error: err?.message || "No additional details" }
            });
          }}
          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors self-start"
        >
          Report incident
        </button>
      )}
    </div>,
    {
      autoClose: onReportIncident ? 8000 : 6500,
      transition: Slide,
      hideProgressBar: false,
      className: "toast-error"
    }
  );
}

export function loadingButton(
  label: string,
  spinnerClass = "w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin",
  labelClass = "text-gray-700 font-medium"
) {
  return (
    <>
      <Spinner className={spinnerClass} />
      <p className={labelClass}>{label}</p>
    </>
  );
}
