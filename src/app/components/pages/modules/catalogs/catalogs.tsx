import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
import Select from "../../../atoms/select";
import type { LoadState } from "../../../atoms/modal";
import {
  buttonStyles,
  flexColGap2,
  flexJustifyEndGap3,
  flexWrapGap3,
  inputStyles,
  modalStyle,
  formTextStyles,
} from "../../../../core/helpers/styles";
import { setModalState } from "../../../../core/helpers/shared";
import { icons } from "../../../../core/helpers/icons";
import Table from "../../../organisms/table";
import {
  catalogUpsertSchema,
  type CatalogUpsert,
  type CatalogStatus,
  catalogStatusColors,
  catalogStatusLabels
} from "../../../../core/validations/catalogs";

// Types
interface CatalogRow {
  _id: string;
  code: string;
  name: string;
  status: CatalogStatus;
  products: any[];
  segments: any[];
  isPublic: boolean;
  views: number;
  orders: number;
  validFrom?: string;
  validTo?: string;
}

interface CatalogsState {
  modal: LoadState;
  loadAPI: LoadState;

  modals: {
    upsert: boolean;
    delete: boolean;
  };

  selected: CatalogRow | null;

  catalogs: {
    load: LoadState;
    data: CatalogRow[];
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

const catalogUpsertDefaultValues: CatalogUpsert = {
  name: '',
  description: '',
  status: 'DRAFT',
  products: [],
  segments: [],
  isPublic: false,
  filters: [],
  settings: {
    showPrices: true,
    allowOrders: true,
    showStock: false,
    theme: 'default',
    columns: 3
  }
};

export default function Catalogs() {
  const [state, setState] = useState<CatalogsState>({
    modal: "idle",
    loadAPI: "idle",

    modals: {
      upsert: false,
      delete: false,
    },

    selected: null,

    catalogs: {
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
    register: upsertRegister,
    handleSubmit: handleUpsertSubmit,
    reset: resetUpsert,
    control: upsertControl,
  } = useForm<CatalogUpsert>({
    resolver: zodResolver(catalogUpsertSchema),
    defaultValues: catalogUpsertDefaultValues,
    mode: "onChange",
  });

  const onSearch = (page: number) => {
    setState(prev => ({
      ...prev,
      catalogs: {
        ...prev.catalogs,
        load: "loading",
        pagination: {
          ...prev.catalogs.pagination,
          page,
        },
      },
    }));

    api.post("/catalogs/list", {
      page,
      perPage: state.catalogs.pagination.perPage,
    })
      .then(res => {
        const result = res.data;
        setState(prev => ({
          ...prev,
          catalogs: {
            load: "ok",
            data: result.catalogs,
            pagination: result.pagination,
          },
        }));
      })
      .catch(() => {
        setState(prev => ({
          ...prev,
          catalogs: {
            ...prev.catalogs,
            load: "error",
          },
        }));
      });
  };

  useEffect(() => {
    onSearch(1);
  }, []);

  // Loading/Empty/Error Nodes
  function LoadingNode() {
    return (
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 font-medium">Cargando catálogos...</p>
        </div>
      </div>
    );
  }

  function EmptyNode({ onCreateNew }: { onCreateNew: () => void }) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900">No hay catálogos creados</p>
          <p className="text-sm text-gray-500 mt-1">Crea tu primer catálogo para comenzar</p>
        </div>
        <button
          onClick={onCreateNew}
          className={buttonStyles.blue}
        >
          Crear nuevo catálogo
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
          <p className="font-medium text-s text-gray-900">Error al cargar catálogos</p>
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

  const columns = [
    {
      key: "code",
      header: "Código",
      render: (row: CatalogRow) => (
        <span className="text-sm text-gray-600">{row.code}</span>
      )
    },
    {
      key: "name",
      header: "Nombre",
      render: (row: CatalogRow) => (
        <span className="text-sm font-medium text-gray-900">{row.name}</span>
      )
    },
    {
      key: "status",
      header: "Estado",
      render: (row: CatalogRow) => (
        <span className={`px-2 py-1 rounded text-xs ${catalogStatusColors[row.status]}`}>
          {catalogStatusLabels[row.status]}
        </span>
      )
    },
    {
      key: "products",
      header: "Productos",
      render: (row: CatalogRow) => (
        <span className="text-sm text-gray-600">{row.products?.length || 0}</span>
      )
    },
    {
      key: "isPublic",
      header: "Público",
      render: (row: CatalogRow) => (
        <span className={`px-2 py-1 rounded text-xs ${row.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.isPublic ? 'Sí' : 'No'}
        </span>
      )
    },
    {
      key: "views",
      header: "Vistas",
      render: (row: CatalogRow) => (
        <span className="text-sm text-gray-600">{row.views}</span>
      )
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      render: (row: CatalogRow) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title="Editar catálogo"
            onClick={() => {
              setState(prev => ({ ...prev, selected: row }));
              setModalState(setState, "upsert", true, "loading");
              api.get(`/catalogs/${row._id}`)
                .then(res => {
                  const catalog = res.data;
                  resetUpsert({
                    _id: catalog._id,
                    name: catalog.name || "",
                    description: catalog.description || "",
                    status: catalog.status || "DRAFT",
                    products: catalog.products || [],
                    segments: catalog.segments || [],
                    isPublic: catalog.isPublic || false,
                    validFrom: catalog.validFrom,
                    validTo: catalog.validTo,
                    filters: catalog.filters || [],
                    settings: catalog.settings || {
                      showPrices: true,
                      allowOrders: true,
                      showStock: false,
                      theme: 'default',
                      columns: 3
                    }
                  });
                  setModalState(setState, "upsert", true, "ok");
                })
                .catch(() => {
                  setModalState(setState, "upsert", true, "error");
                });
            }}
            className={buttonStyles.base}
          >
            {icons.edit}
          </button>

          <button
            type="button"
            title="Eliminar catálogo"
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

  return (
    <>
      <div className="mx-auto max-w-7xl py-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestión de Catálogos</h1>
          <p className="text-gray-600">
            Administra tus catálogos de productos y su configuración.
          </p>
        </div>

        <div className={flexWrapGap3}>
          <button
            onClick={() => {
              resetUpsert(catalogUpsertDefaultValues);
              setState(prev => ({ ...prev, selected: null }));
              setModalState(setState, "upsert", true, "ok");
            }}
            className={buttonStyles.green}
          >
            Crear nuevo catálogo
          </button>
        </div>

        <Table
          heightClass="h-96"
          data={state.catalogs.data}
          load={state.catalogs.load}
          columns={columns}
          pagination={state.catalogs.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<LoadingNode />}
          emptyNode={<EmptyNode onCreateNew={() => {
            resetUpsert(catalogUpsertDefaultValues);
            setState(prev => ({ ...prev, selected: null }));
            setModalState(setState, "upsert", true, "ok");
          }} />}
          errorNode={<ErrorNode onRetry={() => onSearch(state.catalogs.pagination.page)} />}
        />
      </div>

      <Modal
        open={state.modals.upsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selected?._id;
          if (!id) return;

          setModalState(setState, "upsert", true, "loading");

          api.get(`/catalogs/${id}`)
            .then(res => {
              const catalog = res.data;
              resetUpsert({
                _id: catalog._id,
                name: catalog.name || "",
                description: catalog.description || "",
                status: catalog.status || "DRAFT",
                products: catalog.products || [],
                segments: catalog.segments || [],
                isPublic: catalog.isPublic || false,
                validFrom: catalog.validFrom,
                validTo: catalog.validTo,
                filters: catalog.filters || [],
                settings: catalog.settings || {
                  showPrices: true,
                  allowOrders: true,
                  showStock: false,
                  theme: 'default',
                  columns: 3
                }
              });
              setModalState(setState, "upsert", true, "ok");
            })
            .catch(() => {
              setModalState(setState, "upsert", true, "error");
            });
        }}
        onClose={() => {
          setModalState(setState, "upsert", false);
          setState(prev => ({ ...prev, selected: null }));
        }}
      >
        <form
          onSubmit={handleUpsertSubmit(async data => {
            setState(prev => ({ ...prev, loadAPI: "loading" }));

            api.post("/catalogs/catalogs-upsert", {
              ...data,
              ...(state.selected?._id ? { _id: state.selected._id } : {}),
            })
              .then(() => {
                onSearch(state.catalogs.pagination.page);
                resetUpsert(catalogUpsertDefaultValues);
                setState(prev => ({ ...prev, loadAPI: "idle", selected: null }));
                setModalState(setState, "upsert", false);
              })
              .catch(() => {
                setState(prev => ({ ...prev, loadAPI: "error" }));
              });
          })}
          className={`mx-auto max-w-[720px] ${modalStyle}`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selected ? "Editar Catálogo" : "Crear Catálogo"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selected
                ? "Modifica los datos del catálogo."
                : "Agrega un nuevo catálogo."}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input
              label="Nombre *"
              placeholder="Nombre del catálogo"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...upsertRegister("name")}
            />

            <Input
              label="Descripción"
              placeholder="Descripción del catálogo"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...upsertRegister("description")}
            />

            <Controller
              name="status"
              control={upsertControl}
              render={({ field }) => (
                <Select
                  label="Estado"
                  options={[
                    { label: 'Borrador', value: 'DRAFT' },
                    { label: 'Activo', value: 'ACTIVE' },
                    { label: 'Inactivo', value: 'INACTIVE' },
                    { label: 'Expirado', value: 'EXPIRED' }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  containerClassName={flexColGap2}
                  labelClassName={formTextStyles.label}
                  inputClassName={inputStyles.base}
                />
              )}
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isPublic"
                {...upsertRegister("isPublic")}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                Catálogo público
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Fecha inicio"
                type="date"
                containerClassName={flexColGap2}
                labelClassName={formTextStyles.label}
                inputClassName={inputStyles.base}
                {...upsertRegister("validFrom")}
              />

              <Input
                label="Fecha fin"
                type="date"
                containerClassName={flexColGap2}
                labelClassName={formTextStyles.label}
                inputClassName={inputStyles.base}
                {...upsertRegister("validTo")}
              />
            </div>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => setModalState(setState, "upsert", false)}
              className={buttonStyles.white}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={state.loadAPI === "loading"}
              className={buttonStyles.blue}
            >
              {state.loadAPI === "loading" ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal

        open={state.modals.delete}
        load={state.loadAPI}
        onClose={() => {
          setModalState(setState, "delete", false);
          setState(prev => ({ ...prev, selected: null }));
        }}
      >
        <div className={`mx-auto max-w-[480px] ${modalStyle}`}>
          <div>
            <p className="text-sm text-gray-700">
              ¿Estás seguro que deseas eliminar el catálogo{" "}
              <span className="font-semibold">{state.selected?.name}</span>?
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => setModalState(setState, "delete", false)}
              className={buttonStyles.white}
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={state.loadAPI === "loading"}
              onClick={() => {
                if (!state.selected?._id) return;

                setState(prev => ({ ...prev, loadAPI: "loading" }));

                api.delete(`/catalogs/${state.selected._id}`)
                  .then(() => {
                    onSearch(state.catalogs.pagination.page);
                    setState(prev => ({ ...prev, loadAPI: "idle", selected: null }));
                    setModalState(setState, "delete", false);
                  })
                  .catch(() => {
                    setState(prev => ({ ...prev, loadAPI: "error" }));
                  });
              }}
              className={buttonStyles.red}
            >
              {state.loadAPI === "loading" ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
