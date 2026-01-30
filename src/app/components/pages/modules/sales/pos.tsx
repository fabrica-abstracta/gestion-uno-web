import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Breadcrumb from "../../../molecules/breadcrumb";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
import Select from "../../../atoms/select";
import Pagination from "../../../organisms/pagination";
import {
  buttonStyles,
  containerStyle,
  flexColGap2,
  flexJustifyEndGap3,
  flexWrapGap3,
  formTextStyles,
  inputStyles,
  modalStyle,
  buttonBlueLabel,
  spinnerStyle,
} from "../../../../core/helpers/styles";
import {
  setModalState as setModalStateHelper,
  setApiState,
  setButtonState,
  notifySuccess,
  notifyError,
  loadingButton,
} from "../../../../core/helpers/shared";
import type { ProductRow, CartItem, TransactionSummary, SalesState } from "../../../../core/types/sales";
import {
  productFiltersSchema,
  productFiltersDefaultValues,
  type ProductFiltersInput,
  type SaleCreateInput,
} from "../../../../core/validations/sales";

const setModalState = setModalStateHelper;

interface SalesPOSProps {
  mode?: "sales" | "order";
  cart?: CartItem[];
  onCartChange?: (cart: CartItem[]) => void;
  onAddProduct?: (product: ProductRow) => void;
  onQuantityChange?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
}

