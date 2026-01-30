import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import api from "../../../../core/config/axios";
import Breadcrumb from "../../../molecules/breadcrumb";
import Input from "../../../atoms/input";
import { Skeleton } from "../../../atoms/skeleton";
import Table from "../../../organisms/table";
import {
  buttonStyles,
  containerStyle,
  modalStyle,
  flexJustifyEndGap3,
} from "../../../../core/helpers/styles";
import { setApiState, setModalState, TableLoadingNode, TableErrorNode, notifyError } from "../../../../core/helpers/shared";
import { useSettings } from "../../../../core/helpers/useSettings";
import Modal from "../../../atoms/modal";
import { icons } from "../../../../core/helpers/icons";
import type { InventoryPageState, StockAlert, TopProduct } from "../../../../core/types/inventory";
import {
  inventoryFiltersSchema,
  inventoryFiltersDefaultValues,
  type InventoryFiltersInput,
} from "../../../../core/validations/inventory";

export default function Inventory() {
  const { settings, updateSettings } = useSettings();
  const [state, setState] = useState<InventoryPageState>({
    modal: "idle",

    apis: {
      summary: "idle",
      stockAlerts: "idle",
      topProducts: "idle",
    },

    modals: {
      settings: false,
    },

    buttons: {},

    refreshInterval: 0,

    summary: {
      totalProducts: 0,
      totalStock: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    },

    stockAlerts: {
      load: "loading",
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

    topProducts: {
      load: "loading",
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

  const {
    register: filterRegister,
    getValues: getFilterValues,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
  } = useForm<InventoryFiltersInput>({
    resolver: zodResolver(inventoryFiltersSchema),
    defaultValues: inventoryFiltersDefaultValues,
  });

  const fetchSummary = async () => {
    setApiState(setState, "summary", "loading");

    api.get("/inventory/summary")
      .then(res => {
        setState(prev => ({
          ...prev,
          summary: res.data,
        }));
        setApiState(setState, "summary", "ok");
      })
      .catch(err => {
        setApiState(setState, "summary", "error");
        notifyError(err);
      });
  };

  const fetchStockAlerts = async (page: number = 1) => {
    setState(prev => ({
      ...prev,
      stockAlerts: {
        ...prev.stockAlerts,
        load: "loading",
        pagination: {
          ...prev.stockAlerts.pagination,
          page,
        },
      },
    }));

    api.post("/inventory/products-by-type", {
      type: "alert",
      page,
      perPage: state.stockAlerts.pagination.perPage,
    })
      .then(res => {
        setState(prev => ({
          ...prev,
          stockAlerts: {
            load: "ok",
            data: res.data.data,
            pagination: res.data.pagination,
          },
        }));
      })
      .catch(err => {
        setState(prev => ({
          ...prev,
          stockAlerts: {
            ...prev.stockAlerts,
            load: "error",
          },
        }));
        notifyError(err);
      });
  };

  const fetchTopProducts = async (page: number = 1) => {
    setState(prev => ({
      ...prev,
      topProducts: {
        ...prev.topProducts,
        load: "loading",
        pagination: {
          ...prev.topProducts.pagination,
          page,
        },
      },
    }));

    api.post("/inventory/products-by-type", {
      type: "top-sales",
      page,
      perPage: state.topProducts.pagination.perPage,
      ...getFilterValues(),
    })
      .then(res => {
        setState(prev => ({
          ...prev,
          topProducts: {
            load: "ok",
            data: res.data.data,
            pagination: res.data.pagination,
          },
        }));
      })
      .catch(err => {
        setState(prev => ({
          ...prev,
          topProducts: {
            ...prev.topProducts,
            load: "error",
          },
        }));
        notifyError(err);
      });
  };

  const loadData = () => {
    fetchSummary();
    fetchStockAlerts(1);
    fetchTopProducts(1);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (settings.refreshInterval === 0) return;

    const interval = setInterval(() => {
      loadData();
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.refreshInterval]);

  return (
    <div className={containerStyle}>
      <Breadcrumb
        items={[
          { label: "Inicio", to: "/" },
          { label: "Inventario", to: "/inventory" },
        ]}
      />

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-gray-900">{icons.package}</div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Inventario
              </h1>
            </div>
            <button
              onClick={() => setModalState(setState, "settings", true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 text-blue-600 bg-blue-50 rounded-lg transition-colors"
              title="Configurar auto-actualización"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
              <span>Configurar</span>
            </button>
          </div>
          <p className="text-gray-600 mt-1">
            Administra tu inventario, marcas, categorías y unidades
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            <div>{icons.package}</div>
            <span className="text-sm font-medium">Productos</span>
          </Link>

          <Link
            to="/brands"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:underline transition-colors"
          >
            <div>{icons.tag}</div>
            <span className="text-sm font-medium">Marcas</span>
          </Link>

          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline transition-colors"
          >
            <div>{icons.folder}</div>
            <span className="text-sm font-medium">Categorías</span>
          </Link>

          <Link
            to="/units"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:underline transition-colors"
          >
            <div>{icons.ruler}</div>
            <span className="text-sm font-medium">Unidades</span>
          </Link>

          <Link
            to="/movements"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
          >
            <div>{icons.arrows}</div>
            <span className="text-sm font-medium">Movimientos</span>
          </Link>

          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 hover:underline transition-colors"
          >
            <div>{icons.chart}</div>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
        </div>

        <div className="flex flex-col gap-6 w-full">
          {state.apis.summary === "loading" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-2">Total Productos</div>
                <div className="text-3xl font-bold text-gray-900">
                  {state.summary.totalProducts}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-2">Stock Total</div>
                <div className="text-3xl font-bold text-blue-600">
                  {state.summary.totalStock}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-2">Stock Bajo</div>
                <div className="text-3xl font-bold text-orange-600">
                  {state.summary.lowStockCount}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-2">Sin Stock</div>
                <div className="text-3xl font-bold text-red-600">
                  {state.summary.outOfStockCount}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="">
              <h3 className="text-lg font-semibold text-gray-900">
                ⚠️ Alertas de Stock Mínimo
              </h3>
            </div>
            <Table<StockAlert>
              columns={[
                {
                  key: "product",
                  header: "Producto",
                  render: (row) => row.product,
                },
                {
                  key: "category",
                  header: "Categoría",
                  render: (row) => row.category,
                },
                {
                  key: "currentStock",
                  header: "Stock Actual",
                  render: (row) => (
                    <span className="font-semibold text-orange-600">{row.currentStock}</span>
                  ),
                },
                {
                  key: "minStock",
                  header: "Stock Mínimo",
                  render: (row) => row.minStock,
                },
                {
                  key: "status",
                  header: "Estado",
                  render: (row) => {
                    const percentage = row.minStock > 0 ? (row.currentStock / row.minStock) * 100 : 0;
                    if (percentage === 0) {
                      return (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Sin Stock
                        </span>
                      );
                    }
                    if (percentage < 50) {
                      return (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          Crítico
                        </span>
                      );
                    }
                    return (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Bajo
                      </span>
                    );
                  },
                },
              ]}
              data={state.stockAlerts.data}
              load={state.stockAlerts.load}
              pagination={state.stockAlerts.pagination}
              onPageChange={(page) => fetchStockAlerts(page)}
              loadingNode={<TableLoadingNode message="Cargando alertas..." />}
              emptyNode={
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">No hay alertas de stock</p>
                    <p className="text-sm text-gray-500 mt-1">Todos los productos tienen stock suficiente</p>
                  </div>
                  <Link
                    to="/products"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear tu primer producto
                  </Link>
                </div>
              }
              errorNode={<TableErrorNode title="Error al cargar alertas" description="No se pudieron cargar los datos" buttonText="Reintentar" onRetry={() => fetchStockAlerts(state.stockAlerts.pagination.page)} />}
            />
          </div>

          <div className="space-y-4">
            <div className="">
              <h3 className="text-lg font-semibold text-gray-900">
                🏆 Productos Más Vendidos
              </h3>
            </div>

            <form onSubmit={handleFilterSubmit(() => fetchTopProducts(1))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Producto"
                  placeholder="Buscar por nombre"
                  {...filterRegister("product")}
                />

                <Input
                  label="Categoría"
                  placeholder="Filtrar por categoría"
                  {...filterRegister("category")}
                />

                <Input
                  label="Marca"
                  placeholder="Filtrar por marca"
                  {...filterRegister("brand")}
                />

                <Input
                  label="Fecha desde"
                  type="date"
                  {...filterRegister("dateFrom")}
                />

                <Input
                  label="Fecha hasta"
                  type="date"
                  {...filterRegister("dateTo")}
                />
              </div>

              <div className="flex gap-3 items-end flex-col md:flex-row justify-end">
                <button type="submit" className={buttonStyles.blue}>
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetFilters(inventoryFiltersDefaultValues);
                    fetchTopProducts(1);
                  }}
                  className={buttonStyles.white}
                >
                  Limpiar
                </button>
              </div>
            </form>

            <Table<TopProduct>
              columns={[
                {
                  key: "product",
                  header: "Producto",
                  render: (row) => row.product,
                },
                {
                  key: "brand",
                  header: "Marca",
                  render: (row) => row.brand,
                },
                {
                  key: "category",
                  header: "Categoría",
                  render: (row) => row.category,
                },
                {
                  key: "totalSold",
                  header: "Unidades Vendidas",
                  render: (row) => (
                    <span className="font-semibold text-green-600">{row.totalSold}</span>
                  ),
                },
                {
                  key: "revenue",
                  header: "Ingresos",
                  render: (row) => (
                    <span className="font-semibold text-blue-600">${row.revenue}</span>
                  ),
                },
              ]}
              data={state.topProducts.data}
              load={state.topProducts.load}
              pagination={state.topProducts.pagination}
              onPageChange={(page) => fetchTopProducts(page)}
              loadingNode={<TableLoadingNode message="Cargando productos..." />}
              emptyNode={
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">No hay datos de ventas</p>
                    <p className="text-sm text-gray-500 mt-1">Aún no hay productos vendidos</p>
                  </div>
                  <Link
                    to="/pos"
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear tu primera venta
                  </Link>
                </div>
              }
              errorNode={<TableErrorNode title="Error al cargar productos" description="No se pudieron cargar los datos" buttonText="Reintentar" onRetry={() => fetchTopProducts(state.topProducts.pagination.page)} />}
            />
          </div>
        </div>
      </div>

      <Modal
        open={state.modals.settings}
        onClose={() => setModalState(setState, "settings", false)}
      >
        <div className={`mx-auto max-w-[480px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">⚙️ Configuración de Auto-actualización</h2>
            <p className="text-sm text-gray-500">
              Configura cada cuánto tiempo se actualizarán automáticamente las estadísticas del dashboard
            </p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-blue-800">¿Cómo funciona?</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Selecciona un intervalo para actualizar automáticamente los datos</li>
                  <li>Los datos se recargarán en segundo plano sin interrumpir tu trabajo</li>
                  <li>Selecciona "Desactivado" si prefieres actualizar manualmente</li>
                  <li>Esta configuración solo aplica mientras esta página esté abierta</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: "Desactivado", value: 0 },
              { label: "Cada 5 segundos", value: 5000 },
              { label: "Cada 30 segundos", value: 30000 },
              { label: "Cada 1 minuto", value: 60000 },
              { label: "Cada 5 minutos", value: 300000 },
              { label: "Cada 10 minutos", value: 600000 },
            ].map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  updateSettings({ refreshInterval: option.value });
                  setModalState(setState, "settings", false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${settings.refreshInterval === option.value
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option.label}</span>
                  {settings.refreshInterval === option.value && (
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, "settings", false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}