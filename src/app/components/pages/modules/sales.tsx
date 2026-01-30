import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../core/config/axios";
import Breadcrumb from "../../molecules/breadcrumb";
import Modal from "../../atoms/modal";
import Input from "../../atoms/input";
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
} from "../../../core/helpers/styles";
import { loadingButton, setModalState as setModalStateHelper } from "../../../core/helpers/shared";
import Select from "../../atoms/select";
import Pagination from "../../organisms/pagination";

// Types
interface ProductRow {
  id: string;
  name: string;
  sku: string;
  brand: string;
  stock: number;
  price: string;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface SaleSummary {
  subtotal: number;
  tax: number;
  total: number;
}

interface PaymentInfo {
  method: "CASH" | "YAPE" | "PLIN" | "CARD";
  reference?: string;
  amountReceived?: number;
}

interface SalesState {
  modal: LoadState;
  loadAPI: LoadState;

  modals: {
    payment: boolean;
  };

  cart: CartItem[];
  payment: PaymentInfo;

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
}

// Schemas
const productFiltersSchema = z.object({
  name: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
});

type ProductFiltersInput = z.infer<typeof productFiltersSchema>;

// Default values
const productFiltersDefaultValues: ProductFiltersInput = {
  name: "",
  brand: "",
  category: "",
};

// Use helper function from shared
const setModalState = setModalStateHelper;

export default function Sales() {
  const [state, setState] = useState<SalesState>({
    modal: "idle",
    loadAPI: "idle",

    modals: {
      payment: false,
    },

    cart: [],
    payment: { method: "CASH" },

    products: {
      load: "loading",
      data: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
  });

  const [amountReceivedStr, setAmountReceivedStr] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register: filterRegister,
    getValues: getFilterValues,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
  } = useForm<ProductFiltersInput>({
    resolver: zodResolver(productFiltersSchema),
    defaultValues: productFiltersDefaultValues,
  });

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

  const addToCart = (product: ProductRow) => {
    setState(prev => {
      const existing = prev.cart.find(p => p.productId === product.id);
      const productPrice = parseFloat(product.price.replace(/[^\d.-]/g, ''));

      if (existing) {
        const quantity = Math.min(existing.quantity + 1, product.stock);
        return {
          ...prev,
          cart: prev.cart.map(i =>
            i.productId === product.id
              ? { ...i, quantity, subtotal: quantity * i.price }
              : i
          ),
        };
      }

      return {
        ...prev,
        cart: [
          ...prev.cart,
          {
            productId: product.id,
            name: product.name,
            price: productPrice,
            quantity: 1,
            subtotal: productPrice,
          },
        ],
      };
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart
        .map(item => {
          if (item.productId !== productId) return item;
          const quantity = Math.max(item.quantity + delta, 0);
          if (quantity === 0) return null;
          return { ...item, quantity, subtotal: quantity * item.price };
        })
        .filter(Boolean) as CartItem[],
    }));
  };

