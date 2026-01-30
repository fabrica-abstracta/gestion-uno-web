import type { LoadState } from "../../components/atoms/modal";

export interface ProductRow {
  id: string;
  name: string;
  sku: string;
  brand: string;
  brandName?: string;
  stock: {
    current: number;
    minimum: number;
  };
  price: {
    amount: number;
    currency: string;
    label: string;
  };
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  brand?: string;
  brandName?: string;
}

export interface TransactionSummary {
  subtotal: number;
  tax: number;
  total: number;
}

export interface SalesState {
  modal: LoadState;

  apis: {
    products: LoadState;
    createSale: LoadState;
  };

  modals: {
    payment: boolean;
  };

  buttons: {
    pay: boolean;
  };

  cart: CartItem[];

  payment: {
    method: "CASH" | "YAPE" | "PLIN" | "CARD" | "TRANSFER" | "CREDIT" | "OTHER";
    reference?: string;
    amountReceived?: number;
  };

  products: {
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

  successMessage: string | null;
}
