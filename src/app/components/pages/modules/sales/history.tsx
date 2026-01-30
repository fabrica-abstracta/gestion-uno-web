import Table from "../../../organisms/Table";
import Pagination, { type PaginationState } from "../../../organisms/Pagination";
import Modal from "../../../atoms/Modal";
import Input from "../../../atoms/Input";
import Select from "../../../atoms/Select";
import { useEffect, useState } from "react";
import api from "../../../../core/config/Axios";

interface HistoryTransaction {
  id: string;
  date: string;
  type: 'SALE' | 'PURCHASE';
  code: string;
  taxId: string;
  paymentMethod: 'CASH' | 'YAPE' | 'PLIN' | 'CARD';
  totalAmount: number;
  currency: 'PEN' | 'USD';
  status: 'PAID' | 'PENDING' | 'CANCELLED';
}

interface HistorySummary {
  period?: {
    from: string;
    to: string;
    month: string;
  };
  totalSales: number;
  totalPurchases: number;
  transactions: number;
  netResult: number;
  currency: string;
}

interface HistoryItem {
  id: string;
  concept: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface HistoryDetail {
  id: string;
  date: string;
  type: 'SALE' | 'PURCHASE';
  code: string;
  taxId: string;
  paymentMethod: 'CASH' | 'YAPE' | 'PLIN' | 'CARD';
  reference?: string;
  currency: string;
  totalAmount: number;
  status: 'PAID' | 'PENDING' | 'CANCELLED';
}

interface Pagination {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ListResponse<T> {
  data: T[];
  pagination: Pagination;
}

interface DetailResponse {
  transaction: HistoryDetail;
  items: ListResponse<HistoryItem>;
  summary: {
    subtotal: number;
    tax: number;
    total: number;
  };
}

interface HistoryState {
  modals: {
    settings: boolean;
    detailSettings: boolean;
    detail: boolean;
  };

  filters: {
    dateFrom: string;
    dateTo: string;
    type: 'ALL' | 'SALE' | 'PURCHASE';
  };

  settings: {
    dateRangeMode: 'current' | 'last' | 'last3' | 'custom';
    customDateFrom: string;
    customDateTo: string;
  };

  summaryDateRange: {
    from: string;
    to: string;
  };

  summary: HistorySummary | null;

  transactions: {
    data: HistoryTransaction[];
    pagination: PaginationState;
  };

  detail: {
    transactionId: string | null;
    data: DetailResponse | null;
  };

