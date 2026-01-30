import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../core/config/axios";
import Breadcrumb from "../../molecules/breadcrumb";
import Modal from "../../atoms/modal";
import Input from "../../atoms/input";
import Select from "../../atoms/select";
import Table from "../../organisms/table";
import BatchUpsertModal from "../../organisms/batch-upsert-modal";
import type { BatchUpsertInput } from "../../organisms/batch-upsert-modal";
import type { LoadState } from "../../atoms/modal";
import {
  buttonStyles,
  containerStyle,
  flexColGap2,
  flexJustifyEndGap3,
  flexWrapGap3,
  formTextStyles,
  inputStyles,
  modalStyle,
  spinnerStyle,
  buttonBlueLabel,
  linkStyles,
} from "../../../core/helpers/styles";
import { loadingButton, setModalState as setModalStateHelper } from "../../../core/helpers/shared";

// Types
interface ProductRow {
  id: string;
  name: string;
  sku: string;
  brand: string;
  stock: number;
  price: number;
  currency: string;
  labelPrice: string;
}

interface ProductsState {
  modal: LoadState;
  loadAPI: LoadState;

  modals: {
    upsert: boolean;
    delete: boolean;
    quickBatch: boolean;
  };

  selected: ProductRow | null;

  products: {
    load: LoadState;
    data: ProductRow[];
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
    currencies: { label: string; value: string }[];
    categories: { label: string; value: string }[];
    brands: { label: string; value: string }[];
    units: { label: string; value: string }[];
    loadingCurrencies: boolean;
    loadingCategories: boolean;
    loadingBrands: boolean;
    loadingUnits: boolean;
  };
}

// Schemas
const productFiltersSchema = z.object({
  name: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
});

const productUpsertSchema = z.object({
  id: z.string().optional(),
  sku: z.string().optional(), // Auto-generado, no editable
  name: z.string().min(1, "Nombre es requerido"),
  description: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  stockMinimum: z.number().min(0, "Stock mínimo debe ser mayor o igual a 0").optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  unit: z.string().min(1, "Unidad de medida es requerida"),
});

type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
type ProductUpsertInput = z.infer<typeof productUpsertSchema>;

// Default values
const productFiltersDefaultValues: ProductFiltersInput = {
  name: "",
  brand: "",
  category: "",
};

const productUpsertDefaultValues: ProductUpsertInput = {
  name: "",
  description: "",
  price: 0,
  currency: "PEN",
  stockMinimum: 0,
  category: "",
  brand: "",
  unit: "unidad", // Por defecto unidad
};

// Use helper function from shared
const setModalState = setModalStateHelper;

// Icons
const icons = {
  plus: (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  ),
  edit: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7a7a7aff">
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
    </svg>
  ),
  delete: (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7a7a7aff">
      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
    </svg>
  ),
};

