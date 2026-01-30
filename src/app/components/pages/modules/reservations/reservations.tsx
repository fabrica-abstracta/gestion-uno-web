import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
import Select from "../../../atoms/select";
import Tabs from "../../../molecules/tabs";
import type { LoadState } from "../../../atoms/modal";
import {
  buttonStyles,
  flexColGap2,
  flexJustifyEndGap3,
  flexWrapGap3,
  formTextStyles,
  inputStyles,
  modalStyle,
  spinnerStyle,
  buttonBlueLabel,
  linkStyles,
} from "../../../../core/helpers/styles";
import { loadingButton, setModalState } from "../../../../core/helpers/shared";
import { icons } from "../../../../core/helpers/icons";
import Table from "../../../organisms/table";
import {
  reservationFiltersSchema,
  reservationUpsertSchema,
  reservationFiltersDefaultValues,
  reservationUpsertDefaultValues,
  reservationStatuses,
  statusLabels,
  statusColors,
  type ReservationFiltersInput,
  type ReservationUpsertInput,
  type ReservationStatus,
} from "../../../../core/validations/reservations";

// Types
interface ReservationRow {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productSku: string;
  checkInDate: string;
  checkOutDate: string;
  checkInTime: string;
  checkOutTime: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: ReservationStatus;
  statusLabel: string;
  labelPrice: string;
}

interface ReservationsState {
  modal: LoadState;
  loadAPI: LoadState;

  modals: {
    upsert: boolean;
    delete: boolean;
  };

  selected: ReservationRow | null;

