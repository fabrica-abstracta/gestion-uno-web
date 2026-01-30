import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
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
import type { BrandRow, BrandsState } from "../../../../core/types/brands";
import {
  brandFiltersSchema,
  brandUpsertSchema,
  brandFiltersDefaultValues,
  brandUpsertDefaultValues,
  type BrandFiltersInput,
  type BrandUpsertInput,
} from "../../../../core/validations/brands";

export default function Brands() {
  const [state, setState] = useState<BrandsState>({
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
      brandRow: null,
      brandDelete: null,
    },

    brands: {
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
  } = useForm<BrandFiltersInput>({
    resolver: zodResolver(brandFiltersSchema),
    defaultValues: brandFiltersDefaultValues,
  });

  const {
    register: upsertRegister,
    handleSubmit: handleUpsertSubmit,
    reset: resetUpsert,
    formState: { isValid }
  } = useForm<BrandUpsertInput>({
    resolver: zodResolver(brandUpsertSchema),
    defaultValues: brandUpsertDefaultValues,
    mode: "onChange",
  });

  const onSearch = (page: number) => {
    setApiState(setState, "pagination", "loading");
    setTableState(setState, "brands", undefined, { page });

    api.post("/brands", {
      ...getFilterValues(),
      page,
    })
      .then(res => {
        setApiState(setState, "pagination", "ok");
        setTableState(setState, "brands", res.data.data, res.data.pagination);
      })
      .catch((err) => {
        setApiState(setState, "pagination", "error");
        notifyError(err);
      });
  };

  useEffect(() => {
    document.title = "Gestión Uno - Marcas";
    onSearch(1);
  }, []);

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Inventario", to: "/inventory" },
            { label: "Marcas", to: "/brands" },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestión de Marcas</h1>
          <p className="text-gray-600">
            Administra las marcas de productos de tu inventario.
          </p>
        </div>

        <div className={flexWrapGap3}>
          <button
            onClick={() => {
              resetUpsert(brandUpsertDefaultValues);
              setModalState(setState, "upsert", true);
            }}
            disabled={state.buttons.upsert}
            className={buttonStyles.green}
          >
            Crear nueva marca
          </button>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Nombre"
              placeholder="Buscar por nombre"
              {...filterRegister("name")}
            />
          </div>

          <div className="flex gap-3 items-end flex-col md:flex-row justify-end">
            <button type="submit" className={buttonStyles.blue}>Buscar</button>
            <button
              type="button"
              onClick={() => {
                resetFilters(brandFiltersDefaultValues);
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
          data={state.brands.data}
          load={state.apis.pagination}
          columns={brandsColumns(setState, resetUpsert)}
          pagination={state.brands.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<TableLoadingNode message="Cargando marcas..." />}
          emptyNode={
            <TableEmptyNode
              title="No hay marcas creadas"
              description="Crea tu primera marca para comenzar"
              buttonText="Crear nueva marca"
              onAction={() => {
                resetUpsert(brandUpsertDefaultValues);
                setModalState(setState, "upsert", true);
              }}
            />
          }
          errorNode={
            <TableErrorNode
              title="Error al cargar marcas"
              description="No se pudieron cargar los datos"
              buttonText="Reintentar"
              onRetry={() => onSearch(state.brands.pagination.page)}
            />
          }
        />
      </div>

      <Modal
        open={state.modals.upsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selections.brandRow?.id;
          if (!id) return;

          setModalState(setState, "upsert", true, "loading");

          api.get(`/brands/${id}`)
            .then(res => {
              const brand = res.data.data;
              resetUpsert({
                id: brand.id,
                name: brand.name,
                description: brand.description || "",
              });

              setModalState(setState, "upsert", true, "ok");
            })
            .catch((err) => {
              setModalState(setState, "upsert", true, "error");
              notifyError(err);
            });
        }}
        onClose={() => {
          setModalState(setState, "upsert", false);
          resetUpsert(brandUpsertDefaultValues);
          setSelectionState(setState, "brandRow", null);
        }}
      >
        <form
          onSubmit={handleUpsertSubmit(async (data) => {
            setApiState(setState, "upsert", "loading");
            setButtonState(setState, "upsert", true);

            api.post("/brand-upsert", data)
              .then(() => {
                setApiState(setState, "upsert", "ok");
                setModalState(setState, "upsert", false);
                notifySuccess({ 
                  message: data.id ? "Marca actualizada exitosamente" : "Marca creada exitosamente",
                  code: "SUCCESS"
                });
                onSearch(state.brands.pagination.page);
                resetUpsert(brandUpsertDefaultValues);
                setSelectionState(setState, "brandRow", null);
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
              {state.selections.brandRow ? "Editar marca" : "Crear marca"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selections.brandRow
                ? "Modifica los datos de la marca."
                : "Agrega una nueva marca a tu catálogo."}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input
              label="Nombre *"
              placeholder="Nombre de la marca"
              {...upsertRegister("name")}
            />

            <Input
              label="Descripción"
              placeholder="Descripción de la marca"
              {...upsertRegister("description")}
            />
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => {
                setModalState(setState, "upsert", false);
                resetUpsert(brandUpsertDefaultValues);
                setSelectionState(setState, "brandRow", null);
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
              normalText={state.selections.brandRow ? "Actualizar" : "Crear"}
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
          setSelectionState(setState, "brandDelete", null);
        }}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar marca</h2>
            <p className="text-sm text-gray-500">
              ¿Está seguro que desea eliminar la marca{" "}
              <span className="font-semibold">{state.selections.brandDelete?.name}</span>?
              {state.selections.brandDelete?.productsCount ? (
                <span className="block mt-2 text-red-600">
                  Esta marca tiene {state.selections.brandDelete.productsCount} producto(s).
                </span>
              ) : null}
            </p>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => {
                setModalState(setState, "delete", false);
                setSelectionState(setState, "brandDelete", null);
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
                const id = state.selections.brandDelete?.id;
                if (!id) return;

                setApiState(setState, "delete", "loading");
                setButtonState(setState, "delete", true);

                api.delete(`/brands/${id}`)
                  .then(() => {
                    setApiState(setState, "delete", "ok");
                    setModalState(setState, "delete", false);
                    notifySuccess({ message: "Marca eliminada exitosamente", code: "SUCCESS" });
                    onSearch(state.brands.pagination.page);
                    setSelectionState(setState, "brandDelete", null);
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

const brandsColumns = (
  setState: React.Dispatch<React.SetStateAction<BrandsState>>,
  reset: any,
) => [
    {
      key: "name",
      header: "Nombre",
      render: (row: BrandRow) => (
        <span className="font-medium">{row.name}</span>
      )
    },
    {
      key: "description",
      header: "Descripción",
      render: (row: BrandRow) => (
        <span className="text-sm text-gray-600">{row.description || "-"}</span>
      )
    },
    {
      key: "productsCount",
      header: "Productos",
      render: (row: BrandRow) => (
        <span className="text-sm text-gray-600">{row.productsCount}</span>
      )
    },
    {
      key: "isActive",
      header: "Estado",
      render: (row: BrandRow) => (
        <Badge label={row.isActive ? "Activo" : "Inactivo"} color={row.isActive ? "green" : "red"} />
      )
    },
    {
      key: "isSystem",
      header: "Sistema",
      render: (row: BrandRow) => (
        row.isEditable ? (
          <span className="text-sm text-gray-600">No</span>
        ) : (
          <Badge label="Sí" color="gray" />
        )
      )
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      render: (row: BrandRow) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title={row.isEditable ? "Editar marca" : "No se puede editar: elemento del sistema"}
            onClick={() => {
              if (!row.isEditable) {
                notifyInfo("No se puede editar una marca del sistema");
                return;
              }
              setSelectionState(setState, "brandRow", row);
              setModalState(setState, "upsert", true, "loading");
              api.get(`/brands/${row.id}`)
                .then(res => {
                  const brand = res.data.data;
                  reset({
                    id: brand.id,
                    name: brand.name,
                    description: brand.description || "",
                  });

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
            title={row.isDeletable ? "Eliminar marca" : (row.isEditable ? "No se puede eliminar: tiene productos asociados" : "No se puede eliminar: elemento del sistema")}
            onClick={() => {
              if (!row.isDeletable) {
                if (!row.isEditable) {
                  notifyInfo("No se puede eliminar una marca del sistema");
                } else {
                  notifyInfo("No se puede eliminar porque tiene productos asociados");
                }
                return;
              }
              setSelectionState(setState, "brandDelete", row);
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
