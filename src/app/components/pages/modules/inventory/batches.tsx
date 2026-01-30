import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
import Select from "../../../atoms/select";
import Badge from "../../../atoms/badge";
import { Skeleton } from "../../../atoms/skeleton";
import LoadingButton from "../../../atoms/loading-button";
import Table from "../../../organisms/table";
import BatchUpsertModal from "../../../organisms/batch-upsert-modal";
import Breadcrumb from "../../../molecules/breadcrumb";
import {
  buttonStyles,
  flexWrapGap3,
  flexJustifyEndGap3,
  modalStyle,
  containerStyle,
} from "../../../../core/helpers/styles";
import { setModalState, setApiState, setButtonState, setSelectionState, notifySuccess, notifyError, TableLoadingNode, TableEmptyNode, TableErrorNode } from "../../../../core/helpers/shared";
import { icons } from "../../../../core/helpers/icons";
import type { BatchRow, BatchesState } from "../../../../core/types/batches";
import {
  batchFiltersSchema,
  batchFiltersDefaultValues,
  type BatchFiltersInput,
  type BatchUpsertInput,
} from "../../../../core/validations/batches";

export default function Batches() {
  const { productId } = useParams<{ productId: string }>();

  const [state, setState] = useState<BatchesState>({
    modal: "idle",

    apis: {
      detail: "idle",
      upsert: "idle",
      delete: "idle",
      productDetail: "idle",
    },

    modals: {
      upsert: false,
      delete: false,
    },

    buttons: {
      upsert: false,
      delete: false,
    },

    selections: {
      batch: null,
      batchDelete: null,
      action: "increment",
    },

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

    productInfo: {
      id: productId || "",
      name: "",
      sku: "",
      stock: {
        current: 0,
        minimum: 0,
      },
      status: {
        label: "",
        color: "",
      },
    },
  });

  const {
    register: filterRegister,
    control: filterControl,
    getValues: getFilterValues,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
  } = useForm<BatchFiltersInput>({
    resolver: zodResolver(batchFiltersSchema),
    defaultValues: batchFiltersDefaultValues,
  });

  const onSearch = (page: number) => {
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
      ...getFilterValues(),
      product: productId,
      page,
      perPage: state.batches.pagination.perPage,
    })
      .then(res => {
        setState(prev => ({
          ...prev,
          batches: {
            load: "ok",
            data: res.data.data,
            pagination: res.data.pagination,
          },
        }));
      })
      .catch((err) => {
        setState(prev => ({
          ...prev,
          batches: {
            ...prev.batches,
            load: "error",
          },
        }));
        notifyError(err);
      });
  };

  const refreshProductStats = () => {
    if (!productId) return;

    api.get(`/products/${productId}/stats`)
      .then(res => {
        setState(prev => ({
          ...prev,
          productInfo: {
            ...prev.productInfo,
            stock: res.data.data.stock,
            status: res.data.data.stock.status,
          },
        }));
      })
      .catch((err) => {
        notifyError(err);
      });
  };

  useEffect(() => {
    if (!productId) return;

    setApiState(setState, "productDetail", "loading");

    api.get(`/products/${productId}`)
      .then(res => {
        const product = res.data.data;
        setState(prev => ({
          ...prev,
          productInfo: {
            id: product.id,
            name: product.name,
            sku: product.sku,
            stock: product.stock,
            status: product.stock.status,
          },
        }));
        setApiState(setState, "productDetail", "ok");
        document.title = `Gestión Uno - Lotes de ${product.name}`;
      })
      .catch((err) => {
        setApiState(setState, "productDetail", "error");
        notifyError(err);
      });

    onSearch(1);
  }, [productId]);

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Inventario", to: "/inventory" },
            { label: "Productos", to: "/products" },
            { label: state.productInfo.name || "Cargando...", to: `/products/${productId}/batches` },
          ]}
        />

        <div className="space-y-4">
          {state.apis.productDetail === "loading" ? (
            <div className="bg-white rounded-lg shadow p-6 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold">Lotes de {state.productInfo.name}
                </h1>
                <p className="text-sm text-gray-500">SKU: {state.productInfo.sku}</p>
                <Badge label={state.productInfo.status.label} color={state.productInfo.status.color} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Stock Actual</p>
                  <p className="text-2xl font-bold text-gray-900">{state.productInfo.stock.current}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Stock Mínimo</p>
                  <p className="text-2xl font-bold text-gray-900">{state.productInfo.stock.minimum}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total de Lotes</p>
                  <p className="text-2xl font-bold text-gray-900">{state.batches.pagination.totalItems}</p>
                </div>
              </div>

              <div className={flexWrapGap3}>
                <button
                  onClick={() => {
                    setSelectionState(setState, "batch", null);
                    setSelectionState(setState, "action", "increment");
                    setModalState(setState, "upsert", true);
                  }}
                  disabled={state.buttons.upsert}
                  className={`${buttonStyles.green} ${state.buttons.upsert ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Crear nuevo lote
                </button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Código de lote"
              placeholder="Buscar por código"
              {...filterRegister("code")}
            />

            <Controller
              name="status"
              control={filterControl}
              render={({ field }) => (
                <Select
                  label="Estado"
                  options={[
                    { label: "Todos", value: "" },
                    { label: "Vigente", value: "valid" },
                    { label: "Por vencer", value: "nearExpiry" },
                    { label: "Vencido", value: "expired" },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
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
                resetFilters(batchFiltersDefaultValues);
                onSearch(1);
              }}
              className={buttonStyles.white}
            >
              Limpiar
            </button>
          </div>
        </form>

        <Table
          heightClass="h-96"
          data={state.batches.data}
          load={state.batches.load}
          columns={batchesColumns(setState)}
          pagination={state.batches.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<TableLoadingNode message="Cargando lotes..." />}
          emptyNode={
            <TableEmptyNode
              title="No hay lotes creados"
              description="Crea tu primer lote para comenzar"
              buttonText="Crear nuevo lote"
              onAction={() => {
                setSelectionState(setState, "batch", null);
                setSelectionState(setState, "action", "increment");
                setModalState(setState, "upsert", true);
              }}
            />
          }
          errorNode={
            <TableErrorNode
              title="Error al cargar lotes"
              description="No se pudieron cargar los datos"
              buttonText="Reintentar"
              onRetry={() => onSearch(state.batches.pagination.page)}
            />
          }
        />
      </div>

      <BatchUpsertModal
        open={state.modals.upsert}
        loadState={state.modal}
        loadAPI={state.apis.upsert}
        productId={productId || ""}
        batchId={state.selections.batch?.id}
        initialAction={state.selections.action}
        onClose={() => {
          refreshProductStats();
          setModalState(setState, "upsert", false);
          setSelectionState(setState, "batch", null);
          setSelectionState(setState, "action", "increment");
        }}
        onSubmit={(data: BatchUpsertInput) => {
          setApiState(setState, "upsert", "loading");

          api.post("/batch-upsert", data)
            .then((res) => {
              notifySuccess(res.data);
              onSearch(state.batches.pagination.page);
              refreshProductStats();
              setApiState(setState, "upsert", "idle");
              setSelectionState(setState, "batch", null);
              setSelectionState(setState, "action", "increment");
              setModalState(setState, "upsert", false);
            })
            .catch((err) => {
              setApiState(setState, "upsert", "error");
              notifyError(err);
            });
        }}
        onRetry={() => {
          setModalState(setState, "upsert", true, "ok");
        }}
      />

      <Modal
        load={state.modal}
        open={state.modals.delete}
        onClose={() => setModalState(setState, "delete", false)}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar Lote</h2>
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar el lote <strong>{state.selections.batchDelete?.code}</strong>?
              <br />
              Esta acción no se puede deshacer.
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

            <LoadingButton
              type="button"
              isLoading={state.buttons.delete}
              loadingText="Eliminando…"
              normalText="Eliminar"
              className={buttonStyles.red}
              onClick={() => {
                if (!state.selections.batchDelete?.id) return;

                setApiState(setState, "delete", "loading");
                setButtonState(setState, "delete", true);

                api.delete(`/batches/${state.selections.batchDelete.id}`)
                  .then((res) => {
                    notifySuccess(res.data);
                    onSearch(state.batches.pagination.page);
                    refreshProductStats();
                    setModalState(setState, "delete", false);
                    setApiState(setState, "delete", "ok");
                    setButtonState(setState, "delete", false);
                    setSelectionState(setState, "batchDelete", null);
                  })
                  .catch((err) => {
                    setApiState(setState, "delete", "error");
                    setButtonState(setState, "delete", false);
                    notifyError(err);
                  });
              }}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}

const batchesColumns = (
  setState: React.Dispatch<React.SetStateAction<BatchesState>>
) => [
    {
      key: "code",
      header: "Código",
      render: (row: BatchRow) => (
        <Link
          to={`/movements?batch=${row.code}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
        >
          {row.code}
        </Link>
      )
    },
    {
      key: "expiresAt",
      header: "Vencimiento",
      render: (row: BatchRow) => (
        <span className="text-sm text-gray-600">
          {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : "Sin vencimiento"}
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
      key: "status",
      header: "Estado",
      render: (row: BatchRow) => (
        <Badge label={row.status.label} color={row.status.color} />
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
            title="Incrementar stock"
            onClick={() => {
              setSelectionState(setState, "batch", row);
              setSelectionState(setState, "action", "increment");
              setModalState(setState, "upsert", true);
            }}
            className={`${buttonStyles.base} text-green-600 hover:text-green-700`}
          >
            {icons.plus}
          </button>

          <button
            type="button"
            title="Editar lote"
            onClick={() => {
              setSelectionState(setState, "batch", row);
              setSelectionState(setState, "action", "increment");
              setModalState(setState, "upsert", true, "loading");
              setModalState(setState, "upsert", true, "ok");
            }}
            className={buttonStyles.base}
          >
            {icons.edit}
          </button>

          <button
            type="button"
            title="Eliminar lote"
            onClick={() => {
              setSelectionState(setState, "batchDelete", row);
              setModalState(setState, "delete", true);
            }}
            className={buttonStyles.base}
          >
            {icons.delete}
          </button>
        </div>
      )
    },
  ];
