import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Breadcrumb from "../../../molecules/breadcrumb";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
import Table from "../../../organisms/table";
import BatchUpsertModal from "../../../organisms/batch-upsert-modal";
import type { BatchUpsertInput } from "../../../organisms/batch-upsert-modal";
import type { LoadState } from "../../../atoms/modal";
import {
  buttonStyles,
  containerStyle,
  flexJustifyEndGap3,
  flexWrapGap3,
  formTextStyles,
  inputStyles,
  modalStyle,
  spinnerStyle,
  buttonBlueLabel,
} from "../../../../core/helpers/styles";
import { loadingButton, setModalState } from "../../../../core/helpers/shared";
import { Skeleton } from "../../../atoms/skeleton";
import { icons } from "../../../../core/helpers/icons";

interface BatchRow {
  id: string;
  lotCode: string;
  expiresAt: string;
  stock: number;
  createdAt?: string;
  responsible?: string;
}

interface BatchDetail {
  id: string;
  lotCode: string;
  expiresAt: string;
  stock: number;
  createdAt: string;
  responsible: string;
  productName: string;
  movements?: Array<{
    type: string;
    quantity: number;
    reason: string;
    date: string;
  }>;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
}

interface BatchesState {
  modal: LoadState;
  loadAPI: LoadState;
  loadProduct: LoadState;

  modals: {
    upsert: boolean;
    delete: boolean;
    detail: boolean;
  };

  selected: BatchRow | null;
  selectedDetail: BatchDetail | null;

  product: Product | null;

