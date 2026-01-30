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

export function setApiState<
  T extends {
    apis: Record<string, LoadState>;
  }
>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  apiKey: keyof T["apis"],
  value: LoadState
) {
  setState(prev => ({
    ...prev,
    apis: {
      ...prev.apis,
      [apiKey]: value
    }
  }));
}

export function setButtonState<
  T extends {
    buttons: Record<string, boolean>;
  }
>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  buttonKey: keyof T["buttons"],
  value: boolean
) {
  setState(prev => ({
    ...prev,
    buttons: {
      ...prev.buttons,
      [buttonKey]: value
    }
  }));
}

export function setSelectionState<
  T extends {
    selections: Record<string, any>;
  }
>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  selectionKey: keyof T["selections"],
  value: any
) {
  setState(prev => ({
    ...prev,
    selections: {
      ...prev.selections,
      [selectionKey]: value
    }
  }));
}

export function setAsyncSelectionState<
  T extends {
    asyncSelections: Record<string, {
      items: any[];
      loading: LoadState;
    }>;
  }
>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  asyncKey: keyof T["asyncSelections"],
  items?: any[],
  loading?: LoadState
) {
  setState(prev => {
    const currentAsync = prev.asyncSelections[asyncKey as string];
    return {
      ...prev,
      asyncSelections: {
        ...prev.asyncSelections,
        [asyncKey]: {
          items: items !== undefined ? items : currentAsync.items,
          loading: loading !== undefined ? loading : currentAsync.loading
        }
      }
    };
  });
}

export function setTableState<
  T extends Record<string, any>,
  K extends keyof T,
  TableType extends {
    data: any[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  } = T[K]
>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  tableKey: K,
  data?: any[],
  pagination?: Partial<TableType["pagination"]>
) {
  setState(prev => ({
    ...prev,
    [tableKey]: {
      data: data !== undefined ? data : (prev[tableKey] as TableType).data,
      pagination: pagination !== undefined 
        ? (typeof pagination === 'object' && 'page' in pagination && Object.keys(pagination).length === 1
            ? { ...(prev[tableKey] as TableType).pagination, ...pagination }
            : pagination)
        : (prev[tableKey] as TableType).pagination
    }
  }));
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

export function notifyInfo(message: string) {
  toast.info(message, {
    autoClose: 3000,
    hideProgressBar: false,
    transition: Slide,
  });
}

export function notifyError(err: any, onReportIncident?: (errorData: any) => void) {
  const data = err?.response?.data as ApiError | undefined;
  const errorCode = data?.error?.code || data?.code || "ERROR";
  const errorMessage = data?.error?.message || data?.message || "Ocurrió algo inesperado";
  const errorDetails = data?.error?.details;
  const validationErrors = data?.errors;

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

export function TableLoadingNode({ message }: { message: string }) {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function TableEmptyNode({ 
  title, 
  description, 
  buttonText,
  onAction,
  icon
}: { 
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      {icon || (
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      )}
      <div className="text-center">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={onAction}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  );
}

export function TableErrorNode({ 
  title, 
  description, 
  buttonText,
  onRetry 
}: { 
  title: string;
  description: string;
  buttonText: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        {buttonText}
      </button>
    </div>
  );
}
