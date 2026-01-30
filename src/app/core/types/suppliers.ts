import type { LoadState } from "../../components/atoms/modal";
import type { Paginated } from "../../components/organisms/table";

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRow {
  id: string;
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  isSystem: boolean;
}

export interface SuppliersPageState {
  modal: LoadState;
  loadAPI: LoadState;

  suppliers: {
    load: LoadState;
    data: SupplierRow[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };

  modals: {
    upsert: boolean;
    delete: boolean;
  };

  selectedSupplier: SupplierRow | null;
  filters: {
    name?: string;
    isActive?: boolean;
  };
}
