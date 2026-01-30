import type { LoadState } from "../../components/atoms/modal";

export interface CategoryRow {
  id: string;
  name: string;
  description: string;
  parent: {
    id: string;
    name: string;
  } | null;
  isActive: boolean;
  isEditable: boolean;
  isDeletable: boolean;
  productsCount: number;
  subCategoriesCount: number;
  createdAt: string | null;
}

export interface AsyncSelectItem {
  label: string;
  value: string;
}

export interface CategoriesState {
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
    categoryRow: CategoryRow | null;
    categoryDelete: CategoryRow | null;
  };

  asyncSelections: {
    categories: {
      items: AsyncSelectItem[];
      loading: LoadState;
    };
  };

  categories: {
    data: CategoryRow[];
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
