import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
import Select from "../../../atoms/select";
import Tabs, { type TabItem } from "../../../molecules/tabs";
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
import { customerUpsertSchema, type CustomerUpsert, customerUpsertDefaultValues } from "../../../../core/validations/customers";
import { 
  segmentUpsertSchema, 
  type SegmentUpsert, 
  type Segment,
  segmentFieldLabels,
  segmentOperatorLabels,
  type SegmentField,
  type SegmentOperator
} from "../../../../core/validations/segments";

// Types
interface CustomerRow {
  _id: string;
  code: string;
  fullName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: string;
}

interface SegmentRow {
  _id: string;
  code: string;
  name: string;
  description?: string;
  customerCount: number;
  isActive: boolean;
  color: string;
}

const segmentUpsertDefaultValues: SegmentUpsert = {
  name: '',
  description: '',
  conditions: [],
  matchType: 'ALL',
  isActive: true,
  color: '#3b82f6'
};

interface CustomersState {
  modal: LoadState;
  loadAPI: LoadState;

  modals: {
    upsert: boolean;
    delete: boolean;
    segmentUpsert: boolean;
    segmentDelete: boolean;
  };

  selected: CustomerRow | null;
  selectedSegment: SegmentRow | null;

  customers: {
    load: LoadState;
    data: CustomerRow[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };

  segments: {
    load: LoadState;
    data: SegmentRow[];
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

export default function Customers() {
  const [state, setState] = useState<CustomersState>({
    modal: "idle",
    loadAPI: "idle",

    modals: {
      upsert: false,
      delete: false,
      segmentUpsert: false,
      segmentDelete: false,
    },

    selected: null,
    selectedSegment: null,

    customers: {
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

    segments: {
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
  } = useForm<CustomerUpsert>({
    resolver: zodResolver(customerUpsertSchema),
    defaultValues: customerUpsertDefaultValues,
    mode: "onChange",
  });

  const {
    register: segmentRegister,
    handleSubmit: handleSegmentSubmit,
    reset: resetSegment,
    control: segmentControl,
    watch: watchSegment,
    setValue: setSegmentValue,
  } = useForm<SegmentUpsert>({
    resolver: zodResolver(segmentUpsertSchema),
    defaultValues: segmentUpsertDefaultValues,
    mode: "onChange",
  });

  const onSearch = (page: number) => {
    setState(prev => ({
      ...prev,
      customers: {
        ...prev.customers,
        load: "loading",
        pagination: {
          ...prev.customers.pagination,
          page,
        },
      },
    }));

    api.post("/customers/list", {
      page,
      perPage: state.customers.pagination.perPage,
    })
      .then(res => {
        const result = res.data;
        setState(prev => ({
          ...prev,
          customers: {
            load: "ok",
            data: result.data,
            pagination: result.pagination,
          },
        }));
      })
      .catch(() => {
        setState(prev => ({
          ...prev,
          customers: {
            ...prev.customers,
            load: "error",
          },
        }));
      });
  };

  const onSearchSegments = (page: number) => {
    setState(prev => ({
      ...prev,
      segments: {
        ...prev.segments,
        load: "loading",
        pagination: {
          ...prev.segments.pagination,
          page,
        },
      },
    }));

    api.post("/segments/list", {
      page,
      perPage: state.segments.pagination.perPage,
    })
      .then(res => {
        const result = res.data;
        setState(prev => ({
          ...prev,
          segments: {
            load: "ok",
            data: result.data,
            pagination: result.pagination,
          },
        }));
      })
      .catch(() => {
        setState(prev => ({
          ...prev,
          segments: {
            ...prev.segments,
            load: "error",
          },
        }));
      });
  };

  useEffect(() => {
    onSearch(1);
    onSearchSegments(1);
  }, []);

  // Loading/Empty/Error Nodes
  function LoadingNode() {
    return (
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600 font-medium">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  function EmptyNode({ onCreateNew }: { onCreateNew: () => void }) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-medium text-gray-900">No hay clientes creados</p>
          <p className="text-sm text-gray-500 mt-1">Crea tu primer cliente para comenzar</p>
        </div>
        <button
          onClick={onCreateNew}
          className={buttonStyles.blue}
        >
          Crear nuevo cliente
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
          <p className="font-medium text-s text-gray-900">Error al cargar clientes</p>
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
      render: (row: CustomerRow) => (
        <span className="text-sm text-gray-600">{row.code}</span>
      )
    },
    {
      key: "fullName",
      header: "Nombre",
      render: (row: CustomerRow) => (
        <span className="text-sm font-medium text-gray-900">{row.fullName}</span>
      )
    },
    {
      key: "email",
      header: "Email",
      render: (row: CustomerRow) => (
        <span className="text-sm text-gray-600">{row.email}</span>
      )
    },
    {
      key: "phone",
      header: "Teléfono",
      render: (row: CustomerRow) => (
        <span className="text-sm text-gray-600">{row.phone}</span>
      )
    },
    {
      key: "totalOrders",
      header: "Órdenes",
      render: (row: CustomerRow) => (
        <span className="text-sm text-gray-600">{row.totalOrders}</span>
      )
    },
    {
      key: "totalSpent",
      header: "Total Gastado",
      render: (row: CustomerRow) => (
        <span className="text-sm text-gray-600">{row.totalSpent}</span>
      )
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      render: (row: CustomerRow) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title="Editar cliente"
            onClick={() => {
              setState(prev => ({ ...prev, selected: row }));
              setModalState(setState, "upsert", true, "loading");
              api.get(`/customers/${row._id}`)
                .then(res => {
                  const customer = res.data;
                  resetUpsert({
                    id: customer._id,
                    firstName: customer.firstName || "",
                    lastName: customer.lastName || "",
                    email: customer.email || "",
                    phone: customer.phone || "",
                    address: customer.address || { street: "", city: "", state: "", zipCode: "", country: "" }
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
            title="Eliminar cliente"
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

  const segmentColumns = [
    {
      key: "code",
      header: "Código",
      render: (row: SegmentRow) => (
        <span className="text-sm text-gray-600">{row.code}</span>
      )
    },
    {
      key: "name",
      header: "Nombre",
      render: (row: SegmentRow) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: row.color }}
          />
          <span className="text-sm font-medium text-gray-900">{row.name}</span>
        </div>
      )
    },
    {
      key: "description",
      header: "Descripción",
      render: (row: SegmentRow) => (
        <span className="text-sm text-gray-600">{row.description || "-"}</span>
      )
    },
    {
      key: "customerCount",
      header: "Clientes",
      render: (row: SegmentRow) => (
        <span className="text-sm text-gray-600">{row.customerCount}</span>
      )
    },
    {
      key: "isActive",
      header: "Estado",
      render: (row: SegmentRow) => (
        <span className={`px-2 py-1 rounded text-xs ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.isActive ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      render: (row: SegmentRow) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title="Editar segmento"
            onClick={() => {
              setState(prev => ({ ...prev, selectedSegment: row }));
              setModalState(setState, "segmentUpsert", true, "loading");
              api.get(`/segments/${row._id}`)
                .then(res => {
                  const segment = res.data;
                  resetSegment({
                    _id: segment._id,
                    name: segment.name || "",
                    description: segment.description || "",
                    conditions: segment.conditions || [],
                    matchType: segment.matchType || "ALL",
                    isActive: segment.isActive || true,
                    color: segment.color || "#3b82f6"
                  });
                  setModalState(setState, "segmentUpsert", true, "ok");
                })
                .catch(() => {
                  setModalState(setState, "segmentUpsert", true, "error");
                });
            }}
            className={buttonStyles.base}
          >
            {icons.edit}
          </button>

          <button
            type="button"
            title="Eliminar segmento"
            onClick={() => {
              setState(prev => ({ ...prev, selectedSegment: row }));
              setModalState(setState, "segmentDelete", true);
            }}
            className={buttonStyles.base}
          >
            {icons.delete}
          </button>
        </div>
      )
    }
  ];

  // Tabs content
  const customersTab = (
    <div className="space-y-4">
      <div className={flexWrapGap3}>
        <button
          onClick={() => {
            resetUpsert(customerUpsertDefaultValues);
            setState(prev => ({ ...prev, selected: null }));
            setModalState(setState, "upsert", true, "ok");
          }}
          className={buttonStyles.green}
        >
          Crear nuevo cliente
        </button>
      </div>

      <Table
        heightClass="h-96"
        data={state.customers.data}
        load={state.customers.load}
        columns={columns}
        pagination={state.customers.pagination}
        onPageChange={(page) => onSearch(page)}
        loadingNode={<LoadingNode />}
        emptyNode={<EmptyNode onCreateNew={() => {
          resetUpsert(customerUpsertDefaultValues);
          setState(prev => ({ ...prev, selected: null }));
          setModalState(setState, "upsert", true, "ok");
        }} />}
        errorNode={<ErrorNode onRetry={() => onSearch(state.customers.pagination.page)} />}
      />
    </div>
  );

  const segmentsTab = (
    <div className="space-y-4">
      <div className={flexWrapGap3}>
        <button
          onClick={() => {
            resetSegment(segmentUpsertDefaultValues);
            setState(prev => ({ ...prev, selectedSegment: null }));
            setModalState(setState, "segmentUpsert", true, "ok");
          }}
          className={buttonStyles.green}
        >
          Crear nuevo segmento
        </button>
      </div>

      <Table
        heightClass="h-96"
        data={state.segments.data}
        load={state.segments.load}
        columns={segmentColumns}
        pagination={state.segments.pagination}
        onPageChange={(page) => onSearchSegments(page)}
        loadingNode={<LoadingNode />}
        emptyNode={<EmptyNode onCreateNew={() => {
          resetSegment(segmentUpsertDefaultValues);
          setState(prev => ({ ...prev, selectedSegment: null }));
          setModalState(setState, "segmentUpsert", true, "ok");
        }} />}
        errorNode={<ErrorNode onRetry={() => onSearchSegments(state.segments.pagination.page)} />}
      />
    </div>
  );

  const tabItems: TabItem[] = [
    {
      id: 'customers',
      label: 'Clientes',
      content: customersTab
    },
    {
      id: 'segments',
      label: 'Segmentación',
      content: segmentsTab
    }
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl py-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestión de Clientes</h1>
          <p className="text-gray-600">
            Administra tu base de clientes y segmentación.
          </p>
        </div>

        <Tabs items={tabItems} orientation="horizontal" />
      </div>

      <Modal
        open={state.modals.upsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selected?._id;
          if (!id) return;

          setModalState(setState, "upsert", true, "loading");

          api.get(`/customers/${id}`)
            .then(res => {
              const customer = res.data;
              resetUpsert({
                id: customer._id,
                firstName: customer.firstName || "",
                lastName: customer.lastName || "",
                email: customer.email || "",
                phone: customer.phone || "",
                address: customer.address || { street: "", city: "", state: "", zipCode: "", country: "" }
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

            api.post("/customers/customers-upsert", {
              ...data,
              ...(state.selected?._id ? { id: state.selected._id } : {}),
            })
              .then(() => {
                onSearch(state.customers.pagination.page);
                resetUpsert(customerUpsertDefaultValues);
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
              {state.selected ? "Editar Cliente" : "Crear Cliente"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selected
                ? "Modifica los datos del cliente."
                : "Agrega un nuevo cliente."}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input
              label="Nombre *"
              placeholder="Nombre del cliente"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...upsertRegister("firstName")}
            />

            <Input
              label="Apellido *"
              placeholder="Apellido del cliente"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...upsertRegister("lastName")}
            />

            <Input
              label="Email *"
              type="email"
              placeholder="email@ejemplo.com"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...upsertRegister("email")}
            />

            <Input
              label="Teléfono"
              placeholder="Teléfono"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...upsertRegister("phone")}
            />

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Dirección</p>

              <Input
                label="Calle"
                placeholder="Calle"
                containerClassName={flexColGap2}
                labelClassName={formTextStyles.label}
                inputClassName={inputStyles.base}
                {...upsertRegister("address.street")}
              />

              <Input
                label="Ciudad"
                placeholder="Ciudad"
                containerClassName={flexColGap2}
                labelClassName={formTextStyles.label}
                inputClassName={inputStyles.base}
                {...upsertRegister("address.city")}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Estado"
                  placeholder="Estado"
                  containerClassName={flexColGap2}
                  labelClassName={formTextStyles.label}
                  inputClassName={inputStyles.base}
                  {...upsertRegister("address.state")}
                />

                <Input
                  label="Código Postal"
                  placeholder="Código Postal"
                  containerClassName={flexColGap2}
                  labelClassName={formTextStyles.label}
                  inputClassName={inputStyles.base}
                  {...upsertRegister("address.zipCode")}
                />
              </div>

              <Input
                label="País"
                placeholder="País"
                containerClassName={flexColGap2}
                labelClassName={formTextStyles.label}
                inputClassName={inputStyles.base}
                {...upsertRegister("address.country")}
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
              ¿Estás seguro que deseas eliminar el cliente{" "}
              <span className="font-semibold">{state.selected?.fullName}</span>?
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

                api.delete(`/customers/${state.selected._id}`)
                  .then(() => {
                    onSearch(state.customers.pagination.page);
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

      <Modal
        open={state.modals.segmentUpsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selectedSegment?._id;
          if (!id) return;

          setModalState(setState, "segmentUpsert", true, "loading");

          api.get(`/segments/${id}`)
            .then(res => {
              const segment = res.data;
              resetSegment({
                _id: segment._id,
                name: segment.name || "",
                description: segment.description || "",
                conditions: segment.conditions || [],
                matchType: segment.matchType || "ALL",
                isActive: segment.isActive || true,
                color: segment.color || "#3b82f6"
              });
              setModalState(setState, "segmentUpsert", true, "ok");
            })
            .catch(() => {
              setModalState(setState, "segmentUpsert", true, "error");
            });
        }}
        onClose={() => {
          setModalState(setState, "segmentUpsert", false);
          setState(prev => ({ ...prev, selectedSegment: null }));
        }}
      >
        <form
          onSubmit={handleSegmentSubmit(async data => {
            setState(prev => ({ ...prev, loadAPI: "loading" }));

            api.post("/segments/segments-upsert", {
              ...data,
              ...(state.selectedSegment?._id ? { _id: state.selectedSegment._id } : {}),
            })
              .then(() => {
                onSearchSegments(state.segments.pagination.page);
                resetSegment(segmentUpsertDefaultValues);
                setState(prev => ({ ...prev, loadAPI: "idle", selectedSegment: null }));
                setModalState(setState, "segmentUpsert", false);
              })
              .catch(() => {
                setState(prev => ({ ...prev, loadAPI: "error" }));
              });
          })}
          className={`mx-auto max-w-[720px] ${modalStyle}`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selectedSegment ? "Editar Segmento" : "Crear Segmento"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selectedSegment
                ? "Modifica los datos del segmento."
                : "Agrega un nuevo segmento de clientes."}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input
              label="Nombre *"
              placeholder="Nombre del segmento"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...segmentRegister("name")}
            />

            <Input
              label="Descripción"
              placeholder="Descripción del segmento"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...segmentRegister("description")}
            />

            <Input
              label="Color"
              type="color"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...segmentRegister("color")}
            />

            <Controller
              name="matchType"
              control={segmentControl}
              render={({ field }) => (
                <Select
                  label="Tipo de coincidencia"
                  options={[
                    { label: 'Todas las condiciones (AND)', value: 'ALL' },
                    { label: 'Cualquier condición (OR)', value: 'ANY' }
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
                id="isActive"
                {...segmentRegister("isActive")}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Segmento activo
              </label>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Condiciones</p>
              <p className="text-xs text-gray-500 mb-3">
                Las condiciones definen qué clientes pertenecen a este segmento. Puedes agregar múltiples condiciones.
              </p>
              <p className="text-xs text-gray-400 italic">
                Funcionalidad de condiciones en desarrollo...
              </p>
            </div>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => setModalState(setState, "segmentUpsert", false)}
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
        open={state.modals.segmentDelete}
        load={state.loadAPI}
        onClose={() => {
          setModalState(setState, "segmentDelete", false);
          setState(prev => ({ ...prev, selectedSegment: null }));
        }}
      >
        <div className={`mx-auto max-w-[480px] ${modalStyle}`}>
          <div>
            <p className="text-sm text-gray-700">
              ¿Estás seguro que deseas eliminar el segmento{" "}
              <span className="font-semibold">{state.selectedSegment?.name}</span>?
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => setModalState(setState, "segmentDelete", false)}
              className={buttonStyles.white}
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={state.loadAPI === "loading"}
              onClick={() => {
                if (!state.selectedSegment?._id) return;

                setState(prev => ({ ...prev, loadAPI: "loading" }));

                api.delete(`/segments/${state.selectedSegment._id}`)
                  .then(() => {
                    onSearchSegments(state.segments.pagination.page);
                    setState(prev => ({ ...prev, loadAPI: "idle", selectedSegment: null }));
                    setModalState(setState, "segmentDelete", false);
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
