import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
import AsyncSelect from "../../../atoms/async-select";
import LoadingButton from "../../../atoms/loading-button";
import Badge from "../../../atoms/badge";
import Table from "../../../organisms/table";
import Breadcrumb from "../../../molecules/breadcrumb";
import {
  buttonStyles,
  flexColGap2,
  flexJustifyEndGap3,
  flexWrapGap3,
  modalStyle,
  containerStyle,
} from "../../../../core/helpers/styles";
import { setModalState, setApiState, setButtonState, setSelectionState, setTableState, TableLoadingNode, TableEmptyNode, TableErrorNode, notifySuccess, notifyError, notifyInfo } from "../../../../core/helpers/shared";
import { icons } from "../../../../core/helpers/icons";
import type { UnitRow, UnitsState } from "../../../../core/types/units";
import {
  unitFiltersSchema,
  unitUpsertSchema,
  unitFiltersDefaultValues,
  unitUpsertDefaultValues,
  type UnitFiltersInput,
  type UnitUpsertInput,
} from "../../../../core/validations/units";

export default function Units() {
  const [state, setState] = useState<UnitsState>({
    modal: "idle",

    apis: {
      detail: "idle",
      upsert: "idle",
      delete: "idle",
      pagination: "idle",
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
      unitRow: null,
      unitDelete: null,
    },

    asyncSelections: {
      units: {
        items: [],
        loading: "idle",
      },
    },

    units: {
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
  } = useForm<UnitFiltersInput>({
    resolver: zodResolver(unitFiltersSchema),
    defaultValues: unitFiltersDefaultValues,
  });

  const {
    register: upsertRegister,
    handleSubmit: handleUpsertSubmit,
    reset: resetUpsert,
    control: upsertControl,
    formState: { isValid }
  } = useForm<UnitUpsertInput>({
    resolver: zodResolver(unitUpsertSchema),
    defaultValues: unitUpsertDefaultValues,
    mode: "onChange",
  });

  const onSearch = (page: number) => {
    setApiState(setState, "pagination", "loading");
    setTableState(setState, "units", undefined, { page });

    api.post("/units", {
      ...getFilterValues(),
      page,
    })
      .then(res => {
        setApiState(setState, "pagination", "ok");
        setTableState(setState, "units", res.data.data, res.data.pagination);
      })
      .catch((err) => {
        setApiState(setState, "pagination", "error");
        notifyError(err);
      });
  };

  useEffect(() => {
    document.title = "Gestión Uno - Unidades";
    onSearch(1);
  }, []);

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Inventario", to: "/inventory" },
            { label: "Unidades", to: "/units" },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestión de Unidades</h1>
          <p className="text-gray-600">
            Administra las unidades de medida de productos de tu inventario.
          </p>
        </div>

        <div className={flexWrapGap3}>
          <button
            onClick={() => {
              resetUpsert(unitUpsertDefaultValues);
              setModalState(setState, "upsert", true);
            }}
            disabled={state.buttons.upsert}
            className={buttonStyles.green}
          >
            Crear nueva unidad
          </button>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Nombre"
              placeholder="Buscar por nombre"
              {...filterRegister("name")}
            />

            <Input
              label="Dimensión"
              placeholder="Buscar por dimensión"
              {...filterRegister("dimension")}
            />
          </div>

          <div className="flex gap-3 items-end flex-col md:flex-row justify-end">
            <button type="submit" className={buttonStyles.blue}>Buscar</button>
            <button
              type="button"
              onClick={() => {
                resetFilters(unitFiltersDefaultValues);
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
          data={state.units.data}
          load={state.apis.pagination}
          columns={unitsColumns(setState, resetUpsert)}
          pagination={state.units.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<TableLoadingNode message="Cargando unidades..." />}
          emptyNode={
            <TableEmptyNode
              title="No hay unidades creadas"
              description="Crea tu primera unidad para comenzar"
              buttonText="Crear nueva unidad"
              onAction={() => {
                resetUpsert(unitUpsertDefaultValues);
                setModalState(setState, "upsert", true);
              }}
            />
          }
          errorNode={
            <TableErrorNode
              title="Error al cargar unidades"
              description="No se pudieron cargar los datos"
              buttonText="Reintentar"
              onRetry={() => onSearch(state.units.pagination.page)}
            />
          }
        />
      </div>

      <Modal
        open={state.modals.upsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selections.unitRow?.id;
          if (!id) return;

          setModalState(setState, "upsert", true, "loading");

          api.get(`/units/${id}`)
            .then(res => {
              const unit = res.data.data;
              resetUpsert({
                id: unit.id,
                name: unit.name,
                symbol: unit.symbol || "",
                dimension: unit.dimension || "",
                base: unit.base?.id || "",
                toBaseFactor: unit.toBaseFactor || 1,
              });

              setState(prev => ({
                ...prev,
                selections: {
                  ...prev.selections,
                  unitRow: prev.selections.unitRow ? {
                    ...prev.selections.unitRow,
                    base: unit.base,
                  } : null
                }
              }));

              setModalState(setState, "upsert", true, "ok");
            })
            .catch((err) => {
              setModalState(setState, "upsert", true, "error");
              notifyError(err);
            });
        }}
        onClose={() => {
          setModalState(setState, "upsert", false);
          resetUpsert(unitUpsertDefaultValues);
          setSelectionState(setState, "unitRow", null);
        }}
      >
        <form
          onSubmit={handleUpsertSubmit(async (data) => {
            setApiState(setState, "upsert", "loading");
            setButtonState(setState, "upsert", true);

            api.post("/unit-upsert", data)
              .then(() => {
                setApiState(setState, "upsert", "ok");
                setModalState(setState, "upsert", false);
                notifySuccess({
                  message: data.id ? "Unidad actualizada exitosamente" : "Unidad creada exitosamente",
                  code: "SUCCESS"
                });
                onSearch(state.units.pagination.page);
                resetUpsert(unitUpsertDefaultValues);
                setSelectionState(setState, "unitRow", null);
              })
              .catch((err) => {
                setApiState(setState, "upsert", "error");
                notifyError(err);
              })
              .finally(() => {
                setButtonState(setState, "upsert", false);
              });
          })}
          className={`${modalStyle} max-w-[720px]`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selections.unitRow ? "Editar unidad" : "Crear unidad"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selections.unitRow
                ? "Modifica los datos de la unidad."
                : "Agrega una nueva unidad a tu catálogo."}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input
              label="Nombre *"
              placeholder="Nombre de la unidad"
              {...upsertRegister("name")}
            />

            <Input
              label="Símbolo"
              placeholder="Símbolo de la unidad"
              {...upsertRegister("symbol")}
            />

            <Input
              label="Dimensión"
              placeholder="Dimensión de la unidad"
              {...upsertRegister("dimension")}
            />

            <Controller
              name="base"
              control={upsertControl}
              render={({ field }) => (
                <AsyncSelect
                  label="Unidad base (opcional)"
                  endpoint="/units"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar unidad base"
                />
              )}
            />

            <Input
              label="Factor de conversión"
              type="number"
              placeholder="Factor de conversión a unidad base"
              {...upsertRegister("toBaseFactor", { valueAsNumber: true })}
            />
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => {
                setModalState(setState, "upsert", false);
                resetUpsert(unitUpsertDefaultValues);
                setSelectionState(setState, "unitRow", null);
              }}
              className={buttonStyles.white}
              disabled={state.buttons.upsert}
            >
              Cancelar
            </button>

            <LoadingButton
              type="submit"
              disabled={!isValid || state.buttons.upsert}
              isLoading={state.buttons.upsert}
              loadingText="Guardando…"
              normalText={state.selections.unitRow ? "Actualizar" : "Crear"}
              className={buttonStyles.blue}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={state.modals.delete}
        load={state.modal}
        onClose={() => {
          setModalState(setState, "delete", false);
          setSelectionState(setState, "unitDelete", null);
        }}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar unidad</h2>
            <p className="text-sm text-gray-500">
              ¿Está seguro que desea eliminar la unidad{" "}
              <span className="font-semibold">{state.selections.unitDelete?.name}</span>?
              {state.selections.unitDelete?.productsCount ? (
                <span className="block mt-2 text-red-600">
                  Esta unidad tiene {state.selections.unitDelete.productsCount} producto(s).
                </span>
              ) : null}
            </p>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => {
                setModalState(setState, "delete", false);
                setSelectionState(setState, "unitDelete", null);
              }}
              className={buttonStyles.white}
              disabled={state.buttons.delete}
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
                const id = state.selections.unitDelete?.id;
                if (!id) return;

                setApiState(setState, "delete", "loading");
                setButtonState(setState, "delete", true);

                api.delete(`/units/${id}`)
                  .then(() => {
                    setApiState(setState, "delete", "ok");
                    setModalState(setState, "delete", false);
                    notifySuccess({ message: "Unidad eliminada exitosamente", code: "SUCCESS" });
                    onSearch(state.units.pagination.page);
                    setSelectionState(setState, "unitDelete", null);
                  })
                  .catch((err) => {
                    setApiState(setState, "delete", "error");
                    notifyError(err);
                  })
                  .finally(() => {
                    setButtonState(setState, "delete", false);
                  });
              }}
            />
          </div>
        </form>
      </Modal>
    </>
  );
}

