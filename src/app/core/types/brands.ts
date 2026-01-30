import type { LoadState } from "../../components/atoms/modal";

export interface BrandRow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isEditable: boolean;
  isDeletable: boolean;
  productsCount: number;
  createdAt: string | null;
}

export interface BrandsState {
  modal: LoadState;

  apis: {
    detail: LoadState;
    upsert: LoadState;
    delete: LoadState;
    pagination: LoadState;
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
    brandRow: BrandRow | null;
    brandDelete: BrandRow | null;
  };

  brands: {
    data: BrandRow[];
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
