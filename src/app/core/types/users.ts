import type { LoadState } from "../../components/atoms/modal";

export interface RoleRow {
  id: string;
  code: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  status: string;
  inUse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRow {
  id: string;
  documentType?: string;
  documentNumber: string;
  paternalSurnames?: string;
  maternalSurnames?: string;
  names: string;
  email: string;
  phone?: string;
  username: string;
  role: string;
  roleName: string;
  status: string;
  inUse: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  code: string;
  name: string;
  icon: string;
  pages: ModulePage[];
}

export interface ModulePage {
  code: string;
  name: string;
  path: string;
  permissions: string[];
}

export interface ModulesData {
  modules: Module[];
  permissionTypes: PermissionType[];
}

export interface PermissionType {
  code: string;
  name: string;
  description: string;
}

export interface UsersPageState {
  modal: LoadState;

  apis: {
    detail: LoadState;
    upsert: LoadState;
    delete: LoadState;
    pagination: LoadState;
    modules: LoadState;
  };

  modals: {
    userUpsert: boolean;
    roleUpsert: boolean;
    delete: boolean;
  };

  buttons: {
    upsert: boolean;
    delete: boolean;
  };

  selections: {
    userRow: UserRow | null;
    roleRow: RoleRow | null;
    userDelete: UserRow | null;
    roleDelete: RoleRow | null;
  };

  asyncSelections: {
    roles: {
      items: Array<{ value: string; label: string }>;
      loading: LoadState;
    };
  };

  users: {
    data: UserRow[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };

  roles: {
    data: RoleRow[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };

  modules: ModulesData | null;
}
