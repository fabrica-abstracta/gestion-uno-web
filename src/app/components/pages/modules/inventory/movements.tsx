import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Input from "../../../atoms/input";
import Select from "../../../atoms/select";
import Badge from "../../../atoms/badge";
import Table from "../../../organisms/table";
import Breadcrumb from "../../../molecules/breadcrumb";
import {
  buttonStyles,
  containerStyle,
} from "../../../../core/helpers/styles";
import { setApiState, notifyError, TableLoadingNode, TableEmptyNode, TableErrorNode } from "../../../../core/helpers/shared";
import type { MovementRow, MovementsState } from "../../../../core/types/movements";
import {
  movementFiltersSchema,
  movementFiltersDefaultValues,
  type MovementFiltersInput,
} from "../../../../core/validations/movements";

export default function Movements() {
  const [searchParams] = useSearchParams();
  const batchParam = searchParams.get("batch") || "";

  const [state, setState] = useState<MovementsState>({
    modal: "idle",

    apis: {
      pagination: "idle",
    },

    modals: {},

    buttons: {},

    selections: {
      movement: null,
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

  const {
    register: filterRegister,
    control: filterControl,
    getValues: getFilterValues,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
    setValue: setFilterValue,
  } = useForm<MovementFiltersInput>({
    resolver: zodResolver(movementFiltersSchema),
    defaultValues: {
      ...movementFiltersDefaultValues,
      batch: batchParam,
    },
  });

  const onSearch = (page: number) => {
    setState(prev => ({
      ...prev,
      movements: {
        ...prev.movements,
        pagination: {
          ...prev.movements.pagination,
          page,
        },
      },
    }));

    setApiState(setState, "pagination", "loading");

    api.post("/inventory-movements", {
      ...getFilterValues(),
      page,
      perPage: state.movements.pagination.perPage,
    })
      .then(res => {
        setState(prev => ({
          ...prev,
          movements: {
            ...prev.movements,
            data: res.data.data,
            pagination: res.data.pagination,
          },
        }));
        setApiState(setState, "pagination", "ok");
      })
      .catch((err) => {
        setApiState(setState, "pagination", "error");
        notifyError(err);
      });
  };

  useEffect(() => {
    if (batchParam) {
      setFilterValue("batch", batchParam);
    }
    onSearch(1);
  }, []);

  useEffect(() => {
    document.title = "Gestión Uno - Movimientos de Inventario";
  }, []);

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Inventario", to: "/inventory" },
            { label: "Movimientos", to: "/inventory/movements" },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
          <p className="text-gray-600">
            Historial completo de todos los movimientos de stock (incrementos y decrementos) de los lotes.
          </p>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              label="Código de lote"
              placeholder="Buscar por código de lote"
              {...filterRegister("batch")}
            />

            <Input
              label="Producto"
              placeholder="Buscar por nombre/SKU"
              {...filterRegister("product")}
            />

            <Controller
              name="type"
              control={filterControl}
              render={({ field }) => (
                <Select
                  label="Tipo de movimiento"
                  options={[
                    { label: "Todos", value: "" },
                    { label: "Incremento", value: "increment" },
                    { label: "Decremento", value: "decrement" },
                  ]}
                  value={field.value || ""}
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
            <button type="submit" className={buttonStyles.blue}>Buscar</button>
            <button
              type="button"
              onClick={() => {
                resetFilters({
                  ...movementFiltersDefaultValues,
                  batch: batchParam,
                });
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
          data={state.movements.data}
          load={state.apis.pagination}
          columns={movementsColumns()}
          pagination={state.movements.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<TableLoadingNode message="Cargando movimientos..." />}
          emptyNode={
            <TableEmptyNode
              title="No hay movimientos"
              description="No se encontraron movimientos de inventario con los filtros aplicados"
              buttonText="Limpiar filtros"
              onAction={() => {
                resetFilters({
                  ...movementFiltersDefaultValues,
                  batch: batchParam,
                });
                onSearch(1);
              }}
            />
          }
          errorNode={
            <TableErrorNode
              title="Error al cargar movimientos"
              description="No se pudieron cargar los datos"
              buttonText="Reintentar"
              onRetry={() => onSearch(state.movements.pagination.page)}
            />
          }
        />
      </div>
    </>
  );
}

const movementsColumns = () => [
  {
    key: "date",
    header: "Fecha",
    render: (row: MovementRow) => (
      <span className="text-sm text-gray-600">
        {new Date(row.date).toLocaleString()}
      </span>
    )
  },
  {
    key: "batch",
    header: "Lote",
    render: (row: MovementRow) => (
      <span className="text-sm font-medium text-gray-900">{row.batch}</span>
    )
  },
  {
    key: "product",
    header: "Producto",
    render: (row: MovementRow) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{row.product.name}</span>
        <span className="text-xs text-gray-500">SKU: {row.product.sku}</span>
      </div>
    )
  },
  {
    key: "type",
    header: "Tipo",
    render: (row: MovementRow) => (
      <Badge 
        label={row.type === "increment" ? "Incremento" : "Decremento"}
        color={row.type === "increment" ? "green" : "orange"}
      />
    )
  },
  {
    key: "quantity",
    header: "Cantidad",
    render: (row: MovementRow) => (
      <span className={`text-sm font-semibold ${row.type === "increment" ? "text-green-600" : "text-orange-600"}`}>
        {row.type === "increment" ? "+" : "-"}{row.quantity}
      </span>
    )
  },
  {
    key: "reason",
    header: "Razón",
    render: (row: MovementRow) => (
      <span className="text-sm text-gray-600">{row.reason || "Sin razón especificada"}</span>
    )
  },
];
