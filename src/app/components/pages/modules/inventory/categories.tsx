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
import type { CategoryRow, CategoriesState } from "../../../../core/types/categories";
import {
  categoryFiltersSchema,
  categoryUpsertSchema,
  categoryFiltersDefaultValues,
  categoryUpsertDefaultValues,
  type CategoryFiltersInput,
  type CategoryUpsertInput,
} from "../../../../core/validations/categories";

export default function Categories() {
  const [state, setState] = useState<CategoriesState>({
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
      categoryRow: null,
      categoryDelete: null,
    },

    asyncSelections: {
      categories: {
        items: [],
        loading: "idle",
      },
    },

    categories: {
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
  } = useForm<CategoryFiltersInput>({
    resolver: zodResolver(categoryFiltersSchema),
    defaultValues: categoryFiltersDefaultValues,
  });

  const {
    register: upsertRegister,
    handleSubmit: handleUpsertSubmit,
    reset: resetUpsert,
    control: upsertControl,
    formState: { isValid }
  } = useForm<CategoryUpsertInput>({
    resolver: zodResolver(categoryUpsertSchema),
    defaultValues: categoryUpsertDefaultValues,
    mode: "onChange",
  });

  const onSearch = (page: number) => {
    setApiState(setState, "pagination", "loading");
    setTableState(setState, "categories", undefined, { page });

    api.post("/categories", {
      ...getFilterValues(),
      page,
    })
      .then(res => {
        setApiState(setState, "pagination", "ok");
        setTableState(setState, "categories", res.data.data, res.data.pagination);
      })
      .catch((err) => {
        setApiState(setState, "pagination", "error");
        notifyError(err);
      });
  };

  useEffect(() => {
    document.title = "Gestión Uno - Categorías";
    onSearch(1);
  }, []);

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Inventario", to: "/inventory" },
            { label: "Categorías", to: "/categories" },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
          <p className="text-gray-600">
            Administra las categorías de productos de tu inventario.
          </p>
        </div>

        <div className={flexWrapGap3}>
          <button
            onClick={() => {
              resetUpsert(categoryUpsertDefaultValues);
              setModalState(setState, "upsert", true);
            }}
            disabled={state.buttons.upsert}
            className={buttonStyles.green}
          >
            Crear nueva categoría
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
                resetFilters(categoryFiltersDefaultValues);
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
          data={state.categories.data}
          load={state.apis.pagination}
          columns={categoriesColumns(setState, resetUpsert)}
          pagination={state.categories.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<TableLoadingNode message="Cargando categorías..." />}
          emptyNode={
            <TableEmptyNode
              title="No hay categorías creadas"
              description="Crea tu primera categoría para comenzar"
              buttonText="Crear nueva categoría"
              onAction={() => {
                resetUpsert(categoryUpsertDefaultValues);
                setModalState(setState, "upsert", true);
              }}
            />
          }
          errorNode={
            <TableErrorNode
              title="Error al cargar categorías"
              description="No se pudieron cargar los datos"
              buttonText="Reintentar"
              onRetry={() => onSearch(state.categories.pagination.page)}
            />
          }
        />
      </div>

      <Modal
        open={state.modals.upsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selections.categoryRow?.id;
          if (!id) return;

          setModalState(setState, "upsert", true, "loading");

          api.get(`/categories/${id}`)
            .then(res => {
              const category = res.data.data;
              resetUpsert({
                id: category.id,
                name: category.name,
                description: category.description || "",
                parent: category.parent?.id || "",
              });

              setState(prev => ({
                ...prev,
                selections: {
                  ...prev.selections,
                  categoryRow: prev.selections.categoryRow ? {
                    ...prev.selections.categoryRow,
                    parent: category.parent,
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
          resetUpsert(categoryUpsertDefaultValues);
          setSelectionState(setState, "categoryRow", null);
        }}
      >
        <form
          onSubmit={handleUpsertSubmit(async (data) => {
            setApiState(setState, "upsert", "loading");
            setButtonState(setState, "upsert", true);

            api.post("/category-upsert", data)
              .then(() => {
                setApiState(setState, "upsert", "ok");
                setModalState(setState, "upsert", false);
                notifySuccess({
                  message: data.id ? "Categoría actualizada exitosamente" : "Categoría creada exitosamente",
                  code: "SUCCESS"
                });
                onSearch(state.categories.pagination.page);
                resetUpsert(categoryUpsertDefaultValues);
                setSelectionState(setState, "categoryRow", null);
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
              {state.selections.categoryRow ? "Editar categoría" : "Crear categoría"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selections.categoryRow
                ? "Modifica los datos de la categoría."
                : "Agrega una nueva categoría a tu catálogo."}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input
              label="Nombre *"
              placeholder="Nombre de la categoría"
              {...upsertRegister("name")}
            />

            <Input
              label="Descripción"
              placeholder="Descripción de la categoría"
              {...upsertRegister("description")}
            />

            <Controller
              name="parent"
              control={upsertControl}
              render={({ field }) => (
                <AsyncSelect
                  label="Categoría padre (opcional)"
                  endpoint="/categories"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar categoría padre"
                />
              )}
            />
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => {
                setModalState(setState, "upsert", false);
                resetUpsert(categoryUpsertDefaultValues);
                setSelectionState(setState, "categoryRow", null);
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
              normalText={state.selections.categoryRow ? "Actualizar" : "Crear"}
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
          setSelectionState(setState, "categoryDelete", null);
        }}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar categoría</h2>
            <p className="text-sm text-gray-500">
              ¿Está seguro que desea eliminar la categoría{" "}
              <span className="font-semibold">{state.selections.categoryDelete?.name}</span>?
              {state.selections.categoryDelete?.subCategoriesCount ? (
                <span className="block mt-2 text-red-600">
                  Esta categoría tiene {state.selections.categoryDelete.subCategoriesCount} subcategoría(s).
                </span>
              ) : null}
              {state.selections.categoryDelete?.productsCount ? (
                <span className="block mt-2 text-red-600">
                  Esta categoría tiene {state.selections.categoryDelete.productsCount} producto(s).
                </span>
              ) : null}
            </p>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => {
                setModalState(setState, "delete", false);
                setSelectionState(setState, "categoryDelete", null);
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
                const id = state.selections.categoryDelete?.id;
                if (!id) return;

                setApiState(setState, "delete", "loading");
                setButtonState(setState, "delete", true);

                api.delete(`/categories/${id}`)
                  .then(() => {
                    setApiState(setState, "delete", "ok");
                    setModalState(setState, "delete", false);
                    notifySuccess({ message: "Categoría eliminada exitosamente", code: "SUCCESS" });
                    onSearch(state.categories.pagination.page);
                    setSelectionState(setState, "categoryDelete", null);
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

const categoriesColumns = (
  setState: React.Dispatch<React.SetStateAction<CategoriesState>>,
  reset: any,
) => [
    {
      key: "name",
      header: "Nombre",
      render: (row: CategoryRow) => (
        <span className="font-medium">{row.name}</span>
      )
    },
    {
      key: "description",
      header: "Descripción",
      render: (row: CategoryRow) => (
        <span className="text-sm text-gray-600">{row.description || "-"}</span>
      )
    },
    {
      key: "parent",
      header: "Categoría padre",
      render: (row: CategoryRow) => (
        <span className="text-sm text-gray-600">{row.parent?.name || "-"}</span>
      )
    },
    {
      key: "productsCount",
      header: "Productos",
      render: (row: CategoryRow) => (
        <span className="text-sm text-gray-600">{row.productsCount}</span>
      )
    },
    {
      key: "subCategoriesCount",
      header: "Subcategorías",
      render: (row: CategoryRow) => (
        <span className="text-sm text-gray-600">{row.subCategoriesCount}</span>
      )
    },
    {
      key: "isActive",
      header: "Estado",
      render: (row: CategoryRow) => (
        <Badge label={row.isActive ? "Activo" : "Inactivo"} color={row.isActive ? "green" : "red"} />
      )
    },
    {
      key: "isSystem",
      header: "Sistema",
      render: (row: CategoryRow) => (
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
      render: (row: CategoryRow) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title={row.isEditable ? "Editar categoría" : "No se puede editar: elemento del sistema"}
            onClick={() => {
              if (!row.isEditable) {
                notifyInfo("No se puede editar una categoría del sistema");
                return;
              }
              setSelectionState(setState, "categoryRow", row);
              setModalState(setState, "upsert", true, "loading");
              api.get(`/categories/${row.id}`)
                .then(res => {
                  const category = res.data.data;
                  reset({
                    id: category.id,
                    name: category.name,
                    description: category.description || "",
                    parent: category.parent?.id || "",
                  });

                  setState(prev => ({
                    ...prev,
                    selections: {
                      ...prev.selections,
                      categoryRow: {
                        ...row,
                        parent: category.parent,
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
            title={row.isDeletable ? "Eliminar categoría" : (row.isEditable ? "No se puede eliminar: tiene productos o subcategorías asociados" : "No se puede eliminar: elemento del sistema")}
            onClick={() => {
              if (!row.isDeletable) {
                if (!row.isEditable) {
                  notifyInfo("No se puede eliminar una categoría del sistema");
                } else {
                  notifyInfo("No se puede eliminar porque tiene productos o subcategorías asociados");
                }
                return;
              }
              setSelectionState(setState, "categoryDelete", row);
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
