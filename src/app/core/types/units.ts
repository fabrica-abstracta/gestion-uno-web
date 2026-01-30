import type { LoadState } from "../../components/atoms/modal";

export interface UnitRow {
  id: string;
  name: string;
  symbol: string;
  dimension: string;
  base: {
    id: string;
    name: string;
    symbol: string;
  } | null;
  toBaseFactor: number;
  isActive: boolean;
  isEditable: boolean;
  isDeletable: boolean;
  productsCount: number;
  createdAt: string | null;
}

export interface AsyncSelectItem {
  label: string;
  value: string;
}

export interface UnitsState {
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
    unitRow: UnitRow | null;
    unitDelete: UnitRow | null;
  };

  asyncSelections: {
    units: {
      items: AsyncSelectItem[];
      loading: LoadState;
    };
  };

  units: {
    data: UnitRow[];
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
