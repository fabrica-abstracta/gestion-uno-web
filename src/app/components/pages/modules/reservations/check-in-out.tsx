import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Modal from "../../../atoms/modal";
import type { LoadState } from "../../../atoms/modal";
import {
  buttonStyles,
  flexColGap2,
  flexJustifyEndGap3,
  formTextStyles,
  inputStyles,
  modalStyle,
  spinnerStyle,
  buttonBlueLabel,
} from "../../../../core/helpers/styles";
import { loadingButton } from "../../../../core/helpers/shared";
import { icons } from "../../../../core/helpers/icons";
import {
  reservationCheckSchema,
  statusLabels,
  statusColors,
  type ReservationCheckInput,
  type ReservationStatus,
} from "../../../../core/validations/reservations";

interface ReservationDetail {
  id: string;
  code: string;
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    currency: string;
    description: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocument: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: ReservationStatus;
  statusLabel: string;
  notes: string;
  cancellationReason: string;
  actualCheckInDate: string | null;
  actualCheckOutDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CheckInOutState {
  load: LoadState;
  loadAPI: LoadState;
  modal: LoadState;
  reservation: ReservationDetail | null;
  modals: {
    updateStatus: boolean;
  };
  selectedStatus: ReservationStatus | null;
}

export default function CheckInOut() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [state, setState] = useState<CheckInOutState>({
    load: "loading",
    loadAPI: "idle",
    modal: "idle",
    reservation: null,
    modals: {
      updateStatus: false,
    },
    selectedStatus: null,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<ReservationCheckInput>({
    resolver: zodResolver(reservationCheckSchema),
    defaultValues: {
      status: "confirmed",
      cancellationReason: "",
      notes: "",
    },
    mode: "onChange",
  });

  const loadReservation = () => {
    setState(prev => ({ ...prev, load: "loading" }));

    api.get(`/reservations/${id}`)
      .then(res => {
        setState(prev => ({
          ...prev,
          load: "ok",
          reservation: res.data,
        }));
      })
      .catch(() => {
        setState(prev => ({ ...prev, load: "error" }));
      });
  };

  useEffect(() => {
    document.title = "Gestión Uno - Detalle de Reserva";
    if (id) {
      loadReservation();
    }
  }, [id]);

  const handleStatusUpdate = (newStatus: ReservationStatus) => {
    reset({
      status: newStatus,
      cancellationReason: "",
      notes: state.reservation?.notes || "",
    });
    setState(prev => ({
      ...prev,
      selectedStatus: newStatus,
      modals: { ...prev.modals, updateStatus: true },
    }));
  };

  const onSubmitStatusUpdate = (data: ReservationCheckInput) => {
    setState(prev => ({ ...prev, loadAPI: "loading" }));

    api.patch(`/reservations/${id}/status`, data)
      .then(() => {
        loadReservation();
        setState(prev => ({
          ...prev,
          loadAPI: "idle",
          modals: { ...prev.modals, updateStatus: false },
          selectedStatus: null,
        }));
      })
      .catch(() => {
        setState(prev => ({ ...prev, loadAPI: "error" }));
      });
  };

  if (state.load === "loading") {
    return <LoadingView />;
  }

  if (state.load === "error" || !state.reservation) {
    return <ErrorView onRetry={loadReservation} onBack={() => navigate("/reservations")} />;
  }

  const reservation = state.reservation;
  const canCheckIn = ["pending", "confirmed"].includes(reservation.status);
  const canCheckOut = reservation.status === "checked-in";
  const canCancel = !["cancelled", "completed", "checked-out"].includes(reservation.status);
  const canComplete = reservation.status === "checked-out";

  return (
    <>
      <div className="mx-auto max-w-5xl py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link to="/reservations" className="text-gray-400 hover:text-gray-600">
                {icons.arrowLeft}
              </Link>
              <h1 className="text-2xl font-bold">Detalle de Reserva</h1>
            </div>
            <p className="text-gray-600">Código: {reservation.code}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[reservation.status]}`}>
            {reservation.statusLabel}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Acciones Rápidas</h2>
          <div className="flex flex-wrap gap-3">
            {canCheckIn && (
              <button
                onClick={() => handleStatusUpdate("checked-in")}
                className={buttonStyles.green}
              >
                {icons.checkCircle} Realizar Check-in
              </button>
            )}
            {canCheckOut && (
              <button
                onClick={() => handleStatusUpdate("checked-out")}
                className={buttonStyles.blue}
              >
                {icons.checkCircle} Realizar Check-out
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => handleStatusUpdate("completed")}
                className={buttonStyles.blue}
              >
                {icons.check} Marcar como Completada
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => handleStatusUpdate("cancelled")}
                className={buttonStyles.red}
              >
                {icons.x} Cancelar Reserva
              </button>
            )}
            {reservation.status === "pending" && (
              <button
                onClick={() => handleStatusUpdate("confirmed")}
                className={buttonStyles.blue}
              >
                {icons.check} Confirmar Reserva
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Información del Producto</h2>
            <InfoRow label="Nombre" value={reservation.product.name} />
            <InfoRow label="SKU" value={reservation.product.sku} />
            <InfoRow label="Descripción" value={reservation.product.description || "N/A"} />
            <InfoRow
              label="Precio Unitario"
              value={`${reservation.product.currency} ${reservation.product.price.toFixed(2)}`}
            />
            <InfoRow label="Cantidad" value={reservation.quantity.toString()} />
            <InfoRow
              label="Precio Total"
              value={`${reservation.currency} ${reservation.totalPrice.toFixed(2)}`}
              highlight
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Información del Cliente</h2>
            <InfoRow label="Nombre" value={reservation.customerName} />
            <InfoRow label="Email" value={reservation.customerEmail} />
            <InfoRow label="Teléfono" value={reservation.customerPhone || "N/A"} />
            <InfoRow label="Documento" value={reservation.customerDocument || "N/A"} />
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Fechas y Horarios</h2>
            <InfoRow
              label="Check-in Programado"
              value={`${new Date(reservation.checkInDate).toLocaleDateString()} ${reservation.checkInTime}`}
            />
            <InfoRow
              label="Check-out Programado"
              value={`${new Date(reservation.checkOutDate).toLocaleDateString()} ${reservation.checkOutTime}`}
            />
            {reservation.actualCheckInDate && (
              <InfoRow
                label="Check-in Real"
                value={new Date(reservation.actualCheckInDate).toLocaleString()}
                highlight
              />
            )}
            {reservation.actualCheckOutDate && (
              <InfoRow
                label="Check-out Real"
                value={new Date(reservation.actualCheckOutDate).toLocaleString()}
                highlight
              />
            )}
            <InfoRow
              label="Duración"
              value={calculateDuration(reservation.checkInDate, reservation.checkOutDate)}
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Información Adicional</h2>
            <InfoRow label="Estado" value={reservation.statusLabel} />
            <InfoRow label="Notas" value={reservation.notes || "N/A"} />
            {reservation.cancellationReason && (
              <InfoRow label="Razón de Cancelación" value={reservation.cancellationReason} alert />
            )}
            <InfoRow
              label="Fecha de Creación"
              value={new Date(reservation.createdAt).toLocaleString()}
            />
            <InfoRow
              label="Última Actualización"
              value={new Date(reservation.updatedAt).toLocaleString()}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Línea de Tiempo</h2>
          <div className="space-y-3">
            <TimelineItem
              label="Reserva Creada"
              date={new Date(reservation.createdAt).toLocaleString()}
              status="completed"
            />
            {reservation.status !== "pending" && (
              <TimelineItem
                label="Reserva Confirmada"
                date={new Date(reservation.updatedAt).toLocaleString()}
                status="completed"
              />
            )}
            {reservation.actualCheckInDate && (
              <TimelineItem
                label="Check-in Realizado"
                date={new Date(reservation.actualCheckInDate).toLocaleString()}
                status="completed"
              />
            )}
            {reservation.actualCheckOutDate && (
              <TimelineItem
                label="Check-out Realizado"
                date={new Date(reservation.actualCheckOutDate).toLocaleString()}
                status="completed"
              />
            )}
            {reservation.status === "cancelled" && (
              <TimelineItem
                label="Reserva Cancelada"
                date={new Date(reservation.updatedAt).toLocaleString()}
                status="cancelled"
              />
            )}
            {reservation.status === "completed" && (
              <TimelineItem
                label="Reserva Completada"
                date={new Date(reservation.updatedAt).toLocaleString()}
                status="completed"
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        open={state.modals.updateStatus}
        load={state.modal}
        onClose={() => {
          setState(prev => ({
            ...prev,
            modals: { ...prev.modals, updateStatus: false },
            selectedStatus: null,
          }));
        }}
      >
        <form
          onSubmit={handleSubmit(onSubmitStatusUpdate)}
          className={`mx-auto max-w-[520px] ${modalStyle}`}
        >
          <div>
            <h2 className="text-xl font-semibold">Actualizar Estado</h2>
            <p className="text-sm text-gray-500">
              {state.selectedStatus && `Cambiar estado a: ${statusLabels[state.selectedStatus]}`}
            </p>
          </div>

          <div className={flexColGap2}>
            <input type="hidden" {...register("status")} />

            {state.selectedStatus === "cancelled" && (
              <div>
                <label className={formTextStyles.label}>Razón de Cancelación *</label>
                <textarea
                  rows={3}
                  className={inputStyles.base}
                  placeholder="Explica por qué se cancela la reserva"
                  {...register("cancellationReason")}
                />
              </div>
            )}

            <div>
              <label className={formTextStyles.label}>Notas Adicionales</label>
              <textarea
                rows={3}
                className={inputStyles.base}
                placeholder="Notas adicionales sobre el cambio de estado"
                {...register("notes")}
              />
            </div>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => {
                setState(prev => ({
                  ...prev,
                  modals: { ...prev.modals, updateStatus: false },
                  selectedStatus: null,
                }));
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isValid || isSubmitting || state.loadAPI === "loading"}
              className={`${buttonStyles.blue} flex items-center justify-center gap-2 ${
                !isValid || state.loadAPI === "loading" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {state.loadAPI === "loading"
                ? loadingButton("Actualizando…", spinnerStyle, buttonBlueLabel)
                : "Confirmar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// Helper Components
function InfoRow({
  label,
  value,
  highlight = false,
  alert = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-gray-600 font-medium">{label}:</span>
      <span
        className={`text-sm text-right ${
          highlight
            ? "font-semibold text-blue-600"
            : alert
            ? "font-medium text-red-600"
            : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  status,
}: {
  label: string;
  date: string;
  status: "completed" | "cancelled";
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-3 h-3 rounded-full mt-1 ${
          status === "completed" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="mx-auto max-w-5xl py-20 flex justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">Cargando reserva...</p>
      </div>
    </div>
  );
}

function ErrorView({ onRetry, onBack }: { onRetry: () => void; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-5xl py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900">Error al cargar la reserva</p>
          <p className="text-sm text-gray-500 mt-1">No se pudieron cargar los datos</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className={buttonStyles.white}>
            Volver al listado
          </button>
          <button onClick={onRetry} className={buttonStyles.blue}>
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Functions
function calculateDuration(checkIn: string, checkOut: string): string {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} ${diffDays === 1 ? "día" : "días"}`;
}
