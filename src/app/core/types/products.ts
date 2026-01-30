import type { LoadState } from "../../components/atoms/modal";

export interface ProductRow {
  id: string;
  name: string;
  sku: string;
  brand: string;
  unit: string;
  stock?: {
    current: number;
    minimum: number;
  };
  price: {
    amount: number;
    currency: string;
    label: string;
  };
  status?: {
    key: string;
    label: string;
    color: string;
  };
  categoryName?: string;
  brandName?: string;
  unitName?: string;
}

export interface AsyncSelectItem {
  label: string;
  value: string;
}

export interface ProductsState {
  modal: LoadState;

  apis: {
    detail: LoadState;
    upsert: LoadState;
    delete: LoadState;
    pagination: LoadState;
    import: LoadState;
    template: LoadState;
  };

  modals: {
    upsert: boolean;
    delete: boolean;
    quickBatch: boolean;
    import: boolean;
  };

  buttons: {
    template: boolean;
    upsert: boolean;
    delete: boolean;
    import: boolean;
  };

  selections: {
    productRow: ProductRow | null;
    productDelete: ProductRow | null;
  };

  asyncSelections: {
    categories: {
      items: AsyncSelectItem[];
      loading: LoadState;
    };
    brands: {
      items: AsyncSelectItem[];
      loading: LoadState;
    };
    units: {
      items: AsyncSelectItem[];
      loading: LoadState;
    };
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

  importResult: {
    summary: {
      total: number;
      created: number;
      updated: number;
      errors: number;
    } | null;
    errors: Array<{
      row: number;
      product: string;
      error: string;
    }>;
  };
}
