import type { LoadState } from "../../components/atoms/modal";
import type { Paginated } from "../../components/organisms/table";

export interface InventorySummary {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface StockAlert {
  id: string;
  product: string;
  currentStock: number;
  minStock: number;
  category: string;
}

export interface TopProduct {
  id: string;
  product: string;
  brand: string;
  category: string;
  totalSold: number;
  revenue: number;
}

export interface InventoryPageState {
  modal: LoadState;

  apis: {
    summary: LoadState;
    stockAlerts: LoadState;
    topProducts: LoadState;
  };

  modals: {
    settings: boolean;
  };

  buttons: Record<string, boolean>;

  refreshInterval: number;

  summary: InventorySummary;
  stockAlerts: Paginated<StockAlert>;
  topProducts: Paginated<TopProduct>;
}