export default function Products() {
  const [state, setState] = useState<ProductsState>({
    modal: "idle",
    loadAPI: "idle",

    modals: {
      upsert: false,
      delete: false,
      quickBatch: false,
    },

    selected: null,

    products: {
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
      currencies: [],
      categories: [{ label: "(Vacío)", value: "" }],
      brands: [{ label: "(Vacío)", value: "" }],
      units: [],
      loadingCurrencies: false,
      loadingCategories: false,
      loadingBrands: false,
      loadingUnits: false,
    },
  });

  const {
    register: filterRegister,
    getValues: getFilterValues,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
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

  // Funciones para cargar catálogos
  const loadCurrencies = (search = "") => {
    setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingCurrencies: true } }));

    api.post("/currencies", { name: search, page: 1, perPage: 50 })
      .then(res => {
        const currencies = res.data.data.map((c: any) => ({
          label: `${c.code} - ${c.name}`,
          value: c.code,
        }));
        setState(prev => ({
          ...prev,
          catalogs: { ...prev.catalogs, currencies, loadingCurrencies: false },
        }));
      })
      .catch(() => {
        setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingCurrencies: false } }));
      });
  };

  const loadCategories = (search = "") => {
    setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingCategories: true } }));

    api.post("/categories", { name: search, page: 1, perPage: 50 })
      .then(res => {
        const categories = [
          { label: "(Vacío)", value: "" },
          ...res.data.data.map((c: any) => ({
            label: c.name,
            value: c.id,
          })),
        ];
        setState(prev => ({
          ...prev,
          catalogs: { ...prev.catalogs, categories, loadingCategories: false },
        }));
      })
      .catch(() => {
        setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingCategories: false } }));
      });
  };

  const loadBrands = (search = "") => {
    setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingBrands: true } }));

    api.post("/brands", { name: search, page: 1, perPage: 50 })
      .then(res => {
        const brands = [
          { label: "(Vacío)", value: "" },
          ...res.data.data.map((b: any) => ({
            label: b.name,
            value: b.id,
          })),
        ];
        setState(prev => ({
          ...prev,
          catalogs: { ...prev.catalogs, brands, loadingBrands: false },
        }));
      })
      .catch(() => {
        setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingBrands: false } }));
      });
  };

  const loadUnits = (search = "") => {
    setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingUnits: true } }));

    api.post("/units", { name: search, page: 1, perPage: 50 })
      .then(res => {
        const units = res.data.data.map((u: any) => ({
          label: u.name,
          value: u.id,
        }));
        setState(prev => ({
          ...prev,
          catalogs: { ...prev.catalogs, units, loadingUnits: false },
        }));
      })
      .catch(() => {
        setState(prev => ({ ...prev, catalogs: { ...prev.catalogs, loadingUnits: false } }));
      });
  };

  const onSearch = (page: number) => {
    const filters = getFilterValues();

    setState(prev => ({
      ...prev,
      products: {
        ...prev.products,
        load: "loading",
        pagination: {
          ...prev.products.pagination,
          page,
        },
      },
    }));

    api.post("/products", {
      ...filters,
      page,
      perPage: state.products.pagination.perPage,
    })
      .then(res => {
        const result = res.data;
        setState(prev => ({
          ...prev,
          products: {
            load: "ok",
            data: result.data,
            pagination: result.pagination,
          },
        }));
      })
      .catch(() => {
        setState(prev => ({
          ...prev,
          products: {
            ...prev.products,
            load: "error",
          },
        }));
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
            { label: "Productos" },
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
              loadCurrencies();
              loadCategories();
              loadBrands();
              loadUnits();
              setModalState(setState, "upsert", true);
            }}
            className={buttonStyles.green}
          >
            Crear nuevo producto
          </button>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className={`${flexWrapGap3} items-end`}>
          <Input
            label="Nombre"
            placeholder="Buscar por nombre"
            containerClassName="w-full md:w-64"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("name")}
          />

          <Input
            label="Marca"
            placeholder="Buscar por marca"
            containerClassName="w-full md:w-64"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("brand")}
          />

          <Input
            label="Categoría"
            placeholder="Buscar por categoría"
            containerClassName="w-full md:w-64"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("category")}
          />

          <button type="submit" className={buttonStyles.blue}>
            Buscar
          </button>
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
        </form>

        <Table
          heightClass="h-96"
          data={state.products.data}
          load={state.products.load}
          columns={productsColumns(setState, resetUpsert)}
          pagination={state.products.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<LoadingNode />}
          emptyNode={<EmptyNode onCreateNew={() => {
            resetUpsert(productUpsertDefaultValues);
            loadCurrencies();
            loadCategories();
            loadBrands();
            loadUnits();
            setModalState(setState, "upsert", true);
          }} />}
          errorNode={<ErrorNode onRetry={() => onSearch(state.products.pagination.page)} />}
        />
      </div>

      <Modal
        open={state.modals.upsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selected?.id;
          if (!id) return;

          loadCurrencies();
          loadCategories();
          loadBrands();
          loadUnits();
          setModalState(setState, "upsert", true, "loading");

          api.get(`/products/${id}`)
            .then(res => {
              const product = res.data;
              resetUpsert({
                id: product.id,
                name: product.name,
                description: product.description || "",
                price: product.price?.amount || 0,
                currency: product.price?.currency || "PEN",
                stockMinimum: product.stock?.minimum || 0,
                category: product.category || "",
                brand: product.brand || "",
                unit: product.unit || "unidad",
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

            api.post("/products-upsert", {
              ...data,
              ...(state.selected?.id ? { id: state.selected.id } : {}),
            })
              .then(() => {
                onSearch(state.products.pagination.page);
                resetUpsert(productUpsertDefaultValues);
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
              {state.selected ? "Editar Producto" : "Crear Producto"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selected
                ? "Modifica los datos del producto."
                : "Agrega un nuevo producto a tu catálogo."}
            </p>
          </div>

          <div className={flexColGap2}>
            {state.selected && state.selected.sku && (
              <Input
                label="SKU"
                placeholder="Auto-generado"
                disabled
                value={state.selected.sku}
                containerClassName={flexColGap2}
                labelClassName={formTextStyles.label}
                inputClassName={`${inputStyles.base} bg-gray-100 cursor-not-allowed`}
              />
            )}

            <Input
              label="Nombre *"
              placeholder="Nombre del producto"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...upsertRegister("name")}
            />

            <Input
              label="Descripción"
              placeholder="Descripción del producto"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...upsertRegister("description")}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Precio"
                type="number"
                step="0.01"
                containerClassName={flexColGap2}
                labelClassName={formTextStyles.label}
                inputClassName={inputStyles.base}
                {...upsertRegister("price", { valueAsNumber: true })}
              />

              <Controller
                name="currency"
                control={upsertControl}
                render={({ field }) => (
                  <Select
                    label="Moneda"
                    options={state.catalogs.currencies}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={state.catalogs.loadingCurrencies ? "Cargando..." : "Seleccionar moneda"}
                    containerClassName={flexColGap2}
                    labelClassName={formTextStyles.label}
                    inputClassName={inputStyles.base}
                  />
                )}
              />
            </div>

            <Input
              label="Stock mínimo"
              type="number"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...upsertRegister("stockMinimum", { valueAsNumber: true })}
            />

            <Controller
              name="category"
              control={upsertControl}
              render={({ field }) => (
                <Select
                  label="Categoría"
                  options={state.catalogs.categories}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={state.catalogs.loadingCategories ? "Cargando..." : "Seleccionar categoría"}
                  containerClassName={flexColGap2}
                  labelClassName={formTextStyles.label}
                  inputClassName={inputStyles.base}
                />
              )}
            />

            <Controller
              name="brand"
              control={upsertControl}
              render={({ field }) => (
                <Select
                  label="Marca"
                  options={state.catalogs.brands}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={state.catalogs.loadingBrands ? "Cargando..." : "Seleccionar marca"}
                  containerClassName={flexColGap2}
                  labelClassName={formTextStyles.label}
                  inputClassName={inputStyles.base}
                />
              )}
            />

            <Controller
              name="unit"
              control={upsertControl}
              render={({ field }) => (
                <Select
                  label="Unidad de medida *"
                  options={state.catalogs.units}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={state.catalogs.loadingUnits ? "Cargando..." : "Seleccionar unidad"}
                  containerClassName={flexColGap2}
                  labelClassName={formTextStyles.label}
                  inputClassName={inputStyles.base}
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

            <button
              type="submit"
              disabled={!isValid || isSubmitting || state.loadAPI === "loading"}
              className={`${buttonStyles.blue} flex items-center justify-center gap-2 ${!isValid || state.loadAPI === "loading" ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {state.loadAPI === "loading"
                ? loadingButton("Guardando…", spinnerStyle, buttonBlueLabel)
                : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      <BatchUpsertModal
        open={state.modals.quickBatch}
        loadState={state.modal}
        loadAPI={state.loadAPI}
        productId={state.selected?.id}
        onClose={() => {
          setModalState(setState, "quickBatch", false);
          setState(prev => ({ ...prev, selected: null }));
        }}
        onSubmit={(data: BatchUpsertInput) => {
          setState(prev => ({ ...prev, loadAPI: "loading" }));

          api.post("/batches-upsert", data)
            .then(() => {
              setState(prev => ({ ...prev, loadAPI: "idle", selected: null }));
              setModalState(setState, "quickBatch", false);
            })
            .catch(() => {
              setState(prev => ({ ...prev, loadAPI: "error" }));
            });
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

            <button
              type="button"
              disabled={state.loadAPI === "loading"}
              className={`${buttonStyles.red} flex items-center justify-center gap-2 ${state.loadAPI === "loading" ? "opacity-80 cursor-not-allowed" : ""
                }`}
              onClick={() => {
                if (!state.selected) return;

                setState(prev => ({ ...prev, loadAPI: "loading" }));

                api.delete(`/products/${state.selected.id}`)
                  .then(() => {
                    onSearch(state.products.pagination.page);
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
const productsColumns = (
  setState: React.Dispatch<React.SetStateAction<ProductsState>>,
  reset: any
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
        <span className="text-sm text-gray-600">{row.stock}</span>
      )
    },
    {
      key: "price",
      header: "Precio",
      render: (row: ProductRow) => (
        <span className="text-sm text-gray-600">{row.labelPrice}</span>
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
              setState(prev => ({ ...prev, selected: row }));
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
              setState(prev => ({ ...prev, selected: row }));
              setModalState(setState, "upsert", true, "loading");
              api.get(`/products/${row.id}`)
                .then(res => {
                  const product = res.data;
                  reset({
                    id: product.id,
                    name: product.name,
                    description: product.description || "",
                    price: product.price?.amount || 0,
                    currency: product.price?.currency || "PEN",
                    stockMinimum: product.stock?.minimum || 0,
                    category: product.category || "",
                    brand: product.brand || "",
                    unit: product.unit || "unidad",
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
            title="Eliminar producto"
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

// Loading/Empty/Error Nodes
function LoadingNode() {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">Cargando productos...</p>
      </div>
    </div>
  );
}

function EmptyNode({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">No hay productos creados</p>
        <p className="text-sm text-gray-500 mt-1">Crea tu primer producto para comenzar</p>
      </div>
      <button
        onClick={onCreateNew}
        className={buttonStyles.blue}
      >
        Crear nuevo producto
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
        <p className="font-medium text-s text-gray-900">Error al cargar productos</p>
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
