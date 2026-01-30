import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
import AsyncSelect from "../../../atoms/async-select";
import LoadingButton from "../../../atoms/loading-button";
import Badge from "../../../atoms/badge";
import BatchUpsertModal from "../../../organisms/batch-upsert-modal";
import type { BatchUpsertInput } from "../../../organisms/batch-upsert-modal";
import {
  buttonStyles,
  flexColGap2,
  flexJustifyEndGap3,
  flexWrapGap3,
  inputStyles,
  modalStyle,
  linkStyles,
  containerStyle,
} from "../../../../core/helpers/styles";
import { setModalState, setApiState, setButtonState, setSelectionState, setTableState, TableLoadingNode, TableEmptyNode, TableErrorNode, notifySuccess, notifyError } from "../../../../core/helpers/shared";
import { icons } from "../../../../core/helpers/icons";
import Table from "../../../organisms/table";
import type { ProductRow, ProductsState } from "../../../../core/types/products";
import {
  productFiltersSchema,
  productUpsertSchema,
  productFiltersDefaultValues,
  productUpsertDefaultValues,
  type ProductFiltersInput,
  type ProductUpsertInput,
} from "../../../../core/validations/products";
import Breadcrumb from "../../../molecules/breadcrumb";

export default function Products() {
  const fileInputRefImport = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const [state, setState] = useState<ProductsState>({
    modal: "idle",

    apis: {
      detail: "idle",
      upsert: "idle",
      delete: "idle",
      pagination: "idle",
      import: "idle",
      template: "idle",
    },

    modals: {
      upsert: false,
      delete: false,
      quickBatch: false,
      import: false,
    },

    buttons: {
      template: false,
      upsert: false,
      delete: false,
      import: false,
    },

    selections: {
      productRow: null,
      productDelete: null,
    },

    asyncSelections: {
      categories: {
        items: [],
        loading: "idle",
      },
      brands: {
        items: [],
        loading: "idle",
      },
      units: {
        items: [],
        loading: "idle",
      },
    },

    products: {
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

    importResult: {
      summary: null,
      errors: [],
    },
  });

  const {
    register: filterRegister,
    getValues: getFilterValues,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
    control: filterControl,
  } = useForm<ProductFiltersInput>({
    resolver: zodResolver(productFiltersSchema),
    defaultValues: productFiltersDefaultValues,
  });

  const {
    register: upsertRegister,
    handleSubmit: handleUpsertSubmit,
    reset: resetUpsert,
    control: upsertControl,
    formState: { isValid, isSubmitting }
  } = useForm<ProductUpsertInput>({
    resolver: zodResolver(productUpsertSchema),
    defaultValues: productUpsertDefaultValues,
    mode: "onChange",
  });

  const processFileImport = (file: File) => {
    if (!file) return;

    if (![
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ].includes(file.type)) {
      notifyError({ message: "Formato de archivo inválido. Solo se permiten archivos .xlsx, .xls o .csv", code: "INVALID_FILE" });
      return;
    }

    setApiState(setState, "import", "loading");
    setButtonState(setState, "import", true);

    const formData = new FormData();
    formData.append("file", file);

    api.post("/products-import", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
      .then(res => {
        setApiState(setState, "import", "ok");
        setState(prev => ({
          ...prev,
          importResult: {
            summary: res.data.summary,
            errors: res.data.errors || [],
          },
        }));
        onSearch(state.products.pagination.page);
        notifySuccess({ message: "Importación completada", code: "SUCCESS" });
      })
      .catch((err) => {
        setApiState(setState, "import", "error");
        notifyError(err);
      })
      .finally(() => {
        setButtonState(setState, "import", false);
        if (fileInputRefImport.current) fileInputRefImport.current.value = "";
      });
  };

  const onSearch = (page: number) => {
    setApiState(setState, "pagination", "loading");
    setTableState(setState, "products", undefined, { page });

    api.post("/products", {
      ...getFilterValues(),
      page,
    })
      .then(res => {
        setApiState(setState, "pagination", "ok");
        setTableState(setState, "products", res.data.data, res.data.pagination);
      })
      .catch((err) => {
        setApiState(setState, "pagination", "error");
        notifyError(err);
      });
  };

  useEffect(() => {
    document.title = "Gestión Uno - Productos";
    onSearch(1);
  }, []);

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Inventario", to: "/inventory" },
            { label: "Productos", to: "/products" },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestión de Productos</h1>
          <p className="text-gray-600">
            Administra tu catálogo de productos, stock y control de inventario.
          </p>
        </div>

        <div className={flexWrapGap3}>
          <button
            onClick={() => {
              resetUpsert(productUpsertDefaultValues);
              setModalState(setState, "upsert", true);
            }}
            disabled={state.buttons.upsert}
            className={buttonStyles.green}
          >
            Crear nuevo producto
          </button>

          <button
            onClick={() => setModalState(setState, "import", true)}
            className={buttonStyles.blue}
          >
            Importar productos
          </button>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="SKU"
              placeholder="Buscar por SKU"
              {...filterRegister("sku")}
            />

            <Input
              label="Nombre"
              placeholder="Buscar por nombre"
              {...filterRegister("name")}
            />

            <Controller
              name="brand"
              control={filterControl}
              render={({ field }) => (
                <AsyncSelect
                  label="Marca"
                  endpoint="/brands"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar marca"
                />
              )}
            />

            <Controller
              name="category"
              control={filterControl}
              render={({ field }) => (
                <AsyncSelect
                  label="Categoría"
                  endpoint="/categories"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar categoría"
                />
              )}
            />

            <Controller
              name="unit"
              control={filterControl}
              render={({ field }) => (
                <AsyncSelect
                  label="Unidad"
                  endpoint="/units"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar unidad"
                />
              )}
            />

            <Input
              label="Código de barras"
              placeholder="Buscar por código"
              {...filterRegister("barcode")}
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
                resetFilters(productFiltersDefaultValues);
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
          data={state.products.data}
          load={state.apis.pagination}
          columns={productsColumns(setState, resetUpsert)}
          pagination={state.products.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<TableLoadingNode message="Cargando productos..." />}
          emptyNode={
            <TableEmptyNode
              title="No hay productos creados"
              description="Crea tu primer producto para comenzar"
              buttonText="Crear nuevo producto"
              onAction={() => {
                resetUpsert(productUpsertDefaultValues);
                setModalState(setState, "upsert", true);
              }}
            />
          }
          errorNode={
            <TableErrorNode
              title="Error al cargar productos"
              description="No se pudieron cargar los datos"
              buttonText="Reintentar"
              onRetry={() => onSearch(state.products.pagination.page)}
            />
          }
        />
      </div>

      <Modal
        open={state.modals.upsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selections.productRow?.id;
          if (!id) return;

          setModalState(setState, "upsert", true, "loading");

          api.get(`/products/${id}`)
            .then(res => {
              const product = res.data.data;
              resetUpsert({
                id: product.id,
                name: product.name,
                description: product.description || "",
                price: product.price?.amount || 0,
                currency: product.price?.currency || "USD",
                stock: {
                  minimum: product.stock?.minimum || 0
                },
                category: product.category || "",
                brand: product.brand || "",
                unit: product.unit || "",
              });

              setState(prev => ({
                ...prev,
                selections: {
                  ...prev.selections,
                  productRow: prev.selections.productRow ? {
                    ...prev.selections.productRow,
                    categoryName: product.categoryName || "",
                    brandName: product.brandName || "",
                    unitName: product.unitName || "",
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
          resetUpsert(productUpsertDefaultValues);
          setSelectionState(setState, "productRow", null);
        }}
      >
        <form
          onSubmit={handleUpsertSubmit(async data => {
            setApiState(setState, "upsert", "loading");
            setButtonState(setState, "upsert", true);

            if (state.selections.productRow?.id) data.id = state.selections.productRow.id;

            api.post("/product-upsert", data)
              .then((res) => {
                notifySuccess(res.data);
                onSearch(state.products.pagination.page);
                resetUpsert(productUpsertDefaultValues);
                setApiState(setState, "upsert", "ok");
                setButtonState(setState, "upsert", false);
                setSelectionState(setState, "productRow", null);
                setModalState(setState, "upsert", false);
              })
              .catch((err) => {
                setApiState(setState, "upsert", "error");
                setButtonState(setState, "upsert", false);
                notifyError(err);
              });
          })}
          className={`${modalStyle} max-w-[720px]`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selections.productRow ? "Editar Producto" : "Crear Producto"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selections.productRow
                ? "Modifica los datos del producto."
                : "Agrega un nuevo producto a tu catálogo."}
            </p>
          </div>

          <div className={flexColGap2}>
            {state.selections.productRow && state.selections.productRow.sku && (
              <Input
                label="SKU"
                placeholder="Auto-generado"
                disabled
                value={state.selections.productRow.sku}
                inputClassName={`${inputStyles.base} bg-gray-100 cursor-not-allowed`}
              />
            )}

            <Input
              label="Nombre *"
              placeholder="Nombre del producto"
              {...upsertRegister("name")}
            />

            <Input
              label="Descripción"
              placeholder="Descripción del producto"
              {...upsertRegister("description")}
            />

            <Input
              label="Precio"
              type="number"
              step="0.01"
              {...upsertRegister("price", { valueAsNumber: true })}
            />

            <Input
              label="Stock mínimo"
              type="number"
              {...upsertRegister("stock.minimum", { valueAsNumber: true })}
            />

            <Controller
              name="category"
              control={upsertControl}
              render={({ field }) => (
                <AsyncSelect
                  label="Categoría"
                  endpoint="/categories"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar categoría"
                  initialOption={
                    state.selections.productRow?.categoryName && field.value
                      ? { label: state.selections.productRow.categoryName, value: field.value }
                      : null
                  }
                />
              )}
            />

            <Controller
              name="brand"
              control={upsertControl}
              render={({ field }) => (
                <AsyncSelect
                  label="Marca"
                  endpoint="/brands"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar marca"
                  initialOption={
                    state.selections.productRow?.brandName && field.value
                      ? { label: state.selections.productRow.brandName, value: field.value }
                      : null
                  }
                />
              )}
            />

            <Controller
              name="unit"
              control={upsertControl}
              render={({ field }) => (
                <AsyncSelect
                  label="Unidad de medida *"
                  endpoint="/units"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar unidad"
                  initialOption={
                    state.selections.productRow?.unitName && field.value
                      ? { label: state.selections.productRow.unitName, value: field.value }
                      : null
                  }
                />
              )}
            />
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, "upsert", false)}
            >
              Cancelar
            </button>

            <LoadingButton
              type="submit"
              disabled={!isValid || isSubmitting}
              isLoading={state.buttons.upsert}
              loadingText="Guardando…"
              normalText="Guardar"
              className={buttonStyles.blue}
            />
          </div>
        </form>
      </Modal>

      <BatchUpsertModal
        open={state.modals.quickBatch}
        loadState={state.modal}
        loadAPI={state.apis.upsert}
        productId={state.selections.productRow?.id || ""}
        initialAction="increment"
        onClose={() => {
          setModalState(setState, "quickBatch", false);
          setSelectionState(setState, "productRow", null);
        }}
        onSubmit={(data: BatchUpsertInput) => {
          setApiState(setState, "upsert", "loading");

          api.post("/batch-upsert", data)
            .then((res) => {
              notifySuccess(res.data);
              onSearch(state.products.pagination.page);
              setApiState(setState, "upsert", "ok");
              setSelectionState(setState, "productRow", null);
              setModalState(setState, "quickBatch", false);
            })
            .catch((err) => {
              setApiState(setState, "upsert", "error");
              notifyError(err);
            });
        }}
        onRetry={() => {
          setModalState(setState, "quickBatch", true, "ok");
        }}
      />

      <Modal
        load={state.modal}
        open={state.modals.delete}
        onClose={() => setModalState(setState, "delete", false)}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar Producto</h2>
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.
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
                if (!state.selections.productDelete) return;

                setApiState(setState, "delete", "loading");
                setButtonState(setState, "delete", true);

                api.delete(`/products/${state.selections.productDelete.id}`)
                  .then((res) => {
                    notifySuccess(res.data);
                    onSearch(state.products.pagination.page);
                    setModalState(setState, "delete", false);
                    setApiState(setState, "delete", "ok");
                    setButtonState(setState, "delete", false);
                    setSelectionState(setState, "productDelete", null);
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

      <Modal
        open={state.modals.import}
        onClose={() => {
          setModalState(setState, "import", false);
          setState(prev => ({ ...prev, importResult: { summary: null, errors: [] } }));
        }}
      >
        <div className={`mx-auto max-w-[720px] ${modalStyle}`}>
          <div>
            <h2 className="text-xl font-semibold">
              {state.importResult.summary ? "Resultado de Importación" : "Importar Productos"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.importResult.summary
                ? "Resumen del proceso de importación de productos"
                : "Arrastra tu archivo o haz clic para seleccionarlo"}
            </p>
          </div>

          {!state.importResult.summary ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-yellow-800">Importante</p>
                    <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                      <li>Descarga primero la plantilla para asegurar el formato correcto</li>
                      <li>Solo se permiten archivos .xlsx, .xls o .csv</li>
                      <li>Los productos con código existente serán actualizados</li>
                      <li>Los campos obligatorios son: Nombre y Precio</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-end">
                <LoadingButton
                  isLoading={state.buttons.template}
                  loadingText={
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Descargando...
                    </div>
                  }
                  normalText="Descargar plantilla"
                  onClick={() => {
                    setApiState(setState, "template", "loading");
                    setButtonState(setState, "template", true);

                    api.get("/products-template", { responseType: "blob" })
                      .then(res => {
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", "plantilla-importacion-productos.xlsx");
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        setApiState(setState, "template", "ok");
                        setButtonState(setState, "template", false);
                        notifySuccess({ message: "Plantilla descargada exitosamente", code: "SUCCESS" });
                      })
                      .catch((err) => {
                        setApiState(setState, "template", "error");
                        setButtonState(setState, "template", false);
                        notifyError(err);
                      });
                  }}
                  disabled={state.buttons.template}
                  className={buttonStyles.blue}
                />
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processFileImport(file);
                }}
                onClick={() => fileInputRefImport.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                  ${dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                  ${state.apis.import === "loading" ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {state.apis.import === "loading" ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-lg font-medium text-gray-700">Procesando archivo...</p>
                    <p className="text-sm text-gray-500">Por favor espera mientras importamos los productos</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        {dragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        o haz clic para seleccionar
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">Formatos: .xlsx, .xls, .csv</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRefImport}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processFileImport(file);
                }}
              />

              <div className={flexJustifyEndGap3}>
                <button
                  type="button"
                  className={buttonStyles.white}
                  onClick={() => setModalState(setState, "import", false)}
                  disabled={state.buttons.import}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {state.importResult.summary.total}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600">Creados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {state.importResult.summary.created}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xs text-gray-600">Actualizados</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {state.importResult.summary.updated}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-gray-600">Errores</p>
                  <p className="text-2xl font-bold text-red-600">
                    {state.importResult.summary.errors}
                  </p>
                </div>
              </div>

              {state.importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Errores encontrados:</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {state.importResult.errors.map((err, idx) => (
                      <div key={idx} className="p-3 bg-red-50 rounded-lg text-sm">
                        <p className="font-semibold text-red-800">
                          Fila {err.row}: {err.product}
                        </p>
                        <p className="text-red-600">{err.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={flexJustifyEndGap3}>
                <button
                  type="button"
                  className={buttonStyles.blue}
                  onClick={() => {
                    setModalState(setState, "import", false);
                    setState(prev => ({ ...prev, importResult: { summary: null, errors: [] } }));
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

const productsColumns = (
  setState: React.Dispatch<React.SetStateAction<ProductsState>>,
  reset: any,
) => [
    {
      key: "name",
      header: "Nombre",
      render: (row: ProductRow) => (
        <Link to={`/products/${row.id}/batches`} className={linkStyles}>
          {row.name}
        </Link>
      )
    },
    {
      key: "sku",
      header: "SKU",
      render: (row: ProductRow) => (
        <span className="text-sm text-gray-600">{row.sku}</span>
      )
    },
    {
      key: "brand",
      header: "Marca",
      render: (row: ProductRow) => (
        <span className="text-sm text-gray-600">{row.brand}</span>
      )
    },
    {
      key: "stock",
      header: "Stock",
      render: (row: ProductRow) => (
        <span className="text-sm text-gray-600">{row.stock?.current || 0}</span>
      )
    },
    {
      key: "status",
      header: "Estado",
      render: (row: ProductRow) => (
        row.status ? <Badge label={row.status.label} color={row.status.color} /> : null
      )
    },
    {
      key: "price",
      header: "Precio",
      render: (row: ProductRow) => (
        <span className="text-sm text-gray-600">
          {row.price.currency} {row.price.amount.toFixed(2)}
        </span>
      )
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      render: (row: ProductRow) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title="Agregar lote rápido"
            onClick={() => {
              setSelectionState(setState, "productRow", row);
              setModalState(setState, "quickBatch", true);
            }}
            className={`${buttonStyles.base} text-green-600 hover:text-green-700`}
          >
            {icons.plus}
          </button>

          <button
            type="button"
            title="Editar producto"
            onClick={() => {
              setSelectionState(setState, "productRow", row);
              setModalState(setState, "upsert", true, "loading");
              api.get(`/products/${row.id}`)
                .then(res => {
                  const product = res.data.data;
                  reset({
                    id: product.id,
                    name: product.name,
                    description: product.description || "",
                    price: product.price?.amount || 0,
                    currency: product.price?.currency || "USD",
                    stock: {
                      minimum: product.stock?.minimum || 0
                    },
                    category: product.category || "",
                    brand: product.brand || "",
                    unit: product.unit || "",
                  });

                  setState(prev => ({
                    ...prev,
                    selections: {
                      ...prev.selections,
                      productRow: {
                        ...row,
                        categoryName: product.categoryName || "",
                        brandName: product.brandName || "",
                        unitName: product.unitName || "",
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
            className={buttonStyles.base}
          >
            {icons.edit}
          </button>

          <button
            type="button"
            title="Eliminar producto"
            onClick={() => {
              setSelectionState(setState, "productDelete", row);
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