export function SalesPOS({
  mode = "sales",
  cart,
  onCartChange,
  onAddProduct,
  onQuantityChange,
  onRemoveItem,
}: SalesPOSProps) {
  const [state, setState] = useState<SalesState>({
    modal: "idle",

    apis: {
      products: "loading",
      createSale: "idle",
    },

    modals: {
      payment: false,
    },

    buttons: {
      pay: false,
    },

    cart: cart ?? [],

    payment: {
      method: "CASH",
    },

    products: {
      data: [],
      pagination: {
        page: 1,
        perPage: 9,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },

    successMessage: null,
  });

  const showPayButton = mode === "sales";

  const [amountReceivedStr, setAmountReceivedStr] = useState("");

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
    setApiState(setState, "products", "loading");
    setState(prev => ({
      ...prev,
      products: {
        ...prev.products,
        pagination: {
          ...prev.products.pagination,
          page,
        },
      },
    }));

    api.post("/products", {
      ...getFilterValues(),
      page,
      perPage: state.products.pagination.perPage,
    })
      .then(res => {
        setState(prev => ({
          ...prev,
          products: {
            data: res.data.data,
            pagination: res.data.pagination,
          },
        }));
        setApiState(setState, "products", "ok");
      })
      .catch(() => {
        setApiState(setState, "products", "error");
      });
  };

  const cartState = cart ?? state.cart;
  const setCart = (next: CartItem[]) => {
    if (onCartChange) {
      onCartChange(next);
    } else {
      setState(prev => ({ ...prev, cart: next }));
    }
  };

  const addToCart = (product: ProductRow) => {
    if (onAddProduct) {
      onAddProduct(product);
      return;
    }

    const existing = cartState.find(p => p.productId === product.id);
    const productPrice = product.price.amount;

    if (existing) {
      const quantity = Math.min(existing.quantity + 1, product.stock.current);
      setCart(
        cartState.map(i =>
          i.productId === product.id
            ? { ...i, quantity, subtotal: quantity * i.price }
            : i
        )
      );
      return;
    }

    setCart([
      ...cartState,
      {
        productId: product.id,
        name: product.name,
        price: productPrice,
        quantity: 1,
        subtotal: productPrice,
        brand: product.brand,
        brandName: product.brandName,
      },
    ]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    if (onQuantityChange) {
      const existing = cartState.find(item => item.productId === productId);
      if (!existing) return;
      onQuantityChange(productId, Math.max(existing.quantity + delta, 0));
      return;
    }

    setCart(
      cartState
        .map(item => {
          if (item.productId !== productId) return item;
          const quantity = Math.max(item.quantity + delta, 0);
          if (quantity === 0) return null;
          return { ...item, quantity, subtotal: quantity * item.price };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    if (onRemoveItem) {
      onRemoveItem(productId);
      return;
    }

    setCart(cartState.filter(item => item.productId !== productId));
  };

  const summary: TransactionSummary = (() => {
    const subtotal = cartState.reduce((s, i) => s + i.subtotal, 0);
    const tax = subtotal * 0.18;
    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number((subtotal + tax).toFixed(2)),
    };
  })();

  const processSale = async () => {
    if (cartState.length === 0) {
      notifyError({ message: "El carrito está vacío", code: "EMPTY_CART" });
      return;
    }

    setApiState(setState, "createSale", "loading");
    setButtonState(setState, "pay", true);

    const saleData: SaleCreateInput = {
      items: cartState.map(item => ({
        product: {
          id: item.productId,
          name: item.name,
          price: item.price,
          brand: item.brand || "",
          brandName: item.brandName || "",
        },
        quantity: item.quantity,
      })),
      paymentMethod: state.payment.method
    };

    api.post("/transactions", saleData)
      .then((response) => {
        setApiState(setState, "createSale", "ok");
        setButtonState(setState, "pay", false);

        setState(prev => ({
          ...prev,
          cart: [],
          payment: { method: "CASH" },
          successMessage: `Venta registrada: ${response.data.transaction.code}`,
        }));

        setCart([]);
        setAmountReceivedStr("");
        setModalState(setState, "payment", false);

        notifySuccess({
          message: `Venta registrada exitosamente: ${response.data.transaction.code}`,
          code: "SALE_SUCCESS"
        });

        onSearch(state.products.pagination.page);

        setTimeout(() => {
          setState(prev => ({ ...prev, successMessage: null }));
        }, 4000);
      })
      .catch((error) => {
        setApiState(setState, "createSale", "error");
        setButtonState(setState, "pay", false);

        const errorMessage = error.response?.data?.error || "Error al procesar la venta";
        notifyError({ message: errorMessage, code: "SALE_ERROR" });
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

        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold">Venta Directa (POS)</h1>
          <p className="text-sm text-gray-600 hidden sm:block">Selecciona productos para cobrar</p>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className={`${flexWrapGap3} items-end`}>
          <Input
            label="Buscar producto"
            placeholder="Buscar por nombre"
            containerClassName="w-full sm:w-auto sm:flex-1 sm:max-w-xs"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("name")}
          />

          <Input
            label="Marca"
            placeholder="Filtrar por marca"
            containerClassName="w-full sm:w-auto sm:flex-1 sm:max-w-xs"
            labelClassName={formTextStyles.label}
            inputClassName={inputStyles.base}
            {...filterRegister("brand")}
          />

          <div className="flex gap-3 w-full sm:w-auto">
            <button type="submit" className={`${buttonStyles.blue} flex-1 sm:flex-none`}>
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                resetFilters(productFiltersDefaultValues);
                onSearch(1);
              }}
              className={`${buttonStyles.white} flex-1 sm:flex-none`}
            >
              Limpiar
            </button>
          </div>
        </form>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
          <div className="flex-1 lg:flex-[70%] space-y-4">
            {state.apis.products === "loading" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-xl bg-gray-200 animate-pulse p-4 h-[140px]" />
                ))}
              </div>
            ) : state.apis.products === "error" ? (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[140px] gap-2 overflow-y-auto h-[450px]">
                  {state.products.data.map(product => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="cursor-pointer rounded-xl bg-white p-3 border border-gray-200 shadow-sm active:scale-[0.97] active:bg-indigo-50 transition hover:shadow-md h-[140px] flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          SKU: {product.sku}
                        </p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.stock.current}
                        </p>
                      </div>

                      <div className="flex justify-between items-end">
                        <span className="text-sm text-gray-500 truncate">{product.brandName || product.brand}</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {product.price.label}
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

          <div className="flex-1 lg:flex-[30%] flex flex-col gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-3 h-[300px] lg:h-[420px] flex flex-col">
              <h2 className="font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100 text-sm shrink-0">
                Carrito ({cartState.length})
              </h2>

              {cartState.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-gray-400">
                  <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-xs">Carrito vacío</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto flex-1">
                  {cartState.map(item => (
                    <div
                      key={item.productId}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-2"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-800 text-xs line-clamp-1 flex-1">
                          {item.name}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="h-7 w-7 rounded-full bg-gray-200 text-sm hover:bg-gray-300"
                          >
                            ➖
                          </button>
                          <span className="font-semibold text-sm min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="h-7 w-7 rounded-full bg-gray-200 text-sm hover:bg-gray-300"
                          >
                            ➕
                          </button>
                        </div>

                        <span className="font-bold text-gray-800 text-sm">
                          S/. {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal</span>
                <span>S/. {summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>IGV (18%)</span>
                <span>S/. {summary.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg lg:text-xl font-bold text-gray-900 mt-2">
                <span>Total</span>
                <span>S/. {summary.total.toFixed(2)}</span>
              </div>
            </div>

            {showPayButton && (
              <button
                onClick={() => setModalState(setState, "payment", true)}
                disabled={cartState.length === 0 || state.buttons.pay}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] py-4 text-lg font-bold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                PAGAR
              </button>
            )}
          </div>
        </div>
      </div>

      {showPayButton && (
        <Modal open={state.modals.payment} onClose={() => setModalState(setState, "payment", false)}>
            <div className="w-full mx-auto max-w-[480px]">
              <div className={modalStyle}>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Procesar Pago</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Total a pagar: S/. {summary.total.toFixed(2)}</p>
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
                      { label: "Transferencia", value: "TRANSFER" },
                    ]}
                    value={state.payment.method}
                    onChange={value =>
                      setState(prev => ({ ...prev, payment: { ...prev.payment, method: value as SalesState["payment"]["method"] } }))
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
                    disabled={state.apis.createSale === "loading" || state.buttons.pay}
                    className={`${buttonStyles.green} flex items-center justify-center gap-2 ${state.apis.createSale === "loading" || state.buttons.pay ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    {state.apis.createSale === "loading"
                      ? loadingButton("Procesando…", spinnerStyle, buttonBlueLabel)
                      : "Confirmar"}
                  </button>
                </div>
              </div>
            </div>
        </Modal>
      )}

      {state.successMessage && (
        <div className="fixed bottom-4 right-4 rounded-xl bg-emerald-600 text-white px-4 py-3 shadow-lg">
          {state.successMessage}
        </div>
      )}
    </>
  );
}

export default function Sales() {
  return <SalesPOS />;
}
