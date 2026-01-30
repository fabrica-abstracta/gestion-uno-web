import type { LoadState } from "../../components/atoms/modal";

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  salePrice?: number;
}

export interface OrderItem {
  _id?: string;
  product: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  status: "pending" | "dispatched" | "cancelled";
}

export interface Order {
  _id: string;
  code: string;
  status: "draft" | "pending" | "processing" | "completed" | "cancelled";
  items: OrderItem[];
  customer?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  deliveryDate?: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface OrderCard {
  _id: string;
  code: string;
  status: "draft" | "pending" | "processing" | "completed" | "cancelled";
  customerName?: string;
  totalAmount: number;
  itemsCount: number;
  itemsPending: number;
  itemsDispatched: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersPageState {
  modal: LoadState;
  loadAPI: LoadState;

  orders: {
    load: LoadState;
    data: OrderCard[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };

  filters: {
    code?: string;
    status?: string;
    customerName?: string;
  };
}

export interface OrderDetailState {
  modal: LoadState;
  loadAPI: LoadState;
  order: Order | null;
  products: Product[];
  
  modals: {
    addItem: { open: boolean; load: LoadState };
    editItem: { open: boolean; load: LoadState };
    deleteItem: { open: boolean; load: LoadState };
    changeStatus: { open: boolean; load: LoadState };
  };

  selectedItem: OrderItem | null;
}
