import type { LoadState } from "../../components/atoms/modal";

export interface MovementRow {
  id: string;
  batch: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  type: "increment" | "decrement";
  quantity: number;
  reason: string;
  date: string;
  createdAt: string;
}

export interface MovementsState {
  modal: LoadState;

  apis: {
    pagination: LoadState;
  };

  modals: {};

  buttons: {};

  selections: {
    movement: MovementRow | null;
  };

  movements: {
    data: MovementRow[];
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