  batches: {
    load: LoadState;
    data: BatchRow[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

const batchFiltersSchema = z.object({
  lotCode: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

type BatchFiltersInput = z.infer<typeof batchFiltersSchema>;

const batchFiltersDefaultValues: BatchFiltersInput = {
  lotCode: "",
  dateFrom: "",
  dateTo: "",
};

export default function Lots() {
  const { productId } = useParams<{ productId: string }>();

  const [state, setState] = useState<BatchesState>({
    modal: "idle",
    loadAPI: "idle",
    loadProduct: "loading",

    modals: {
      upsert: false,
      delete: false,
      detail: false,
    },

    selected: null,
    selectedDetail: null,
    product: null,

    batches: {
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
  } = useForm<BatchFiltersInput>({
    resolver: zodResolver(batchFiltersSchema),
    defaultValues: batchFiltersDefaultValues,
  });

  const loadProduct = () => {
    if (!productId) return;

    setState(prev => ({ ...prev, loadProduct: "loading" }));

    api.get(`/products/${productId}`)
      .then(res => {
        setState(prev => ({
          ...prev,
          product: {
            id: res.data.id,
            name: res.data.name,
            sku: res.data.sku,
            brand: res.data.brandName || res.data.brand || "",
            category: res.data.categoryName || res.data.category || "",
          },
          loadProduct: "ok",
        }));
      })
      .catch(() => {
        setState(prev => ({ ...prev, loadProduct: "error" }));
      });
  };

  const onSearch = (page: number) => {
    if (!productId) return;

    const filters = getFilterValues();

    setState(prev => ({
      ...prev,
      batches: {
        ...prev.batches,
        load: "loading",
        pagination: {
          ...prev.batches.pagination,
          page,
        },
      },
    }));

    api.post("/batches", {
      productId,
      ...filters,
      page,
      perPage: state.batches.pagination.perPage,
    })
      .then(res => {
        const result = res.data;
        setState(prev => ({
          ...prev,
          batches: {
            load: "ok",
            data: result.data,
            pagination: result.pagination,
          },
        }));
      })
      .catch(() => {
        setState(prev => ({
          ...prev,
          batches: {
            ...prev.batches,
            load: "error",
          },
        }));
      });
  };

  const loadBatchDetail = (batchId: string) => {
    setState(prev => ({ ...prev, modal: "loading" }));
    setModalState(setState, "detail", true, "loading");

    api.get(`/batches/${batchId}`)
      .then(res => {
        setState(prev => ({
          ...prev,
          selectedDetail: res.data,
        }));
        setModalState(setState, "detail", true, "ok");
      })
      .catch(() => {
        setModalState(setState, "detail", true, "error");
      });
  };

  useEffect(() => {
    if (productId) {
      document.title = "Gestión Uno - Lotes";
      loadProduct();
      onSearch(1);
    }
  }, [productId]);

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Productos", to: "/products" },
            { label: state.product?.name || "Lotes" },
          ]}
        />

        {state.loadProduct === "loading" ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        ) : state.loadProduct === "error" ? (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-red-600">Error al cargar producto</h1>
            <p className="text-gray-600">No se pudo cargar la información del producto</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Lotes - {state.product?.name}</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span><strong>SKU:</strong> {state.product?.sku}</span>
              <span><strong>Marca:</strong> {state.product?.brand}</span>
              {state.product?.category && <span><strong>Categoría:</strong> {state.product.category}</span>}
            </div>
          </div>
        )}

        <div className={flexWrapGap3}>
          <button
            onClick={() => {
              setModalState(setState, "upsert", true);
            }}
            className={buttonStyles.green}
          >
            Agregar lote
          </button>
          <Link to="/products" className={buttonStyles.white}>
            Volver a productos
          </Link>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className={`${flexWrapGap3} items-end`}>
          <Input
            label="Código de lote"
            placeholder="Buscar por código"
            containerClassName="w-full md:w-64"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("lotCode")}
          />

          <Input
            label="Fecha desde"
            type="date"
            containerClassName="w-full md:w-48"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("dateFrom")}
          />

          <Input
            label="Fecha hasta"
            type="date"
            containerClassName="w-full md:w-48"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("dateTo")}
          />

          <button type="submit" className={buttonStyles.blue}>
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              resetFilters(batchFiltersDefaultValues);
              onSearch(1);
            }}
            className={buttonStyles.white}
          >
            Limpiar
          </button>
        </form>

        <Table
          heightClass="h-96"
          data={state.batches.data}
          load={state.batches.load}
          columns={batchesColumns(setState, loadBatchDetail)}
          pagination={state.batches.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<LoadingNode />}
          emptyNode={<EmptyNode onCreateNew={() => setModalState(setState, "upsert", true)} />}
          errorNode={<ErrorNode onRetry={() => onSearch(state.batches.pagination.page)} />}
        />
      </div>

      <BatchUpsertModal
        open={state.modals.upsert}
        loadState={state.modal}
        loadAPI={state.loadAPI}
        productId={productId}
        onClose={() => {
          setModalState(setState, "upsert", false);
          setState(prev => ({ ...prev, selected: null }));
        }}
        onSubmit={(data: BatchUpsertInput) => {
          setState(prev => ({ ...prev, loadAPI: "loading" }));

          api.post("/batches-upsert", {
            ...data,
            ...(state.selected?.id ? { id: state.selected.id } : {}),
          })
            .then(() => {
              onSearch(state.batches.pagination.page);
              setState(prev => ({ ...prev, loadAPI: "idle", selected: null }));
              setModalState(setState, "upsert", false);
            })
            .catch(() => {
              setState(prev => ({ ...prev, loadAPI: "error" }));
            });
        }}
      />

      <Modal
        open={state.modals.detail}
        load={state.modal}
        onClose={() => {
          setModalState(setState, "detail", false);
          setState(prev => ({ ...prev, selectedDetail: null }));
        }}
        onRetry={() => {
          if (state.selectedDetail?.id) {
            loadBatchDetail(state.selectedDetail.id);
          }
        }}
      >
        <div className={`mx-auto max-w-[600px] ${modalStyle}`}>
          <div>
            <h2 className="text-xl font-semibold">Detalle del Lote</h2>
            <p className="text-sm text-gray-500">
              Información completa del lote seleccionado.
            </p>
          </div>

          {state.selectedDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500">Código de lote</p>
                  <p className="text-sm font-semibold text-gray-900">{state.selectedDetail.lotCode}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Stock actual</p>
                  <p className="text-sm font-semibold text-gray-900">{state.selectedDetail.stock}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Fecha de vencimiento</p>
                  <p className="text-sm text-gray-700">
                    {state.selectedDetail.expiresAt || "Sin vencimiento"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Fecha de creación</p>
                  <p className="text-sm text-gray-700">{state.selectedDetail.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Responsable</p>
                  <p className="text-sm text-gray-700">{state.selectedDetail.responsible || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Producto</p>
                  <p className="text-sm text-gray-700">{state.selectedDetail.productName}</p>
                </div>
              </div>

              {state.selectedDetail.movements && state.selectedDetail.movements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Historial de movimientos</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {state.selectedDetail.movements.map((mov, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {mov.type === "increment" ? "Incremento" : "Decremento"}: {mov.quantity}
                            </p>
                            <p className="text-xs text-gray-600">{mov.reason}</p>
                          </div>
                          <p className="text-xs text-gray-500">{mov.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.blue}
              onClick={() => setModalState(setState, "detail", false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        load={state.modal}
        open={state.modals.delete}
        onClose={() => setModalState(setState, "delete", false)}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar Lote</h2>
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar este lote? Esta acción no se puede deshacer.
            </p>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, "delete", false)}
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={state.loadAPI === "loading"}
              className={`${buttonStyles.red} flex items-center justify-center gap-2 ${state.loadAPI === "loading" ? "opacity-80 cursor-not-allowed" : ""
                }`}
              onClick={() => {
                if (!state.selected) return;

                setState(prev => ({ ...prev, loadAPI: "loading" }));

                api.delete(`/batches/${state.selected.id}`)
                  .then(() => {
                    onSearch(state.batches.pagination.page);
                    setModalState(setState, "delete", false);
                    setState(prev => ({ ...prev, selected: null, loadAPI: "idle" }));
                  })
                  .catch(() => {
                    setState(prev => ({ ...prev, loadAPI: "error" }));
                  });
              }}
            >
              {state.loadAPI === "loading"
                ? loadingButton("Eliminando…", spinnerStyle, buttonBlueLabel)
                : "Eliminar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

const batchesColumns = (
  setState: React.Dispatch<React.SetStateAction<BatchesState>>,
  loadDetail: (batchId: string) => void
) => [
    {
      key: "lotCode",
      header: "Código de lote",
      render: (row: BatchRow) => (
        <button
          type="button"
          onClick={() => loadDetail(row.id)}
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          {row.lotCode}
        </button>
      )
    },
    {
      key: "expiresAt",
      header: "Fecha de vencimiento",
      render: (row: BatchRow) => (
        <span className="text-sm text-gray-600">
          {row.expiresAt ? row.expiresAt : "Sin vencimiento"}
        </span>
      )
    },
    {
      key: "stock",
      header: "Stock",
      render: (row: BatchRow) => (
        <span className="text-sm text-gray-600">{row.stock}</span>
      )
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      render: (row: BatchRow) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title="Editar lote"
            onClick={() => {
              setState(prev => ({ ...prev, selected: row }));
              setModalState(setState, "upsert", true);
            }}
            className={buttonStyles.base}
          >
            {icons.edit}
          </button>

          <button
            type="button"
            title="Eliminar lote"
            onClick={() => {
              setState(prev => ({ ...prev, selected: row }));
              setModalState(setState, "delete", true);
            }}
            className={buttonStyles.base}
          >
            {icons.delete}
          </button>
        </div>
      )
    }
  ];

function LoadingNode() {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">Cargando lotes...</p>
      </div>
    </div>
  );
}

function EmptyNode({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">No hay lotes registrados</p>
        <p className="text-sm text-gray-500 mt-1">Crea tu primer lote para comenzar</p>
      </div>
      <button
        onClick={onCreateNew}
        className={buttonStyles.blue}
      >
        Agregar lote
      </button>
    </div>
  );
}

function ErrorNode({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-s text-gray-900">Error al cargar lotes</p>
        <p className="text-sm text-gray-500 mt-1">No se pudieron cargar los datos</p>
      </div>
      <button
        onClick={onRetry}
        className={buttonStyles.blue}
      >
        Reintentar
      </button>
    </div>
  );
}