const translateDimension = (dimension: string) => {
  const translations: Record<string, string> = {
    'count': 'Cantidad',
    'time': 'Tiempo',
    'length': 'Longitud',
    'mass': 'Masa',
    'volume': 'Volumen',
    'area': 'Área',
    'temperature': 'Temperatura',
  };
  return translations[dimension] || dimension;
};

const unitsColumns = (
  setState: React.Dispatch<React.SetStateAction<UnitsState>>,
  reset: any,
) => [
    {
      key: "name",
      header: "Nombre",
      render: (row: UnitRow) => (
        <span className="font-medium">{row.name}</span>
      )
    },
    {
      key: "symbol",
      header: "Símbolo",
      render: (row: UnitRow) => (
        <span className="text-sm text-gray-600">{row.symbol || "-"}</span>
      )
    },
    {
      key: "dimension",
      header: "Dimensión",
      render: (row: UnitRow) => (
        <span className="text-sm text-gray-600">{row.dimension ? translateDimension(row.dimension) : "-"}</span>
      )
    },
    {
      key: "isSystem",
      header: "Sistema",
      render: (row: UnitRow) => (
        row.isEditable ? (
          <span className="text-sm text-gray-600">No</span>
        ) : (
          <Badge label="Sí" color="gray" />
        )
      )
    },
    {
      key: "base",
      header: "Unidad base",
      render: (row: UnitRow) => (
        <span className="text-sm text-gray-600">
          {row.base ? `${row.base.name} (${row.base.symbol})` : "-"}
        </span>
      )
    },
    {
      key: "toBaseFactor",
      header: "Factor",
      render: (row: UnitRow) => (
        <span className="text-sm text-gray-600">{row.toBaseFactor}</span>
      )
    },
    {
      key: "productsCount",
      header: "Productos",
      render: (row: UnitRow) => (
        <span className="text-sm text-gray-600">{row.productsCount}</span>
      )
    },
    {
      key: "isActive",
      header: "Estado",
      render: (row: UnitRow) => (
        <Badge label={row.isActive ? "Activo" : "Inactivo"} color={row.isActive ? "green" : "red"} />
      )
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      render: (row: UnitRow) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title={row.isEditable ? "Editar unidad" : "No se puede editar: elemento del sistema"}
            onClick={() => {
              if (!row.isEditable) {
                notifyInfo("No se puede editar una unidad del sistema");
                return;
              }
              setSelectionState(setState, "unitRow", row);
              setModalState(setState, "upsert", true, "loading");
              api.get(`/units/${row.id}`)
                .then(res => {
                  const unit = res.data.data;
                  reset({
                    id: unit.id,
                    name: unit.name,
                    symbol: unit.symbol || "",
                    dimension: unit.dimension || "",
                    base: unit.base?.id || "",
                    toBaseFactor: unit.toBaseFactor || 1,
                  });

                  setState(prev => ({
                    ...prev,
                    selections: {
                      ...prev.selections,
                      unitRow: {
                        ...row,
                        base: unit.base,
                      }
                    }
                  }));

                  setModalState(setState, "upsert", true, "ok");
                })
                .catch((err) => {
                  setModalState(setState, "upsert", true, "error");
                  notifyError(err);
                });
            }}
            className={`${buttonStyles.base} ${!row.isEditable ? buttonStyles.disabled : ""}`}
          >
            {icons.edit}
          </button>

          <button
            type="button"
            title={row.isDeletable ? "Eliminar unidad" : (row.isEditable ? "No se puede eliminar: tiene productos asociados" : "No se puede eliminar: elemento del sistema")}
            onClick={() => {
              if (!row.isDeletable) {
                if (!row.isEditable) {
                  notifyInfo("No se puede eliminar una unidad del sistema");
                } else {
                  notifyInfo("No se puede eliminar porque tiene productos asociados");
                }
                return;
              }
              setSelectionState(setState, "unitDelete", row);
              setModalState(setState, "delete", true);
            }}
            className={`${buttonStyles.base} ${!row.isDeletable ? buttonStyles.disabled : ""}`}
          >
            {icons.delete}
          </button>
        </div>
      )
    }
  ];