  reservations: {
    load: LoadState;
    data: ReservationRow[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };

  catalogs: {
    products: { label: string; value: string }[];
    loadingProducts: boolean;
  };
}

export default function Reservations() {
  const [state, setState] = useState<ReservationsState>({
    modal: "idle",
    loadAPI: "idle",

    modals: {
      upsert: false,
      delete: false,
    },

    selected: null,

    reservations: {
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

    catalogs: {
      products: [],
      loadingProducts: false,
    },
  });

  const {
    register: filterRegister,
    getValues: getFilterValues,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
  } = useForm<ReservationFiltersInput>({
    resolver: zodResolver(reservationFiltersSchema),
    defaultValues: reservationFiltersDefaultValues,
  });

  const {
    register: upsertRegister,
    handleSubmit: handleUpsertSubmit,
    reset: resetUpsert,
    control: upsertControl,
    watch: watchUpsert,
    setValue: setUpsertValue,
    formState: { isValid, isSubmitting, errors },
  } = useForm<ReservationUpsertInput>({
    resolver: zodResolver(reservationUpsertSchema),
    defaultValues: reservationUpsertDefaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: upsertControl,
    name: "products",
  });

  // Watch products to auto-calculate total price
  const watchedProducts = watchUpsert("products");

  useEffect(() => {
    if (watchedProducts && watchedProducts.length > 0) {
      const total = watchedProducts.reduce((sum, item) => {
        const quantity = item.quantity || 0;
        const unitPrice = item.unitPrice || 0;
        return sum + (quantity * unitPrice);
      }, 0);
      setUpsertValue("totalPrice", total);
    }
  }, [watchedProducts, setUpsertValue]);

  // Load products catalog
  const loadProducts = (search = "") => {
    setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingProducts: true } }));

    api.post("/products", { name: search, page: 1, perPage: 100 })
      .then(res => {
        const products = res.data.data.map((p: any) => ({
          label: `${p.name} - ${p.sku} (${p.labelPrice})`,
          value: p.id,
        }));
        setState(prev => ({
          ...prev,
          catalogs: { ...prev.catalogs, products, loadingProducts: false },
        }));
      })
      .catch(() => {
        setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingProducts: false } }));
      });
  };

  const onSearch = (page: number) => {
    const filters = getFilterValues();

    setState(prev => ({
      ...prev,
      reservations: {
        ...prev.reservations,
        load: "loading",
        pagination: {
          ...prev.reservations.pagination,
          page,
        },
      },
    }));

    api.post("/reservations", {
      ...filters,
      page,
      perPage: state.reservations.pagination.perPage,
    })
      .then(res => {
        const result = res.data;
        setState(prev => ({
          ...prev,
          reservations: {
            load: "ok",
            data: result.data,
            pagination: result.pagination,
          },
        }));
      })
      .catch(() => {
        setState(prev => ({
          ...prev,
          reservations: {
            ...prev.reservations,
            load: "error",
          },
        }));
      });
  };

  useEffect(() => {
    document.title = "Gestión Uno - Reservaciones";
    onSearch(1);
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl py-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestión de Reservaciones</h1>
          <p className="text-gray-600">
            Administra las reservas de tus productos, controla check-in y check-out.
          </p>
        </div>

        <div className={flexWrapGap3}>
          <button
            onClick={() => {
              resetUpsert(reservationUpsertDefaultValues);
              loadProducts();
              setModalState(setState, "upsert", true);
            }}
            className={buttonStyles.green}
          >
            Crear nueva reserva
          </button>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className={`${flexWrapGap3} items-end`}>
          <Input
            label="Cliente"
            placeholder="Buscar por nombre del cliente"
            containerClassName="w-full md:w-64"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("customerName")}
          />

          <div className="w-full md:w-48">
            <label className={formTextStyles.label}>Estado</label>
            <select
              {...filterRegister("status")}
              className={inputStyles.base}
            >
              <option value="">Todos</option>
              {reservationStatuses.map(status => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Fecha Check-in desde"
            type="date"
            containerClassName="w-full md:w-48"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("checkInDateFrom")}
          />

          <Input
            label="Fecha Check-in hasta"
            type="date"
            containerClassName="w-full md:w-48"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("checkInDateTo")}
          />

          <button type="submit" className={buttonStyles.blue}>
            Buscar
          </button>
          <button
            type="button"
            onClick={() => {
              resetFilters(reservationFiltersDefaultValues);
              onSearch(1);
            }}
            className={buttonStyles.white}
          >
            Limpiar
          </button>
        </form>

        <Table
          heightClass="h-96"
          data={state.reservations.data}
          load={state.reservations.load}
          columns={reservationsColumns(setState, resetUpsert)}
          pagination={state.reservations.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<LoadingNode />}
          emptyNode={<EmptyNode onCreateNew={() => {
            resetUpsert(reservationUpsertDefaultValues);
            loadProducts();
            setModalState(setState, "upsert", true);
          }} />}
          errorNode={<ErrorNode onRetry={() => onSearch(state.reservations.pagination.page)} />}
        />
      </div>

      <Modal
        open={state.modals.upsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selected?.id;
          if (!id) return;

          loadProducts();
          setModalState(setState, "upsert", true, "loading");

          api.get(`/reservations/${id}`)
            .then(res => {
              const reservation = res.data;
              resetUpsert({
                id: reservation.id,
                product: reservation.product.id,
                customerName: reservation.customerName,
                customerEmail: reservation.customerEmail,
                customerPhone: reservation.customerPhone || "",
                customerDocument: reservation.customerDocument || "",
                checkInDate: reservation.checkInDate.split('T')[0],
                checkOutDate: reservation.checkOutDate.split('T')[0],
                checkInTime: reservation.checkInTime,
                checkOutTime: reservation.checkOutTime,
                quantity: reservation.quantity,
                totalPrice: reservation.totalPrice,
                currency: reservation.currency,
                status: reservation.status,
                notes: reservation.notes || "",
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

            api.post("/reservations-upsert", {
              ...data,
              ...(state.selected?.id ? { id: state.selected.id } : {}),
            })
              .then(() => {
                onSearch(state.reservations.pagination.page);
                resetUpsert(reservationUpsertDefaultValues);
                setState(prev => ({ ...prev, loadAPI: "idle", selected: null }));
                setModalState(setState, "upsert", false);
              })
              .catch(() => {
                setState(prev => ({ ...prev, loadAPI: "error" }));
              });
          })}
          className={`mx-auto max-w-[820px] ${modalStyle}`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selected ? "Editar Reserva" : "Crear Reserva"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selected
                ? "Modifica los datos de la reserva."
                : "Agrega una nueva reserva seleccionando productos."}
            </p>
          </div>

          {state.selected && state.selected.code && (
            <Input
              label="Código"
              placeholder="Auto-generado"
              disabled
              value={state.selected.code}
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={`${inputStyles.base} bg-gray-100 cursor-not-allowed`}
            />
          )}

          <Tabs
            orientation="horizontal"
            items={[
              {
                id: "products",
                label: `${icons.box} Productos (${fields.length})`,
                content: (
                  <div className={flexColGap2}>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Selecciona los productos a reservar</p>
                      <button
                        type="button"
                        onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
                        className={buttonStyles.green}
                      >
                        {icons.plus} Agregar producto
                      </button>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {fields.map((field, index) => (
                        <div key={field.id} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-start gap-3">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <Controller
                                name={`products.${index}.productId`}
                                control={upsertControl}
                                render={({ field }) => (
                                  <Select
                                    label="Producto *"
                                    options={state.catalogs.products}
                                    value={field.value}
                                    onChange={(value) => {
                                      field.onChange(value);
                                      // Auto-fill price
                                      const product = state.catalogs.products.find(p => p.value === value);
                                      if (product) {
                                        const priceMatch = product.label.match(/(\d+\.?\d*)/);
                                        if (priceMatch) {
                                          setUpsertValue(`products.${index}.unitPrice`, parseFloat(priceMatch[0]));
                                        }
                                      }
                                    }}
                                    placeholder={state.catalogs.loadingProducts ? "Cargando..." : "Seleccionar"}
                                    containerClassName={flexColGap2}
                                    labelClassName={formTextStyles.label}
                                    inputClassName={inputStyles.base}
                                  />
                                )}
                              />

                              <Input
                                label="Cantidad *"
                                type="number"
                                min="1"
                                containerClassName={flexColGap2}
                                labelClassName={formTextStyles.label}
                                inputClassName={inputStyles.base}
                                {...upsertRegister(`products.${index}.quantity`, { valueAsNumber: true })}
                              />

                              <Input
                                label="Precio Unitario *"
                                type="number"
                                step="0.01"
                                min="0"
                                containerClassName={flexColGap2}
                                labelClassName={formTextStyles.label}
                                inputClassName={inputStyles.base}
                                {...upsertRegister(`products.${index}.unitPrice`, { valueAsNumber: true })}
                              />
                            </div>

                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="mt-7 text-red-600 hover:text-red-700"
                                title="Eliminar producto"
                              >
                                {icons.trash}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {errors.products && (
                      <p className="text-sm text-red-600">{errors.products.message}</p>
                    )}
                  </div>
                ),
              },
              {
                id: "customer",
                label: `${icons.user} Cliente`,
                content: (
                  <div className={flexColGap2}>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Nombre *"
                        placeholder="Nombre completo"
                        containerClassName={flexColGap2}
                        labelClassName={formTextStyles.label}
                        inputClassName={inputStyles.base}
                        {...upsertRegister("customerName")}
                        helperText={errors.customerName?.message}
                      />

                      <Input
                        label="Email *"
                        type="email"
                        placeholder="cliente@ejemplo.com"
                        containerClassName={flexColGap2}
                        labelClassName={formTextStyles.label}
                        inputClassName={inputStyles.base}
                        {...upsertRegister("customerEmail")}
                        helperText={errors.customerEmail?.message}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Teléfono"
                        placeholder="999 999 999"
                        containerClassName={flexColGap2}
                        labelClassName={formTextStyles.label}
                        inputClassName={inputStyles.base}
                        {...upsertRegister("customerPhone")}
                      />

                      <Input
                        label="Documento"
                        placeholder="DNI o Pasaporte"
                        containerClassName={flexColGap2}
                        labelClassName={formTextStyles.label}
                        inputClassName={inputStyles.base}
                        {...upsertRegister("customerDocument")}
                      />
                    </div>
                  </div>
                ),
              },
              {
                id: "dates",
                label: `${icons.calendar} Fechas`,
                content: (
                  <div className={flexColGap2}>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Fecha Check-in *"
                        type="date"
                        containerClassName={flexColGap2}
                        labelClassName={formTextStyles.label}
                        inputClassName={inputStyles.base}
                        {...upsertRegister("checkInDate")}
                        helperText={errors.checkInDate?.message}
                      />

                      <Input
                        label="Hora Check-in"
                        type="time"
                        containerClassName={flexColGap2}
                        labelClassName={formTextStyles.label}
                        inputClassName={inputStyles.base}
                        {...upsertRegister("checkInTime")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Fecha Check-out *"
                        type="date"
                        containerClassName={flexColGap2}
                        labelClassName={formTextStyles.label}
                        inputClassName={inputStyles.base}
                        {...upsertRegister("checkOutDate")}
                        helperText={errors.checkOutDate?.message}
                      />

                      <Input
                        label="Hora Check-out"
                        type="time"
                        containerClassName={flexColGap2}
                        labelClassName={formTextStyles.label}
                        inputClassName={inputStyles.base}
                        {...upsertRegister("checkOutTime")}
                      />
                    </div>
                  </div>
                ),
              },
              {
                id: "details",
                label: `${icons.fileText} Detalles`,
                content: (
                  <div className={flexColGap2}>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Precio Total *"
                        type="number"
                        step="0.01"
                        min="0"
                        disabled
                        containerClassName={flexColGap2}
                        labelClassName={formTextStyles.label}
                        inputClassName={`${inputStyles.base} bg-gray-100`}
                        {...upsertRegister("totalPrice", { valueAsNumber: true })}
                        helperText={errors.totalPrice?.message}
                      />

                      <div>
                        <label className={formTextStyles.label}>Moneda</label>
                        <select
                          {...upsertRegister("currency")}
                          className={inputStyles.base}
                        >
                          <option value="PEN">PEN</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={formTextStyles.label}>Estado</label>
                      <select
                        {...upsertRegister("status")}
                        className={inputStyles.base}
                      >
                        {reservationStatuses.map(status => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={formTextStyles.label}>Notas</label>
                      <textarea
                        rows={4}
                        placeholder="Notas adicionales sobre la reserva"
                        className={inputStyles.base}
                        {...upsertRegister("notes")}
                      />
                    </div>
                  </div>
                ),
              },
            ]}
          />

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, "upsert", false)}
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
                ? loadingButton("Guardando…", spinnerStyle, buttonBlueLabel)
                : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        load={state.modal}
        open={state.modals.delete}
        onClose={() => setModalState(setState, "delete", false)}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar Reserva</h2>
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.
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
              className={`${buttonStyles.red} flex items-center justify-center gap-2 ${
                state.loadAPI === "loading" ? "opacity-80 cursor-not-allowed" : ""
              }`}
              onClick={() => {
                if (!state.selected) return;

                setState(prev => ({ ...prev, loadAPI: "loading" }));

                api.delete(`/reservations/${state.selected.id}`)
                  .then(() => {
                    onSearch(state.reservations.pagination.page);
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

// Columns definition
const reservationsColumns = (
  setState: React.Dispatch<React.SetStateAction<ReservationsState>>,
  reset: any
) => [
  {
    key: "code",
    header: "Código",
    render: (row: ReservationRow) => (
      <Link to={`/reservations/${row.id}/check`} className={linkStyles}>
        {row.code}
      </Link>
    ),
  },
  {
    key: "customer",
    header: "Cliente",
    render: (row: ReservationRow) => (
      <div>
        <div className="text-sm font-medium">{row.customerName}</div>
        <div className="text-xs text-gray-500">{row.customerEmail}</div>
      </div>
    ),
  },
  {
    key: "product",
    header: "Producto",
    render: (row: ReservationRow) => (
      <div>
        <div className="text-sm">{row.productName}</div>
        <div className="text-xs text-gray-500">{row.productSku}</div>
      </div>
    ),
  },
  {
    key: "checkIn",
    header: "Check-in",
    render: (row: ReservationRow) => (
      <div className="text-sm">
        <div>{new Date(row.checkInDate).toLocaleDateString()}</div>
        <div className="text-xs text-gray-500">{row.checkInTime}</div>
      </div>
    ),
  },
  {
    key: "checkOut",
    header: "Check-out",
    render: (row: ReservationRow) => (
      <div className="text-sm">
        <div>{new Date(row.checkOutDate).toLocaleDateString()}</div>
        <div className="text-xs text-gray-500">{row.checkOutTime}</div>
      </div>
    ),
  },
  {
    key: "price",
    header: "Precio",
    render: (row: ReservationRow) => (
      <span className="text-sm font-medium">{row.labelPrice}</span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    render: (row: ReservationRow) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.status]}`}>
        {row.statusLabel}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Acciones",
    headerClassName: "text-right",
    render: (row: ReservationRow) => (
      <div className="flex justify-end gap-2">
        <Link
          to={`/reservations/${row.id}/check`}
          title="Ver detalle / Check-in/out"
          className={`${buttonStyles.base} text-blue-600 hover:text-blue-700`}
        >
          {icons.eye}
        </Link>

        <button
          type="button"
          title="Editar reserva"
          onClick={() => {
            setState(prev => ({ ...prev, selected: row }));
            setModalState(setState, "upsert", true, "loading");
            api.get(`/reservations/${row.id}`)
              .then(res => {
                const reservation = res.data;
                reset({
                  id: reservation.id,
                  product: reservation.product.id,
                  customerName: reservation.customerName,
                  customerEmail: reservation.customerEmail,
                  customerPhone: reservation.customerPhone || "",
                  customerDocument: reservation.customerDocument || "",
                  checkInDate: reservation.checkInDate.split('T')[0],
                  checkOutDate: reservation.checkOutDate.split('T')[0],
                  checkInTime: reservation.checkInTime,
                  checkOutTime: reservation.checkOutTime,
                  quantity: reservation.quantity,
                  totalPrice: reservation.totalPrice,
                  currency: reservation.currency,
                  status: reservation.status,
                  notes: reservation.notes || "",
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
          title="Eliminar reserva"
          onClick={() => {
            setState(prev => ({ ...prev, selected: row }));
            setModalState(setState, "delete", true);
          }}
          className={buttonStyles.base}
        >
          {icons.delete}
        </button>
      </div>
    ),
  },
];

// Loading/Empty/Error Nodes
function LoadingNode() {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">Cargando reservas...</p>
      </div>
    </div>
  );
}

function EmptyNode({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">No hay reservas creadas</p>
        <p className="text-sm text-gray-500 mt-1">Crea tu primera reserva para comenzar</p>
      </div>
      <button onClick={onCreateNew} className={buttonStyles.blue}>
        Crear nueva reserva
      </button>
    </div>
  );
}

function ErrorNode({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">Error al cargar reservas</p>
        <p className="text-sm text-gray-500 mt-1">No se pudieron cargar los datos</p>
      </div>
      <button onClick={onRetry} className={buttonStyles.blue}>
        Reintentar
      </button>
    </div>
  );
}