  const removeFromCart = (productId: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.productId !== productId),
    }));
  };

  const summary: SaleSummary = (() => {
    const subtotal = state.cart.reduce((s, i) => s + i.subtotal, 0);
    const tax = subtotal * 0.18;
    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number((subtotal + tax).toFixed(2)),
    };
  })();

  const processSale = async () => {
    setState(prev => ({ ...prev, loadAPI: "loading" }));

    api.post("/payment-intents", {
      cart: state.cart,
      payment: state.payment,
      summary,
    })
      .then((response) => {
        setState(prev => ({
          ...prev,
          cart: [],
          payment: { method: "CASH" },
          loadAPI: "idle",
        }));
        setAmountReceivedStr("");
        setModalState(setState, "payment", false);
        setSuccessMessage(`Venta registrada: ${response.data.code}`);
        setTimeout(() => setSuccessMessage(null), 4000);
      })
      .catch(() => {
        setState(prev => ({ ...prev, loadAPI: "error" }));
      });
  };

  useEffect(() => {
    document.title = "Gestión Uno - Ventas";
    onSearch(1);
  }, []);

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb items={[{ label: "Inicio", to: "/" }, { label: "Venta Directa" }]} />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Venta Directa (POS)</h1>
          <p className="text-gray-600">Selecciona productos para cobrar</p>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className={`${flexWrapGap3} items-end`}>
          <Input
            label="Buscar producto"
            placeholder="Buscar por nombre"
            containerClassName="w-full md:w-64"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("name")}
          />

          <Input
            label="Marca"
            placeholder="Filtrar por marca"
            containerClassName="w-full md:w-64"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("brand")}
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

        <div className="flex gap-6 flex-1">
          <div className="flex-[70%]">
            {state.products.load === "loading" ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-gray-200 animate-pulse p-4 min-h-[160px]" />
                ))}
              </div>
            ) : state.products.load === "error" ? (
              <div className="text-center py-12">
                <p className="text-red-600 font-medium">Error al cargar productos</p>
                <button onClick={() => onSearch(state.products.pagination.page)} className={buttonStyles.blue + " mt-4"}>
                  Reintentar
                </button>
              </div>
            ) : state.products.data.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No hay productos disponibles</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 overflow-y-auto h-[520px]">
                  {state.products.data.map(product => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="cursor-pointer rounded-2xl bg-white p-4 border border-gray-200 shadow-sm active:scale-[0.97] active:bg-indigo-50 transition flex flex-col justify-between h-[160px] hover:shadow-md"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          SKU: {product.sku}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.stock}
                        </p>
                      </div>

                      <div className="flex justify-between items-end mt-2">
                        <span className="text-xs text-gray-500">{product.brand}</span>
                        <span className="text-xl font-bold text-indigo-600">
                          {product.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <Pagination
                  pagination={state.products.pagination}
                  onPageChange={onSearch}
                />
              </>
            )}
          </div>

          <div className="flex-[30%] flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 h-[420px] overflow-y-auto">
              <h2 className="font-semibold text-gray-800 mb-3 sticky top-0 bg-white pb-2">
                Carrito ({state.cart.length})
              </h2>

              {state.cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm">Carrito vacío</p>
                </div>
              ) : (
                state.cart.map(item => (
                  <div
                    key={item.productId}
                    className="rounded-xl border border-gray-100 bg-gray-50 p-3 mb-2"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800 text-sm">
                        {item.name}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="h-9 w-9 rounded-full bg-gray-200 text-lg hover:bg-gray-300"
                        >
                          ➖
                        </button>
                        <span className="font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="h-9 w-9 rounded-full bg-gray-200 text-lg hover:bg-gray-300"
                        >
                          ➕
                        </button>
                      </div>

                      <span className="font-bold text-gray-800">
                        S/. {item.subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>S/. {summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>IGV (18%)</span>
                <span>S/. {summary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-900 mt-3">
                <span>Total</span>
                <span>S/. {summary.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setModalState(setState, "payment", true)}
              disabled={state.cart.length === 0}
              className="
                rounded-2xl
                bg-emerald-600
                hover:bg-emerald-700
                active:scale-[0.98]
                py-5
                text-xl
                font-bold
                text-white
                transition
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              PAGAR
            </button>
          </div>
        </div>
      </div>

      <Modal open={state.modals.payment} onClose={() => setModalState(setState, "payment", false)}>
        <div className={`w-[480px] ${modalStyle}`}>
          <div>
            <h2 className="text-xl font-semibold">Procesar Pago</h2>
            <p className="text-sm text-gray-500">Total a pagar: S/. {summary.total.toFixed(2)}</p>
          </div>

          <div className={flexColGap2}>
            <Select
              label="Método de pago"
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              options={[
                { label: "Efectivo", value: "CASH" },
                { label: "Yape", value: "YAPE" },
                { label: "Plin", value: "PLIN" },
                { label: "Tarjeta", value: "CARD" },
              ]}
              value={state.payment.method}
              onChange={value =>
                setState(prev => ({ ...prev, payment: { ...prev.payment, method: value as PaymentInfo["method"] } }))
              }
            />

            {state.payment.method !== "CASH" && (
              <Input
                label="Referencia"
                placeholder="Número de operación"
                containerClassName={flexColGap2}
                labelClassName={formTextStyles.label}
                inputClassName={inputStyles.base}
                value={state.payment.reference ?? ""}
                onChange={e =>
                  setState(prev => ({ ...prev, payment: { ...prev.payment, reference: e.target.value } }))
                }
              />
            )}

            {state.payment.method === "CASH" && (
              <>
                <Input
                  label="Monto recibido"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  containerClassName={flexColGap2}
                  labelClassName={formTextStyles.label}
                  inputClassName={inputStyles.base}
                  value={amountReceivedStr}
                  onChange={e => {
                    setAmountReceivedStr(e.target.value);
                    setState(prev => ({
                      ...prev,
                      payment: { ...prev.payment, amountReceived: Number(e.target.value) }
                    }));
                  }}
                />
                {state.payment.amountReceived && state.payment.amountReceived >= summary.total && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-sm text-green-800">
                      <strong>Cambio:</strong> S/. {((state.payment.amountReceived ?? 0) - summary.total).toFixed(2)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={() => setModalState(setState, "payment", false)}
              className={buttonStyles.white}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={processSale}
              disabled={state.loadAPI === "loading"}
              className={`${buttonStyles.green} flex items-center justify-center gap-2 ${state.loadAPI === "loading" ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {state.loadAPI === "loading"
                ? loadingButton("Procesando…", spinnerStyle, buttonBlueLabel)
                : "Confirmar"}
            </button>
          </div>
        </div>
      </Modal>

      {successMessage && (
        <div className="fixed bottom-4 right-4 rounded-xl bg-emerald-600 text-white px-4 py-3 shadow-lg">
          {successMessage}
        </div>
      )}
    </>
  );
}