  print: {
    receipt: ReceiptData | null;
    isVisible: boolean;
  };
}

export default function History() {
  const [state, setState] = useState<HistoryState>({
    modals: {
      settings: false,
      detailSettings: false,
      detail: false,
    },

    filters: {
      dateFrom: '',
      dateTo: '',
      type: 'ALL',
    },

    settings: {
      dateRangeMode: 'current',
      customDateFrom: '',
      customDateTo: '',
    },

    summaryDateRange: {
      from: '',
      to: '',
    },

    summary: null,

    transactions: {
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
      transactionId: null,
      data: null,
    },

    print: {
      receipt: null,
      isVisible: false,
    },
  });

  const fetchSummary = async (from?: string, to?: string) => {
    const response = await api.post<HistorySummary>("/history/summary", {
      from: from || state.summaryDateRange.from || '',
      to: to || state.summaryDateRange.to || '',
    });
    setState(s => ({
      ...s,
      summary: response.data,
      summaryDateRange: {
        from: from || s.summaryDateRange.from || '',
        to: to || s.summaryDateRange.to || '',
      }
    }));
  };

  const fetchTransactions = async (page: number = 1) => {
    const response = await api.post<ListResponse<HistoryTransaction>>("/history", {
      page,
      perPage: 10,
      dateFrom: state.filters.dateFrom,
      dateTo: state.filters.dateTo,
      type: state.filters.type,
    });

    setState(s => ({
      ...s,
      transactions: {
        data: response.data.data,
        pagination: response.data.pagination,
      },
    }));
  };

  const openDetail = async (transactionId: string) => {
    const response = await api.get<DetailResponse>(`/history/${transactionId}`);
    setState(s => ({
      ...s,
      detail: {
        transactionId,
        data: response.data,
      },
      modals: { ...s.modals, detail: true },
    }));
  };

  const closeDetail = () => {
    setState(s => ({
      ...s,
      detail: {
        transactionId: null,
        data: null,
      },
      modals: { ...s.modals, detail: false },
    }));
  };

  const openSettings = () => {
    setState(s => ({
      ...s,
      modals: { ...s.modals, settings: true },
    }));
  };

  const closeSettings = () => {
    setState(s => ({
      ...s,
      modals: { ...s.modals, settings: false },
    }));
  };

  const openDetailSettings = () => {
    setState(s => ({
      ...s,
      modals: { ...s.modals, detailSettings: true },
    }));
  };

  const closeDetailSettings = () => {
    setState(s => ({
      ...s,
      modals: { ...s.modals, detailSettings: false },
    }));
  };

  const openReceipt = async (transactionId: string) => {
    try {
      const response = await api.get<DetailResponse>(`/history/${transactionId}`);
      const detail = response.data;

      // Convert DetailResponse to ReceiptData
      const receiptData: ReceiptData = {
        code: detail.transaction.code,
        date: detail.transaction.date,
        paymentMethod: detail.transaction.paymentMethod,
        subtotal: detail.summary.subtotal,
        tax: detail.summary.tax,
        total: detail.summary.total,
        items: detail.items.data.map(item => ({
          product: item.concept,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        status: detail.transaction.status as 'PAID' | 'PENDING' | 'CANCELLED',
        taxId: detail.transaction.taxId,
        businessName: 'Mi Negocio',
      };

      setState(s => ({
        ...s,
        print: {
          receipt: receiptData,
          isVisible: true,
        },
      }));

      // Trigger print dialog after render
      setTimeout(() => {
        window.print();
        
        // Close receipt after print dialog closes
        const handleAfterPrint = () => {
          closeReceipt();
          window.removeEventListener('afterprint', handleAfterPrint);
        };
        window.addEventListener('afterprint', handleAfterPrint);
      }, 100);
    } catch (error) {
      console.error('Error opening receipt:', error);
    }
  };

  const closeReceipt = () => {
    setState(s => ({
      ...s,
      print: {
        receipt: null,
        isVisible: false,
      },
    }));
  };

  const applySummaryDateRange = async () => {
    const today = new Date();
    let from = '';
    let to = today.toISOString().split('T')[0];

    if (state.settings.dateRangeMode === 'current') {
      from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    } else if (state.settings.dateRangeMode === 'last') {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      from = lastMonth.toISOString().split('T')[0];
      to = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    } else if (state.settings.dateRangeMode === 'last3') {
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      from = threeMonthsAgo.toISOString().split('T')[0];
    } else if (state.settings.dateRangeMode === 'custom') {
      from = state.settings.customDateFrom;
      to = state.settings.customDateTo;
    }

    await fetchSummary(from, to);

    setState(s => ({
      ...s,
      modals: { ...s.modals, detailSettings: false },
    }));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getTypeBadgeColor = (type: string): string => {
    return type === 'SALE'
      ? 'bg-green-100 text-green-700'
      : 'bg-blue-100 text-blue-700';
  };

  const getTypeLabel = (type: string): string => {
    return type === 'SALE' ? 'Venta' : 'Compra';
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Historial" },
          ]}
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Historial de Transacciones</h1>
          <p className="text-gray-600">
            Consulta el historial completo de ventas y compras
          </p>
        </div>

        {state.summary && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Resumen Financiero</h2>
              <button
                onClick={openDetailSettings}
                className="flex items-center gap-2 px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 font-medium text-sm"
              >
                <span>⚙️</span>
                <span>Configurar</span>
              </button>
            </div>
            
            {state.summaryDateRange && (
              <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                Mostrando resumen para: <strong>{state.summaryDateRange.from}</strong> a <strong>{state.summaryDateRange.to}</strong>
              </p>
            )}

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 uppercase">Total de Ventas</label>
                <p className="text-2xl font-bold text-green-600">
                  S/.{state.summary.totalSales.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{state.summary.period?.month}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 uppercase">Total de Compras</label>
                <p className="text-2xl font-bold text-blue-600">
                  S/.{state.summary.totalPurchases.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{state.summary.period?.month}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 uppercase">Total Transacciones</label>
                <p className="text-2xl font-bold text-purple-600">
                  {state.summary.transactions}
                </p>
                <p className="text-xs text-gray-500">{state.summary.period?.month}</p>
              </div>

              <div className={`border rounded-lg p-4 flex flex-col gap-2 ${state.summary.netResult >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <label className="text-xs font-semibold text-gray-600 uppercase">Resultado Neto</label>
                <p className={`text-2xl font-bold ${state.summary.netResult >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  S/.{state.summary.netResult.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{state.summary.period?.month}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Desde</label>
            <Input
              type="date"
              value={state.filters.dateFrom}
              onChange={(e) => setState(s => ({
                ...s,
                filters: { ...s.filters, dateFrom: e.target.value }
              }))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Hasta</label>
            <Input
              type="date"
              value={state.filters.dateTo}
              onChange={(e) => setState(s => ({
                ...s,
                filters: { ...s.filters, dateTo: e.target.value }
              }))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tipo</label>
            <Select
              options={[
                { label: "Todos", value: "ALL" },
                { label: "Ventas", value: "SALE" },
                { label: "Compras", value: "PURCHASE" },
              ]}
              value={state.filters.type}
              onChange={(value) => setState(s => ({
                ...s,
                filters: { ...s.filters, type: value as HistoryState['filters']['type'] }
              }))}
            />
          </div>

          <button
            onClick={openSettings}
            className="ml-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 font-medium text-sm"
          >
            ⚙️ Configuración
          </button>
        </div>

        <Table
          data={state.transactions.data}
          columns={[
            {
              key: "date",
              header: "Fecha",
              render: (transaction: HistoryTransaction) => (
                <span className="text-sm">{formatDate(transaction.date)}</span>
              )
            },
            {
              key: "type",
              header: "Tipo",
              render: (transaction: HistoryTransaction) => (
                <span className={`text-xs font-medium px-2 py-1 rounded ${getTypeBadgeColor(transaction.type)}`}>
                  {getTypeLabel(transaction.type)}
                </span>
              )
            },
            {
              key: "code",
              header: "Código",
              render: (transaction: HistoryTransaction) => (
                <span className="font-mono text-sm font-medium">{transaction.code}</span>
              )
            },
            {
              key: "taxId",
              header: "Tax ID",
              render: (transaction: HistoryTransaction) => (
                <span className="text-sm">{transaction.taxId}</span>
              )
            },
            {
              key: "paymentMethod",
              header: "Método de Pago",
              render: (transaction: HistoryTransaction) => (
                <span className="text-sm">{transaction.paymentMethod}</span>
              )
            },
            {
              key: "totalAmount",
              header: "Monto Total",
              render: (transaction: HistoryTransaction) => (
                <span className="font-semibold">
                  {transaction.currency} {transaction.totalAmount.toLocaleString()}
                </span>
              )
            },
            {
              key: "status",
              header: "Estado",
              render: (transaction: HistoryTransaction) => (
                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              )
            },
            {
              key: "actions",
              header: "Acciones",
              align: "right",
              render: (transaction: HistoryTransaction) => (
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => openDetail(transaction.id)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    👁 Ver
                  </button>
                  {transaction.type === 'SALE' && (
                    <button
                      onClick={() => openReceipt(transaction.id)}
                      className="text-green-600 hover:text-green-700 font-medium text-sm"
                    >
                      🖨 Imprimir
                    </button>
                  )}
                </div>
              )
            }
          ]}
        />

        <Pagination
          pagination={state.transactions.pagination}
          onChange={(page: number) => fetchTransactions(page)}
        />
      </div>

      <Modal open={state.modals.settings} onClose={closeSettings}>
        <div className="w-[400px] rounded-2xl bg-white p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Configuración de Fechas</h2>
            <p className="text-sm text-gray-500">
              Selecciona el rango de fechas para los resúmenes
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
            {[
              { id: 'current', label: 'Mes Actual' },
              { id: 'last', label: 'Mes Anterior' },
              { id: 'custom', label: 'Rango Personalizado' },
            ].map((option) => (
              <label key={option.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="radio"
                  name="dateRange"
                  value={option.id}
                  checked={state.settings.dateRangeMode === option.id as HistoryState['settings']['dateRangeMode']}
                  onChange={(e) => setState(s => ({
                    ...s,
                    settings: { ...s.settings, dateRangeMode: e.target.value as HistoryState['settings']['dateRangeMode'] }
                  }))}
                />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={closeSettings}
              className="rounded border border-gray-400 px-4 py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={closeSettings}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Aplicar
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={state.modals.detail} onClose={closeDetail}>
        <div className="w-[700px] rounded-2xl bg-white p-6 flex flex-col gap-6 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Detalle de Transacción</h2>
            <p className="text-sm text-gray-500">
              Información completa y auditable
            </p>
          </div>

          {state.detail.data && (
            <>
              <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Información General</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">ID Transacción</label>
                    <p className="text-sm font-mono">{state.detail.data.transaction.id}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Fecha</label>
                    <p className="text-sm">{formatDate(state.detail.data.transaction.date)}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Tipo</label>
                    <p className={`text-xs font-medium px-2 py-1 rounded w-fit ${getTypeBadgeColor(state.detail.data.transaction.type)}`}>
                      {getTypeLabel(state.detail.data.transaction.type)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Código</label>
                    <p className="text-sm font-mono">{state.detail.data.transaction.code}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Tax ID</label>
                    <p className="text-sm">{state.detail.data.transaction.taxId}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Estado</label>
                    <p className={`text-xs font-medium px-2 py-1 rounded w-fit ${getStatusBadgeColor(state.detail.data.transaction.status)}`}>
                      {state.detail.data.transaction.status}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Información de Pago</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Método de Pago</label>
                    <p className="text-sm font-medium">{state.detail.data.transaction.paymentMethod}</p>
                  </div>

                  {state.detail.data.transaction.reference && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">Referencia</label>
                      <p className="text-sm font-mono">{state.detail.data.transaction.reference}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Moneda</label>
                    <p className="text-sm font-medium">{state.detail.data.transaction.currency}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Monto Total</label>
                    <p className="text-sm font-bold text-blue-600">
                      {state.detail.data.transaction.currency} {state.detail.data.transaction.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Productos / Conceptos</h3>

                <Table
                  data={state.detail.data.items.data}
                  columns={[
                    {
                      key: "concept",
                      header: "Concepto",
                      render: (item: HistoryItem) => (
                        <span className="text-sm">{item.concept}</span>
                      )
                    },
                    {
                      key: "quantity",
                      header: "Cantidad",
                      render: (item: HistoryItem) => (
                        <span className="text-sm text-right">{item.quantity}</span>
                      )
                    },
                    {
                      key: "unitPrice",
                      header: "Precio Unitario",
                      render: (item: HistoryItem) => (
                        <span className="text-sm text-right">S/.{item.unitPrice.toLocaleString()}</span>
                      )
                    },
                    {
                      key: "totalPrice",
                      header: "Total",
                      render: (item: HistoryItem) => (
                        <span className="text-sm font-semibold text-right">S/.{item.totalPrice.toLocaleString()}</span>
                      )
                    }
                  ]}
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
              className="rounded border border-gray-400 px-4 py-2 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={state.modals.detailSettings} onClose={closeDetailSettings}>
        <div className="w-[600px] rounded-2xl bg-white p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Configurar Rango de Resumen</h2>
            <p className="text-sm text-gray-500">
              Selecciona un período o personaliza el rango de fechas
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Períodos Predefinidos</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      settings: {...prev.settings, dateRangeMode: 'current'}
                    }));
                  }}
                  className={`px-4 py-2 rounded border-2 transition ${
                    state.settings.dateRangeMode === 'current'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  Mes Actual
                </button>
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      settings: {...prev.settings, dateRangeMode: 'last'}
                    }));
                  }}
                  className={`px-4 py-2 rounded border-2 transition ${
                    state.settings.dateRangeMode === 'last'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  Mes Anterior
                </button>
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      settings: {...prev.settings, dateRangeMode: 'last3'}
                    }));
                  }}
                  className={`px-4 py-2 rounded border-2 transition ${
                    state.settings.dateRangeMode === 'last3'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  Últimos 3 Meses
                </button>
                <button
                  onClick={() => {
                    setState(prev => ({
                      ...prev,
                      settings: {...prev.settings, dateRangeMode: 'custom'}
                    }));
                  }}
                  className={`px-4 py-2 rounded border-2 transition ${
                    state.settings.dateRangeMode === 'custom'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  Personalizado
                </button>
              </div>
            </div>

            {state.settings.dateRangeMode === 'custom' && (
              <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded border border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Desde</label>
                    <input
                      type="date"
                      value={state.settings.customDateFrom}
                      onChange={(e) => {
                        setState(prev => ({
                          ...prev,
                          settings: {...prev.settings, customDateFrom: e.target.value}
                        }));
                      }}
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Hasta</label>
                    <input
                      type="date"
                      value={state.settings.customDateTo}
                      onChange={(e) => {
                        setState(prev => ({
                          ...prev,
                          settings: {...prev.settings, customDateTo: e.target.value}
                        }));
                      }}
                      className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={closeDetailSettings}
              className="rounded border border-gray-400 px-4 py-2 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={applySummaryDateRange}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium"
            >
              Aplicar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
