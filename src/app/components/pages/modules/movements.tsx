import Breadcrumb from "../../molecules/Breadcrumb";
import Table from "../../organisms/Table";
import Pagination, { type PaginationState } from "../../organisms/Pagination";
import Modal from "../../atoms/Modal";
import { useEffect, useState } from "react";
import api from "../../../core/config/Axios";

type ModalName = "detail";

type InventoryMovementType = "IN" | "OUT" | "LOSS" | "REFUND" | "ADJUSTMENT";
type InventoryMovementStatus = "CONFIRMED" | "PENDING";

interface InventoryMovement {
  id: string;
  date: string;
  type: InventoryMovementType;
  origin: string;
  responsible: string;
  status?: InventoryMovementStatus;
  totalAmount: number;
  currency: 'USD' | 'EUR' | 'MXN';
}

interface InventoryMovementItem {
  id: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface InventoryMovementDetail extends InventoryMovement {
  user?: string;
  reference?: string;
  description?: string;
  status: InventoryMovementStatus;
  currency: 'USD' | 'EUR' | 'MXN';
}

interface PaginationInfo {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ListResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

interface MovementDetailResponse {
  movement: InventoryMovementDetail;
  items: ListResponse<InventoryMovementItem>;
}

interface MovementsState {
  modals: Record<ModalName, boolean>;

  filters: {
    dateFrom: string;
    dateTo: string;
    type: InventoryMovementType | "";
  };

  detail: {
    movementId: string | null;
    data: MovementDetailResponse | null;
  };

