import type { LoadState } from "../../components/atoms/modal";
import type { Paginated } from "../../components/organisms/Table";

export interface Permission {
  id: string;
  key: string;
  label: string;
  description?: string;
  status: Status;
}

export interface Role {
  id: string;
  name: string;
  permissionKeys: string[];
  status: Status;
}

export interface UserRow {
  id: string;
  paternalSurnames: string;
  maternalSurnames: string;
  names: string;
  email: string;
  role: {
    id: string;
    name: string;
  }[];
  status: {
    id: string;
    name: string;
    color: string;
  };
}

export interface User extends UserRow {}

export type Status = "ACTIVE" | "INACTIVE";

export interface UsersPageState {
  modal: LoadState;
  loadAPI: LoadState;
  activeTab: "users" | "roles" | "permissions";

  modals: {
    userUpsert: boolean;
    roleUpsert: boolean;
    permissionUpsert: boolean;
    delete: boolean;
  };

  deleteTarget: {
    id: string | null;
    type: "user" | "role" | "permission" | null;
  };

  selected: {
    user: User | null;
    role: Role | null;
    permission: Permission | null;
  };

  users: Paginated<UserRow>;
  roles: Paginated<Role>;
  permissions: Paginated<Permission>;
}
