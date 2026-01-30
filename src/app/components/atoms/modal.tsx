import { useEffect, type ReactNode } from "react";
import { buttonStyles, modalLabel, modalSpinner } from "../../core/helpers/styles";
import { loadingButton } from "../../core/helpers/shared";

export type idle = "idle";
export type loading = "loading";
export type ok = "ok";
export type error = "error";
export type LoadState = idle | loading | ok | error;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  load?: LoadState;
  children: ReactNode;
  onRetry?: () => void;
  loadingNode?: ReactNode;
  errorNode?: ReactNode;
  idleNode?: ReactNode;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

function getContentByLoadState(props: ModalProps) {
  const { load, children, loadingNode, errorNode, idleNode } = props;

  if (!load) return <div>{children}</div>;

  const base =
    load === "loading" || load === "error"
      ? "w-full max-w-2xl rounded-2xl bg-white shadow-xl p-24 text-gray-900"
      : "";

  switch (load) {
    case "idle":
      return idleNode ?? null;

    case "loading":
      return (
        <div className={`${base} mx-auto flex flex-col items-center justify-center gap-4`}>
          {loadingNode ?? loadingButton("Cargando…", modalSpinner, modalLabel)}
        </div>
      );

    case "error":
      return (
        <div className={`${base} mx-auto flex flex-col items-center justify-center gap-4`}>
          {errorNode ?? (
            <>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <p className="text-sm font-medium text-gray-900">
                Ocurrió un error
              </p>

              <p className="text-xs text-gray-500">
                No se pudo completar la operación
              </p>

              {props.onRetry && (
                <button
                  onClick={props.onRetry}
                  className={buttonStyles.blue}
                >
                  Reintentar
                </button>
              )}
            </>
          )}
        </div>
      );

    case "ok":
      return <div className={base}>{children}</div>;
  }
}

export default function Modal(props: ModalProps) {
  const {
    open,
    onClose,
    closeOnEscape = true,
    closeOnOverlayClick = true,
  } = props;

  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, closeOnEscape]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-start justify-center px-4 pt-4 pb-8 bg-black/30 overflow-y-auto"
      onMouseDown={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className="w-full overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {getContentByLoadState(props)}
      </div>
    </div>
  );
}
