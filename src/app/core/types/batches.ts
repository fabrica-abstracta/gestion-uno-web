import type { LoadState } from "../../components/atoms/modal";

export interface BatchRow {
  id: string;
  code: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  expiresAt: string | null;
  stock: number;
  status: {
    key: string;
    label: string;
    color: string;
  };
  createdAt: string;
}

export interface BatchesState {
  modal: LoadState;

  apis: {
    detail: LoadState;
    upsert: LoadState;
    delete: LoadState;
    productDetail: LoadState;
  };

  modals: {
    upsert: boolean;
    delete: boolean;
  };

  buttons: {
    upsert: boolean;
    delete: boolean;
  };

  selections: {
    batch: BatchRow | null;
    batchDelete: BatchRow | null;
    action: "increment" | "decrement";
  };

  batches: {
    load: LoadState;
    data: BatchRow[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };

  productInfo: {
    id: string;
    name: string;
    sku: string;
    stock: {
      current: number;
      minimum: number;
    };
    status: {
      label: string;
      color: string;
    };
  };
}
