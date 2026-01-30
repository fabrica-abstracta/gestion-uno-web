import Breadcrumb from "../../../molecules/Breadcrumb";
import Table from "../../../organisms/Table";
import Pagination, { type PaginationState } from "../../../organisms/Pagination";
import Modal from "../../../atoms/Modal";
import { useEffect, useState } from "react";
import api from "../../../../core/config/Axios";

interface PaymentIntent {
  id: string;
  code: string;
  date: string;
  saleCode: string;
  method: 'CASH' | 'YAPE' | 'PLIN' | 'CARD';
  totalAmount: number;
  currency: 'PEN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface PaymentIntentItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface PaymentIntentDetail {
  id: string;
  code: string;
  date: string;
  saleCode: string;
  method: 'CASH' | 'YAPE' | 'PLIN' | 'CARD';
  reference?: string;
  totalAmount: number;
  currency: 'PEN';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface PaginationData {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ListResponse<T> {
  data: T[];
  pagination: PaginationData;
}

interface DetailResponse {
  paymentIntent: PaymentIntentDetail;
  items: {
    data: PaymentIntentItem[];
  };
  summary: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

interface PaymentIntentsHistoryState {
  modals: {
    detail: boolean;
    approveConfirm: boolean;
    rejectConfirm: boolean;
  };

  intents: {
    data: PaymentIntent[];
    pagination: PaginationState;
  };

  detail: {
    intentId: string | null;
    data: DetailResponse | null;
  };

  confirmAction: {
    intentId: string | null;
    action: 'APPROVE' | 'REJECT' | null;
  };
}

const formatDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Pendiente';
    case 'APPROVED':
      return 'Aprobado';
    case 'REJECTED':
      return 'Rechazado';
    default:
      return status;
  }
};

const getMethodLabel = (method: string): string => {
  switch (method) {
    case 'CASH':
      return 'Efectivo';
    case 'YAPE':
      return 'Yape';
    case 'PLIN':
      return 'Plin';
    case 'CARD':
      return 'Tarjeta';
    default:
      return method;
  }
};

export default function PaymentIntentsHistory() {
  const [state, setState] = useState<PaymentIntentsHistoryState>({
    modals: {
      detail: false,
      approveConfirm: false,
      rejectConfirm: false,
    },

    intents: {
      data: [],
      pagination: {
        page: 1,
        perPage: 10,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },

    detail: {
      intentId: null,
      data: null,
    },

    confirmAction: {
      intentId: null,
      action: null,
    },
  });

  const fetchIntents = async (page: number = 1) => {
    const response = await api.post<ListResponse<PaymentIntent>>(
      "/payment-intents/list",
      { page, perPage: 10 }
    );

    setState(s => ({
      ...s,
      intents: {
        data: response.data.data,
        pagination: {
          page: response.data.pagination.page,
          perPage: response.data.pagination.perPage,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages,
          hasNext: response.data.pagination.hasNext,
          hasPrev: response.data.pagination.hasPrev,
        },
      },
    }));
  };

  const fetchIntentDetail = async (intentId: string) => {
    const response = await api.get<DetailResponse>(`/payment-intents/${intentId}`);

    setState(s => ({
      ...s,
      detail: {
        intentId,
        data: response.data,
      },
    }));
  };

  const openDetail = async (intentId: string) => {
    await fetchIntentDetail(intentId);
    setState(s => ({
      ...s,
      modals: { ...s.modals, detail: true },
    }));
  };

  const closeDetail = () => {
    setState(s => ({
      ...s,
      modals: { ...s.modals, detail: false },
      detail: {
        intentId: null,
        data: null,
      },
    }));
  };

  const openApproveConfirm = (intentId: string) => {
    setState(s => ({
      ...s,
      confirmAction: { intentId, action: 'APPROVE' },
      modals: { ...s.modals, approveConfirm: true },
    }));
  };

  const closeApproveConfirm = () => {
    setState(s => ({
      ...s,
      confirmAction: { intentId: null, action: null },
      modals: { ...s.modals, approveConfirm: false },
    }));
  };

  const openRejectConfirm = (intentId: string) => {
    setState(s => ({
      ...s,
      confirmAction: { intentId, action: 'REJECT' },
      modals: { ...s.modals, rejectConfirm: true },
    }));
  };

  const closeRejectConfirm = () => {
    setState(s => ({
      ...s,
      confirmAction: { intentId: null, action: null },
      modals: { ...s.modals, rejectConfirm: false },
    }));
  };

  const approveIntent = async () => {
    if (!state.confirmAction.intentId) return;

    await api.post(`/payment-intents/${state.confirmAction.intentId}/approve`, {});
    closeApproveConfirm();
    await fetchIntents(state.intents.pagination.page);
  };

  const rejectIntent = async () => {
    if (!state.confirmAction.intentId) return;

    await api.post(`/payment-intents/${state.confirmAction.intentId}/reject`, {});
    closeRejectConfirm();
    await fetchIntents(state.intents.pagination.page);
  };

  const handlePaginationChange = (page: number) => {
    setState(s => ({
      ...s,
      intents: {
        ...s.intents,
        pagination: { ...s.intents.pagination, page },
      },
    }));
    fetchIntents(page);
  };

  useEffect(() => {
    fetchIntents();
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Historial de Intenciones de Pago" },
          ]}
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Historial de Intenciones de Pago</h1>
          <p className="text-gray-600">
            Revisa, aprueba y rechaza intenciones de pago pendientes
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <Table
            columns={[
              {
                key: 'date',
                header: 'Fecha',
                render: (row: PaymentIntent) => formatDate(row.date),
              },
              {
                key: 'code',
                header: 'Código Intención',
                render: (row: PaymentIntent) => (
                  <span className="font-mono text-sm font-semibold">{row.code}</span>
                ),
              },
              {
                key: 'saleCode',
                header: 'Código Venta',
                render: (row: PaymentIntent) => (
                  <span className="text-sm text-gray-600">{row.saleCode}</span>
                ),
              },
              {
                key: 'method',
                header: 'Método',
                render: (row: PaymentIntent) => getMethodLabel(row.method),
              },
              {
                key: 'totalAmount',
                header: 'Monto Total',
                render: (row: PaymentIntent) => (
                  <span className="font-semibold">
                    S/.{row.totalAmount.toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Estado',
                render: (row: PaymentIntent) => (
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadgeColor(row.status)}`}>
                    {getStatusLabel(row.status)}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: 'Acciones',
                render: (row: PaymentIntent) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetail(row.id)}
                      className="text-blue-600 hover:underline text-sm font-medium"
                      title="Ver detalle"
                    >
                      👁 Ver
                    </button>
                    {row.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => openApproveConfirm(row.id)}
                          className="text-green-600 hover:underline text-sm font-medium"
                          title="Aprobar"
                        >
                          ✅ Aprobar
                        </button>
                        <button
                          onClick={() => openRejectConfirm(row.id)}
                          className="text-red-600 hover:underline text-sm font-medium"
                          title="Rechazar"
                        >
                          ❌ Rechazar
                        </button>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
            data={state.intents.data}
          />
        </div>
      </div>

      <Modal open={state.modals.detail} onClose={closeDetail}>
        <div className="w-[700px] rounded-2xl bg-white p-6 flex flex-col gap-6 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Detalle de Intención de Pago</h2>
            <p className="text-sm text-gray-500">Información completa de la intención</p>
          </div>

          {state.detail.data && (
            <>
              <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Información General</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Código Intención</label>
                    <p className="text-sm font-mono">{state.detail.data.paymentIntent.code}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Fecha</label>
                    <p className="text-sm">{formatDate(state.detail.data.paymentIntent.date)}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Estado</label>
                    <p className={`text-xs font-medium px-2 py-1 rounded w-fit ${getStatusBadgeColor(state.detail.data.paymentIntent.status)}`}>
                      {getStatusLabel(state.detail.data.paymentIntent.status)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Código Venta</label>
                    <p className="text-sm font-mono">{state.detail.data.paymentIntent.saleCode}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Monto Total</label>
                    <p className="text-sm font-bold">S/.{state.detail.data.paymentIntent.totalAmount.toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Moneda</label>
                    <p className="text-sm">{state.detail.data.paymentIntent.currency}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Información de Pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Método de Pago</label>
                    <p className="text-sm">{getMethodLabel(state.detail.data.paymentIntent.method)}</p>
                  </div>

                  {state.detail.data.paymentIntent.reference && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">Referencia / Código Operación</label>
                      <p className="text-sm font-mono">{state.detail.data.paymentIntent.reference}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Productos / Artículos</h3>
                <Table
                  columns={[
                    {
                      key: 'product',
                      header: 'Producto',
                      render: (row: PaymentIntentItem) => row.product,
                    },
                    {
                      key: 'quantity',
                      header: 'Cantidad',
                      align: 'right',
                      render: (row: PaymentIntentItem) => row.quantity,
                    },
                    {
                      key: 'unitPrice',
                      header: 'Precio Unitario',
                      align: 'right',
                      render: (row: PaymentIntentItem) => (
                        <span className="font-medium">
                          S/.{row.unitPrice.toLocaleString()}
                        </span>
                      ),
                    },
                    {
                      key: 'totalPrice',
                      header: 'Total',
                      align: 'right',
                      render: (row: PaymentIntentItem) => (
                        <span className="font-bold">
                          S/.{row.totalPrice.toLocaleString()}
                        </span>
                      ),
                    },
                  ]}
                  data={state.detail.data.items.data}
                />
              </div>

              <div className="border-t border-gray-200 pt-4 flex flex-col gap-2 bg-gray-50 p-3 rounded">
                <h3 className="text-sm font-semibold mb-2">Resumen de Totales</h3>
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">S/.{state.detail.data.summary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>IGV (18%):</span>
                  <span className="font-medium">S/.{state.detail.data.summary.tax.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">S/.{state.detail.data.summary.total.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={closeDetail}
              className="rounded border border-gray-400 px-4 py-2 hover:bg-gray-50 font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={state.modals.approveConfirm} onClose={closeApproveConfirm}>
        <div className="w-[400px] rounded-2xl bg-white p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Confirmar Aprobación</h2>
            <p className="text-sm text-gray-500">¿Deseas aprobar esta intención de pago?</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-sm text-yellow-800">
              Esta acción aprobará la intención de pago. El pago se considerará aprobado pero no se procesará de inmediato.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={closeApproveConfirm}
              className="rounded border border-gray-400 px-4 py-2 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={approveIntent}
              className="rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700 font-medium"
            >
              Confirmar Aprobación
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={state.modals.rejectConfirm} onClose={closeRejectConfirm}>
        <div className="w-[400px] rounded-2xl bg-white p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Confirmar Rechazo</h2>
            <p className="text-sm text-gray-500">¿Deseas rechazar esta intención de pago?</p>
          </div>

          <div className="bg-red-50 border border-red-200 p-4 rounded">
            <p className="text-sm text-red-800">
              Esta acción rechazará la intención de pago. No se podrá procesar el pago.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={closeRejectConfirm}
              className="rounded border border-gray-400 px-4 py-2 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={rejectIntent}
              className="rounded bg-red-600 px-6 py-2 text-white hover:bg-red-700 font-medium"
            >
              Confirmar Rechazo
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