  movements: {
    data: InventoryMovement[];
    pagination: PaginationState;
  };
}

export default function Movements() {
  const [state, setState] = useState<MovementsState>({
    modals: {
      detail: false,
    },

    filters: {
      dateFrom: "",
      dateTo: "",
      type: "",
    },

    detail: {
      movementId: null,
      data: null,
    },

    movements: {
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
  });

  const openDetail = async (movementId: string) => {
    const response = await api.get<MovementDetailResponse>(`/movimientos/${movementId}`);
    setState(s => ({
      ...s,
      detail: {
        movementId,
        data: response.data,
      },
      modals: { ...s.modals, detail: true },
    }));
  };

  const closeDetail = () => {
    setState(s => ({
      ...s,
      detail: {
        movementId: null,
        data: null,
      },
      modals: { ...s.modals, detail: false },
    }));
  };

  const fetchMovements = async (page: number = 1, perPage: number = 10) => {
    const response = await api.post<ListResponse<InventoryMovement>>("/movimientos", { page, perPage });

    setState(s => ({
      ...s,
      movements: {
        data: response.data.data,
        pagination: response.data.pagination,
      },
    }));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeBadgeColor = (type: InventoryMovementType): string => {
    switch (type) {
      case "IN":
        return "bg-green-100 text-green-700";
      case "OUT":
        return "bg-blue-100 text-blue-700";
      case "LOSS":
        return "bg-red-100 text-red-700";
      case "REFUND":
        return "bg-yellow-100 text-yellow-700";
      case "ADJUSTMENT":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeLabel = (type: InventoryMovementType): string => {
    switch (type) {
      case "IN":
        return "Entrada";
      case "OUT":
        return "Salida";
      case "LOSS":
        return "Merma";
      case "REFUND":
        return "Reembolso";
      case "ADJUSTMENT":
        return "Ajuste";
      default:
        return type;
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Movimientos" },
          ]}
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
          <p className="text-gray-600">
            Historial de todos los movimientos de productos en tu inventario.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Desde</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 border-gray-300"
              value={state.filters.dateFrom}
              onChange={(e) => setState(s => ({
                ...s,
                filters: { ...s.filters, dateFrom: e.target.value }
              }))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Hasta</label>
            <input
              type="date"
              className="border rounded-lg px-3 py-2 border-gray-300"
              value={state.filters.dateTo}
              onChange={(e) => setState(s => ({
                ...s,
                filters: { ...s.filters, dateTo: e.target.value }
              }))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tipo</label>
            <select
              className="border rounded-lg px-3 py-2 border-gray-300"
              value={state.filters.type}
              onChange={(e) => setState(s => ({
                ...s,
                filters: { ...s.filters, type: e.target.value as InventoryMovementType | "" }
              }))}
            >
              <option value="">Todos</option>
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
              <option value="LOSS">Merma</option>
              <option value="REFUND">Reembolso</option>
              <option value="ADJUSTMENT">Ajuste</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setState(s => ({
                ...s,
                filters: { dateFrom: "", dateTo: "", type: "" }
              }))}
              className="rounded border border-gray-400 px-4 py-2 hover:bg-gray-50 text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>

        <Table
          data={state.movements.data}
          columns={[
            {
              key: "date",
              header: "Fecha",
              render: (movement: InventoryMovement) => (
                <span className="text-sm">{formatDate(movement.date)}</span>
              )
            },
            {
              key: "type",
              header: "Tipo",
              render: (movement: InventoryMovement) => (
                <span className={`text-xs font-medium px-2 py-1 rounded ${getTypeBadgeColor(movement.type)}`}>
                  {getTypeLabel(movement.type)}
                </span>
              )
            },
            {
              key: "origin",
              header: "Origen",
              render: (movement: InventoryMovement) => (
                <span className="font-medium">{movement.origin}</span>
              )
            },
            {
              key: "responsible",
              header: "Responsable",
              render: (movement: InventoryMovement) => (
                <span className="text-sm">{movement.responsible}</span>
              )
            },
            {
              key: "totalAmount",
              header: "Monto Total",
              render: (movement: InventoryMovement) => (
                <span className="text-sm font-semibold text-blue-600">
                  {formatCurrency(movement.totalAmount, movement.currency)}
                </span>
              )
            },
            {
              key: "actions",
              header: "Acciones",
              align: "right",
              render: (movement: InventoryMovement) => (
                <button
                  title="Ver detalle"
                  onClick={() => openDetail(movement.id)}
                  className="hover:text-blue-600 transition text-lg"
                >
                  👁
                </button>
              )
            }
          ]}
        />

        <Pagination
          pagination={state.movements.pagination}
          onChange={(page: number) => fetchMovements(page)}
        />
      </div>

      <Modal open={state.modals.detail} onClose={closeDetail}>
        <div className="w-[700px] rounded-2xl bg-white p-6 flex flex-col gap-6 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Detalle del Movimiento</h2>
            <p className="text-sm text-gray-500">
              Información completa del movimiento de inventario.
            </p>
          </div>

          {state.detail.data && (
            <>
              {/* Section 1: General Information */}
              <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Información General</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">ID</label>
                    <p className="text-sm font-mono">{state.detail.data.movement.id}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Fecha</label>
                    <p className="text-sm">{formatDate(state.detail.data.movement.date)}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Tipo</label>
                    <p className={`text-xs font-medium px-2 py-1 rounded w-fit ${getTypeBadgeColor(state.detail.data.movement.type)}`}>
                      {getTypeLabel(state.detail.data.movement.type)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Estado</label>
                    <p className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded w-fit">
                      {state.detail.data.movement.status}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Origen</label>
                    <p className="text-sm">{state.detail.data.movement.origin}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Responsable</label>
                    <p className="text-sm font-medium">{state.detail.data.movement.responsible}</p>
                  </div>

                  {state.detail.data.movement.reference && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-gray-500">Referencia</label>
                      <p className="text-sm font-mono">{state.detail.data.movement.reference}</p>
                    </div>
                  )}

                  {state.detail.data.movement.description && (
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="text-xs font-semibold text-gray-500">Descripción</label>
                      <p className="text-sm">{state.detail.data.movement.description}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 col-span-2 bg-blue-50 p-3 rounded border border-blue-200">
                    <label className="text-xs font-semibold text-blue-700">Monto Total</label>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(state.detail.data.movement.totalAmount, state.detail.data.movement.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Products / Items Table */}
              <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Productos en este movimiento</h3>

                <Table
                  data={state.detail.data.items.data}
                  columns={[
                    {
                      key: "productName",
                      header: "Producto",
                      render: (item: InventoryMovementItem) => (
                        <span className="text-sm font-medium">{item.productName}</span>
                      )
                    },
                    {
                      key: "quantity",
                      header: "Cantidad",
                      render: (item: InventoryMovementItem) => (
                        <span className="text-sm">{item.quantity}</span>
                      )
                    },
                    {
                      key: "unitCost",
                      header: "Costo Unitario",
                      render: (item: InventoryMovementItem) => (
                        <span className="text-sm">
                          {formatCurrency(item.unitCost, state.detail.data?.movement.currency || 'USD')}
                        </span>
                      )
                    },
                    {
                      key: "totalCost",
                      header: "Costo Total",
                      render: (item: InventoryMovementItem) => (
                        <span className="text-sm font-semibold">
                          {formatCurrency(item.totalCost, state.detail.data?.movement.currency || 'USD')}
                        </span>
                      )
                    }
                  ]}
                />

                {state.detail.data.items.pagination && (
                  <Pagination
                    pagination={state.detail.data.items.pagination}
                    onChange={() => {
                      // Pagination is simulated - in a real case, another call would be made
                    }}
                  />
                )}
              </div>

              {/* Section 3: Totals Summary */}
              <div className="border-t border-gray-200 pt-4 flex flex-col gap-4 bg-gray-50 p-4 rounded">
                <h3 className="text-sm font-semibold">Resumen de Totales</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Total de Productos</label>
                    <p className="text-lg font-bold">{state.detail.data.items.data.length}</p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Cantidad Total</label>
                    <p className="text-lg font-bold">
                      {state.detail.data.items.data.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Monto Total</label>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(state.detail.data.movement.totalAmount, state.detail.data.movement.currency)}
                    </p>
                  </div>
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
    </>
  );
}
