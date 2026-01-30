import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Breadcrumb from "../../../molecules/breadcrumb";
import Input from "../../../atoms/input";
import {
  buttonStyles,
  containerStyle,
  flexWrapGap3,
  formTextStyles,
  inputStyles,
} from "../../../../core/helpers/styles";
import type { OrdersPageState } from "../../../../core/types/orders";
import {
  orderFiltersSchema,
  orderFiltersDefaultValues,
  type OrderFiltersInput,
} from "../../../../core/validations/orders";

export default function Orders() {
  const navigate = useNavigate();
  const [state, setState] = useState<OrdersPageState>({
    modal: "idle",
    loadAPI: "idle",

    orders: {
      load: "loading",
      data: [],
      pagination: {
        page: 1,
        perPage: 12,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },

    filters: {},
  });

  const filtersForm = useForm<OrderFiltersInput>({
    resolver: zodResolver(orderFiltersSchema),
    defaultValues: orderFiltersDefaultValues,
  });

  const fetchOrders = async (page: number = 1) => {
    try {
      setState((prev) => ({
        ...prev,
        orders: { ...prev.orders, load: "loading" },
      }));

      const filters = filtersForm.getValues();
      // Remove empty filter values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "" && value !== null && value !== undefined)
      );
      const response = await api.post("/orders/list", {
        page,
        perPage: state.orders.pagination.perPage,
        filters: cleanFilters,
      });

      setState((prev) => ({
        ...prev,
        orders: {
          load: "ok",
          data: response.data.data,
          pagination: response.data.pagination,
        },
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      setState((prev) => ({
        ...prev,
        orders: { ...prev.orders, load: "error" },
      }));
    }
  };

  const createNewOrder = () => {
    navigate("/orders/new");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Borrador";
      case "pending":
        return "Pendiente";
      case "processing":
        return "En Proceso";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className={containerStyle}>
      <Breadcrumb
        items={[
          { label: "Inicio", to: "/" },
          { label: "Órdenes", to: "/orders" },
        ]}
      />

      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestión de Órdenes</h1>
          <p className="text-gray-600">
            Administra las órdenes de compra y su ciclo de vida
          </p>
        </div>

        <div className={flexWrapGap3}>
          <button
            onClick={createNewOrder}
            className={buttonStyles.green}
          >
            Crear nueva orden
          </button>
        </div>

        <form
          onSubmit={filtersForm.handleSubmit(() => fetchOrders(1))}
          className={`${flexWrapGap3} items-end`}
        >
          <Input
            label="Código"
            placeholder="Buscar por código"
            containerClassName="w-full md:w-64"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filtersForm.register("code")}
          />

          <Input
            label="Cliente"
            placeholder="Buscar por cliente"
            containerClassName="w-full md:w-64"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filtersForm.register("customerName")}
          />

          <div className="flex flex-col gap-2 w-full md:w-48">
            <label className={formTextStyles.label}>Estado</label>
            <select
              {...filtersForm.register("status")}
              className={inputStyles.base}
            >
              <option value="">Todos</option>
              <option value="draft">Borrador</option>
              <option value="pending">Pendiente</option>
              <option value="processing">En Proceso</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <button type="submit" className={buttonStyles.blue}>
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              filtersForm.reset(orderFiltersDefaultValues);
              fetchOrders(1);
            }}
            className={buttonStyles.white}
          >
            Limpiar
          </button>
        </form>

        {state.orders.load === "loading" && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Cargando órdenes...</p>
            </div>
          </div>
        )}

        {state.orders.load === "error" && (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">Error al cargar órdenes</p>
              <p className="text-sm text-gray-500 mt-1">No se pudieron cargar los datos</p>
            </div>
            <button
              onClick={() => fetchOrders(state.orders.pagination.page)}
              className={buttonStyles.blue}
            >
              Reintentar
            </button>
          </div>
        )}

        {state.orders.load === "ok" && state.orders.data.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">No hay órdenes creadas</p>
              <p className="text-sm text-gray-500 mt-1">Crea tu primera orden para comenzar</p>
            </div>
            <button onClick={createNewOrder} className={buttonStyles.blue}>
              Crear nueva orden
            </button>
          </div>
        )}

        {state.orders.load === "ok" && state.orders.data.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {state.orders.data.map((order) => (
                <div
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{order.code}</h3>
                        {order.customerName && (
                          <p className="text-sm text-gray-600 mt-1">{order.customerName}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold text-gray-900">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items:</span>
                        <span className="font-medium text-gray-900">{order.itemsCount}</span>
                      </div>
                      {order.itemsPending > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pendientes:</span>
                          <span className="font-medium text-yellow-600">{order.itemsPending}</span>
                        </div>
                      )}
                      {order.itemsDispatched > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Despachados:</span>
                          <span className="font-medium text-green-600">{order.itemsDispatched}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 py-4">
              <button
                onClick={() => fetchOrders(state.orders.pagination.page - 1)}
                disabled={!state.orders.pagination.hasPrev}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  state.orders.pagination.hasPrev
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Anterior
              </button>

              <span className="text-sm text-gray-600">
                Página {state.orders.pagination.page} de {state.orders.pagination.totalPages}
              </span>

              <button
                onClick={() => fetchOrders(state.orders.pagination.page + 1)}
                disabled={!state.orders.pagination.hasNext}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  state.orders.pagination.hasNext
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
