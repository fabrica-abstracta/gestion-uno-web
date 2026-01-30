import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../core/config/axios";
import Breadcrumb from "../../molecules/breadcrumb";
import Modal from "../../atoms/modal";
import Input from "../../atoms/input";
import Select from "../../atoms/select";
import Textarea from "../../atoms/textarea";
import Tabs, { type TabItem } from "../../molecules/tabs";
import {
  buttonStyles,
  containerStyle,
  flexColGap2,
  flexJustifyEndGap3,
  flexWrapGap3,
  formTextStyles,
  inputStyles,
  modalStyle,
  spinnerStyle,
  buttonBlueLabel,
} from "../../../core/helpers/styles";
import { loadingButton, setModalState as setModalStateHelper } from "../../../core/helpers/shared";
import { icons } from "../../../core/helpers/icons";

// Import types and validations
import type {
  UsersPageState,
  UserRow,
  Role,
  Permission,
} from "../../../core/types/users";
import {
  userUpsertSchema,
  userFiltersSchema,
  userFiltersDefaultValues,
  userUpsertDefaultValues,
  roleUpsertSchema,
  roleFiltersSchema,
  roleFiltersDefaultValues,
  roleUpsertDefaultValues,
  permissionUpsertSchema,
  permissionFiltersSchema,
  permissionFiltersDefaultValues,
  permissionUpsertDefaultValues,
  type UserUpsertInput,
  type UserFiltersInput,
  type RoleUpsertInput,
  type RoleFiltersInput,
  type PermissionUpsertInput,
  type PermissionFiltersInput,
} from "../../../core/validations/users";
import Table from "../../organisms/table";

const setModalState = setModalStateHelper;

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case "ACTIVE":
    case "active":
      return "bg-green-100 text-green-800";
    case "INACTIVE":
    case "inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Users() {
  const [state, setState] = useState<UsersPageState>({
    modal: "idle",
    loadAPI: "idle",
    activeTab: "users",

    modals: {
      userUpsert: false,
      roleUpsert: false,
      permissionUpsert: false,
      delete: false,
    },

    deleteTarget: {
      id: null,
      type: null,
    },

    selected: {
      user: null,
      role: null,
      permission: null,
    },

    users: {
      load: "loading",
      data: [],
      pagination: {
        page: 1,
        perPage: 10,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },

    roles: {
      load: "loading",
      data: [],
      pagination: {
        page: 1,
        perPage: 10,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },

    permissions: {
      load: "loading",
      data: [],
      pagination: {
        page: 1,
        perPage: 10,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
  });

  // User form
  const {
    register: userFilterRegister,
    getValues: getUserFilterValues,
    handleSubmit: handleUserFilterSubmit,
    reset: resetUserFilters,
  } = useForm<UserFiltersInput>({
    resolver: zodResolver(userFiltersSchema),
    defaultValues: userFiltersDefaultValues,
  });

  const {
    register: userUpsertRegister,
    handleSubmit: handleUserUpsertSubmit,
    reset: resetUserUpsert,
    setValue: setUserValue,
    watch: watchUser,
    formState: { isValid: isUserValid },
  } = useForm<UserUpsertInput>({
    resolver: zodResolver(userUpsertSchema),
    defaultValues: userUpsertDefaultValues,
    mode: "onChange",
  });

  // Role form
  const {
    register: roleFilterRegister,
    getValues: getRoleFilterValues,
    handleSubmit: handleRoleFilterSubmit,
    reset: resetRoleFilters,
  } = useForm<RoleFiltersInput>({
    resolver: zodResolver(roleFiltersSchema),
    defaultValues: roleFiltersDefaultValues,
  });

  const {
    register: roleUpsertRegister,
    handleSubmit: handleRoleUpsertSubmit,
    reset: resetRoleUpsert,
    setValue: setRoleValue,
    watch: watchRole,
    formState: { isValid: isRoleValid },
  } = useForm<RoleUpsertInput>({
    resolver: zodResolver(roleUpsertSchema),
    defaultValues: roleUpsertDefaultValues,
    mode: "onChange",
  });

  // Permission form
  const {
    register: permissionFilterRegister,
    getValues: getPermissionFilterValues,
    handleSubmit: handlePermissionFilterSubmit,
    reset: resetPermissionFilters,
  } = useForm<PermissionFiltersInput>({
    resolver: zodResolver(permissionFiltersSchema),
    defaultValues: permissionFiltersDefaultValues,
  });

  const {
    register: permissionUpsertRegister,
    handleSubmit: handlePermissionUpsertSubmit,
    reset: resetPermissionUpsert,
    formState: { isValid: isPermissionValid },
  } = useForm<PermissionUpsertInput>({
    resolver: zodResolver(permissionUpsertSchema),
    defaultValues: permissionUpsertDefaultValues,
    mode: "onChange",
  });

  // API functions
  const fetchUsers = (page: number) => {
    const filters = getUserFilterValues();

    setState((prev) => ({
      ...prev,
      users: {
        ...prev.users,
        load: "loading",
        pagination: {
          ...prev.users.pagination,
          page,
        },
      },
    }));

    api
      .post("/users", {
        ...filters,
        page,
        perPage: state.users.pagination.perPage,
      })
      .then((res) => {
        const result = res.data;
        setState((prev) => ({
          ...prev,
          users: {
            load: "ok",
            data: result.data,
            pagination: result.pagination,
          },
        }));
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          users: {
            ...prev.users,
            load: "error",
          },
        }));
      });
  };

  const fetchRoles = (page: number) => {
    const filters = getRoleFilterValues();

    setState((prev) => ({
      ...prev,
      roles: {
        ...prev.roles,
        load: "loading",
        pagination: {
          ...prev.roles.pagination,
          page,
        },
      },
    }));

    api
      .post("/roles", {
        ...filters,
        page,
        perPage: state.roles.pagination.perPage,
      })
      .then((res) => {
        const result = res.data;
        setState((prev) => ({
          ...prev,
          roles: {
            load: "ok",
            data: result.data,
            pagination: result.pagination,
          },
        }));
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          roles: {
            ...prev.roles,
            load: "error",
          },
        }));
      });
  };

  const fetchPermissions = (page: number) => {
    const filters = getPermissionFilterValues();

    setState((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        load: "loading",
        pagination: {
          ...prev.permissions.pagination,
          page,
        },
      },
    }));

    api
      .post("/permissions", {
        ...filters,
        page,
        perPage: state.permissions.pagination.perPage,
      })
      .then((res) => {
        const result = res.data;
        setState((prev) => ({
          ...prev,
          permissions: {
            load: "ok",
            data: result.data,
            pagination: result.pagination,
          },
        }));
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            load: "error",
          },
        }));
      });
  };

  const togglePermissionInRole = (permKey: string) => {
    const current = watchRole("permissionKeys");
    if (current.includes(permKey)) {
      setRoleValue(
        "permissionKeys",
        current.filter((k) => k !== permKey)
      );
    } else {
      setRoleValue("permissionKeys", [...current, permKey]);
    }
  };

  useEffect(() => {
    document.title = "Gestión Uno - Control de Acceso";
    fetchUsers(1);
    fetchRoles(1);
    fetchPermissions(1);
  }, []);

  const tabItems: TabItem[] = [
    {
      id: "users",
      label: "Usuarios",
      content: (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Usuarios</h2>
            <button
              onClick={() => {
                resetUserUpsert(userUpsertDefaultValues);
                setState((prev) => ({
                  ...prev,
                  selected: { ...prev.selected, user: null },
                }));
                setModalState(setState, "userUpsert", true);
              }}
              className={buttonStyles.green}
            >
              + Agregar Usuario
            </button>
          </div>

          <form
            onSubmit={handleUserFilterSubmit(() => fetchUsers(1))}
            className={`${flexWrapGap3} items-end`}
          >
            <Input
              label="Nombres"
              placeholder="Buscar por nombres"
              containerClassName="w-full md:w-64"
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...userFilterRegister("names")}
            />

            <Select
              label="Estado"
              placeholder="Todos"
              containerClassName="w-full md:w-48"
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              options={[
                { label: "Todos", value: "" },
                { label: "Activo", value: "ACTIVE" },
                { label: "Inactivo", value: "INACTIVE" },
              ]}
              // {...userFilterRegister("status")} TODO
            />

            <button type="submit" className={buttonStyles.blue}>
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                resetUserFilters(userFiltersDefaultValues);
                fetchUsers(1);
              }}
              className={buttonStyles.white}
            >
              Limpiar
            </button>
          </form>

          <Table
            heightClass="h-96"
            data={state.users.data}
            load={state.users.load}
            columns={usersColumns(setState, resetUserUpsert)}
            pagination={state.users.pagination}
            onPageChange={(page) => fetchUsers(page)}
            loadingNode={<LoadingNode message="Cargando usuarios..." />}
            emptyNode={<EmptyNode message="No hay usuarios" />}
            errorNode={
              <ErrorNode
                message="Error al cargar usuarios"
                onRetry={() => fetchUsers(state.users.pagination.page)}
              />
            }
          />
        </div>
      ),
    },
    {
      id: "roles",
      label: "Roles",
      content: (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Roles</h2>
            <button
              onClick={() => {
                resetRoleUpsert(roleUpsertDefaultValues);
                setState((prev) => ({
                  ...prev,
                  selected: { ...prev.selected, role: null },
                }));
                setModalState(setState, "roleUpsert", true);
              }}
              className={buttonStyles.green}
            >
              + Agregar Rol
            </button>
          </div>

          <form
            onSubmit={handleRoleFilterSubmit(() => fetchRoles(1))}
            className={`${flexWrapGap3} items-end`}
          >
            <Input
              label="Nombre"
              placeholder="Buscar por nombre"
              containerClassName="w-full md:w-64"
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...roleFilterRegister("name")}
            />

            <button type="submit" className={buttonStyles.blue}>
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                resetRoleFilters(roleFiltersDefaultValues);
                fetchRoles(1);
              }}
              className={buttonStyles.white}
            >
              Limpiar
            </button>
          </form>

          <Table
            heightClass="h-96"
            data={state.roles.data}
            load={state.roles.load}
            columns={rolesColumns(setState, resetRoleUpsert)}
            pagination={state.roles.pagination}
            onPageChange={(page) => fetchRoles(page)}
            loadingNode={<LoadingNode message="Cargando roles..." />}
            emptyNode={<EmptyNode message="No hay roles" />}
            errorNode={
              <ErrorNode
                message="Error al cargar roles"
                onRetry={() => fetchRoles(state.roles.pagination.page)}
              />
            }
          />
        </div>
      ),
    },
    {
      id: "permissions",
      label: "Permisos",
      content: (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Permisos</h2>
            <button
              onClick={() => {
                resetPermissionUpsert(permissionUpsertDefaultValues);
                setState((prev) => ({
                  ...prev,
                  selected: { ...prev.selected, permission: null },
                }));
                setModalState(setState, "permissionUpsert", true);
              }}
              className={buttonStyles.green}
            >
              + Agregar Permiso
            </button>
          </div>

          <form
            onSubmit={handlePermissionFilterSubmit(() => fetchPermissions(1))}
            className={`${flexWrapGap3} items-end`}
          >
            <Input
              label="Llave"
              placeholder="Buscar por llave"
              containerClassName="w-full md:w-64"
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...permissionFilterRegister("key")}
            />

            <Input
              label="Etiqueta"
              placeholder="Buscar por etiqueta"
              containerClassName="w-full md:w-64"
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...permissionFilterRegister("label")}
            />

            <button type="submit" className={buttonStyles.blue}>
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                resetPermissionFilters(permissionFiltersDefaultValues);
                fetchPermissions(1);
              }}
              className={buttonStyles.white}
            >
              Limpiar
            </button>
          </form>

          <Table
            heightClass="h-96"
            data={state.permissions.data}
            load={state.permissions.load}
            columns={permissionsColumns(setState, resetPermissionUpsert)}
            pagination={state.permissions.pagination}
            onPageChange={(page) => fetchPermissions(page)}
            loadingNode={<LoadingNode message="Cargando permisos..." />}
            emptyNode={<EmptyNode message="No hay permisos" />}
            errorNode={
              <ErrorNode
                message="Error al cargar permisos"
                onRetry={() => fetchPermissions(state.permissions.pagination.page)}
              />
            }
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb
          items={[{ label: "Inicio", to: "/" }, { label: "Control de Acceso" }]}
        />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Control de Acceso</h1>
          <p className="text-gray-600">Gestiona usuarios, roles y permisos</p>
        </div>

        <Tabs
          items={tabItems}
          activeId={state.activeTab}
          orientation="horizontal"
        />
      </div>

      {/* User Upsert Modal */}
      <Modal
        open={state.modals.userUpsert}
        load={state.modal}
        onRetry={() => {
          const id = state.selected.user?.id;
          if (!id) return;

          setModalState(setState, "userUpsert", true, "loading");

          api
            .get(`/users/${id}`)
            .then((res) => {
              const user = res.data;
              resetUserUpsert({
                paternalSurnames: user.paternalSurnames,
                maternalSurnames: user.maternalSurnames,
                names: user.names,
                email: user.email,
                role: user.role,
              });
              setModalState(setState, "userUpsert", true, "ok");
            })
            .catch(() => {
              setModalState(setState, "userUpsert", true, "error");
            });
        }}
        onClose={() => {
          setModalState(setState, "userUpsert", false);
          setState((prev) => ({
            ...prev,
            selected: { ...prev.selected, user: null },
          }));
        }}
      >
        <form
          onSubmit={handleUserUpsertSubmit(async (data) => {
            setState((prev) => ({ ...prev, loadAPI: "loading" }));
            api
              .post("/users-upsert", {
                ...data,
                ...(state.selected.user?.id ? { id: state.selected.user.id } : {}),
              })
              .then(() => {
                fetchUsers(state.users.pagination.page);
                resetUserUpsert(userUpsertDefaultValues);
                setState((prev) => ({
                  ...prev,
                  loadAPI: "idle",
                  selected: { ...prev.selected, user: null },
                }));
                setModalState(setState, "userUpsert", false);
              })
              .catch(() => {
                setState((prev) => ({ ...prev, loadAPI: "error" }));
              });
          })}
          className={`mx-auto max-w-[720px] ${modalStyle}`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selected.user ? "Editar Usuario" : "Crear Usuario"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selected.user
                ? "Modifica la información del usuario."
                : "Completa los datos del nuevo usuario."}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input
              label="Apellido Paterno"
              placeholder="Ingrese apellido paterno"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...userUpsertRegister("paternalSurnames")}
            />

            <Input
              label="Apellido Materno"
              placeholder="Ingrese apellido materno"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...userUpsertRegister("maternalSurnames")}
            />

            <Input
              label="Nombres"
              placeholder="Ingrese nombres"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...userUpsertRegister("names")}
            />

            <Input
              label="Email"
              placeholder="usuario@ejemplo.com"
              type="email"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...userUpsertRegister("email")}
            />

            <div className={flexColGap2}>
              <label className={formTextStyles.label}>Rol</label>
              <Select
                placeholder="Seleccione rol"
                inputClassName={inputStyles.base}
                options={state.roles.data.map((role) => ({
                  label: role.name,
                  value: role.id,
                }))}
                value={watchUser("role")?.[0]?.id || ""}
                onChange={(value) =>
                  setUserValue("role", [{ id: value }])
                }
              />
            </div>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, "userUpsert", false)}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isUserValid || state.loadAPI === "loading"}
              className={`${buttonStyles.blue} flex items-center justify-center gap-2 ${
                !isUserValid || state.loadAPI === "loading"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {state.loadAPI === "loading"
                ? loadingButton("Guardando…", spinnerStyle, buttonBlueLabel)
                : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Role Upsert Modal */}
      <Modal
        open={state.modals.roleUpsert}
        load={state.modal}
        onClose={() => {
          setModalState(setState, "roleUpsert", false);
          setState((prev) => ({
            ...prev,
            selected: { ...prev.selected, role: null },
          }));
        }}
      >
        <form
          onSubmit={handleRoleUpsertSubmit(async (data) => {
            setState((prev) => ({ ...prev, loadAPI: "loading" }));
            api
              .post("/upsert-roles", {
                ...data,
                ...(state.selected.role?.id ? { id: state.selected.role.id } : {}),
              })
              .then(() => {
                fetchRoles(state.roles.pagination.page);
                resetRoleUpsert(roleUpsertDefaultValues);
                setState((prev) => ({
                  ...prev,
                  loadAPI: "idle",
                  selected: { ...prev.selected, role: null },
                }));
                setModalState(setState, "roleUpsert", false);
              })
              .catch(() => {
                setState((prev) => ({ ...prev, loadAPI: "error" }));
              });
          })}
          className={`mx-auto max-w-[720px] ${modalStyle}`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selected.role ? "Editar Rol" : "Crear Rol"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selected.role
                ? "Modifica la información del rol."
                : "Completa los datos del nuevo rol."}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input
              label="Nombre"
              placeholder="Ej: Administrador"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...roleUpsertRegister("name")}
            />

            <div className={flexColGap2}>
              <label className={formTextStyles.label}>Permisos</label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {state.permissions.data.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={watchRole("permissionKeys").includes(perm.key)}
                      onChange={() => togglePermissionInRole(perm.key)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, "roleUpsert", false)}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isRoleValid || state.loadAPI === "loading"}
              className={`${buttonStyles.blue} flex items-center justify-center gap-2 ${
                !isRoleValid || state.loadAPI === "loading"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {state.loadAPI === "loading"
                ? loadingButton("Guardando…", spinnerStyle, buttonBlueLabel)
                : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Permission Upsert Modal */}
      <Modal
        open={state.modals.permissionUpsert}
        load={state.modal}
        onClose={() => {
          setModalState(setState, "permissionUpsert", false);
          setState((prev) => ({
            ...prev,
            selected: { ...prev.selected, permission: null },
          }));
        }}
      >
        <form
          onSubmit={handlePermissionUpsertSubmit(async (data) => {
            setState((prev) => ({ ...prev, loadAPI: "loading" }));
            api
              .post("/upsert-permissions", {
                ...data,
                ...(state.selected.permission?.id
                  ? { id: state.selected.permission.id }
                  : {}),
              })
              .then(() => {
                fetchPermissions(state.permissions.pagination.page);
                resetPermissionUpsert(permissionUpsertDefaultValues);
                setState((prev) => ({
                  ...prev,
                  loadAPI: "idle",
                  selected: { ...prev.selected, permission: null },
                }));
                setModalState(setState, "permissionUpsert", false);
              })
              .catch(() => {
                setState((prev) => ({ ...prev, loadAPI: "error" }));
              });
          })}
          className={`mx-auto max-w-[720px] ${modalStyle}`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selected.permission ? "Editar Permiso" : "Crear Permiso"}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selected.permission
                ? "Modifica la información del permiso."
                : "Completa los datos del nuevo permiso."}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input
              label="Llave"
              placeholder="Ej: VIEW_USERS"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              helperText="Solo mayúsculas y guiones bajos"
              helperClassName={formTextStyles.helper}
              {...permissionUpsertRegister("key")}
            />

            <Input
              label="Etiqueta"
              placeholder="Ej: Ver Usuarios"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              inputClassName={inputStyles.base}
              {...permissionUpsertRegister("label")}
            />

            <Textarea
              label="Descripción"
              placeholder="Descripción del permiso (opcional)"
              containerClassName={flexColGap2}
              labelClassName={formTextStyles.label}
              textareaClassName={inputStyles.base}
              {...permissionUpsertRegister("description")}
            />
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, "permissionUpsert", false)}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!isPermissionValid || state.loadAPI === "loading"}
              className={`${buttonStyles.blue} flex items-center justify-center gap-2 ${
                !isPermissionValid || state.loadAPI === "loading"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {state.loadAPI === "loading"
                ? loadingButton("Guardando…", spinnerStyle, buttonBlueLabel)
                : "Guardar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        load={state.modal}
        open={state.modals.delete}
        onClose={() => setModalState(setState, "delete", false)}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar {state.deleteTarget.type}</h2>
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede
              deshacer.
            </p>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, "delete", false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={state.loadAPI === "loading"}
              className={`${buttonStyles.red} flex items-center justify-center gap-2 ${
                state.loadAPI === "loading" ? "opacity-80 cursor-not-allowed" : ""
              }`}
              onClick={() => {
                if (!state.deleteTarget.id || !state.deleteTarget.type) return;

                setState((prev) => ({ ...prev, loadAPI: "loading" }));

                const { id, type } = state.deleteTarget;
                const endpoint = {
                  user: `/users/${id}`,
                  role: `/roles/${id}`,
                  permission: `/permissions/${id}`,
                }[type];

                api
                  .delete(endpoint)
                  .then(() => {
                    if (type === "user") fetchUsers(state.users.pagination.page);
                    if (type === "role") fetchRoles(state.roles.pagination.page);
                    if (type === "permission")
                      fetchPermissions(state.permissions.pagination.page);

                    setModalState(setState, "delete", false);
                    setState((prev) => ({
                      ...prev,
                      loadAPI: "idle",
                      deleteTarget: { id: null, type: null },
                    }));
                  })
                  .catch(() => {
                    setState((prev) => ({ ...prev, loadAPI: "error" }));
                  });
              }}
            >
              {state.loadAPI === "loading"
                ? loadingButton("Eliminando…", spinnerStyle, buttonBlueLabel)
                : "Eliminar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// Columns definitions
const usersColumns = (
  setState: React.Dispatch<React.SetStateAction<UsersPageState>>,
  resetUserUpsert: UseFormReturn<UserUpsertInput>["reset"]
) => [
  {
    key: "names",
    header: "Nombre Completo",
    render: (row: UserRow) => (
      <div className="flex flex-col gap-1">
        <p className="font-semibold">
          {row.paternalSurnames} {row.maternalSurnames}, {row.names}
        </p>
        <p className="text-xs text-gray-500">{row.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    header: "Rol",
    render: (row: UserRow) => (
      <span className="text-sm text-gray-700">
        {row.role.map((r) => r.name).join(", ")}
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    render: (row: UserRow) => (
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadgeColor(
          row.status.id
        )}`}
      >
        {row.status.name}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Acciones",
    headerClassName: "text-right",
    render: (row: UserRow) => (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={buttonStyles.base}
          onClick={() => {
            setState((prev) => ({
              ...prev,
              selected: { ...prev.selected, user: row },
            }));
            setModalState(setState, "userUpsert", true, "loading");

            api
              .get(`/users/${row.id}`)
              .then((res) => {
                const user = res.data;
                resetUserUpsert({
                  paternalSurnames: user.paternalSurnames,
                  maternalSurnames: user.maternalSurnames,
                  names: user.names,
                  email: user.email,
                  role: user.role,
                });
                setModalState(setState, "userUpsert", true, "ok");
              })
              .catch(() => {
                setModalState(setState, "userUpsert", true, "error");
              });
          }}
        >
          {icons.edit}
        </button>

        <button
          type="button"
          onClick={() => {
            setState((prev) => ({
              ...prev,
              deleteTarget: { id: row.id, type: "user" },
            }));
            setModalState(setState, "delete", true);
          }}
          className={buttonStyles.base}
        >
          {icons.delete}
        </button>
      </div>
    ),
  },
];

const rolesColumns = (
  setState: React.Dispatch<React.SetStateAction<UsersPageState>>,
  resetRoleUpsert: UseFormReturn<RoleUpsertInput>["reset"]
) => [
  {
    key: "name",
    header: "Nombre",
    render: (row: Role) => <span className="font-semibold">{row.name}</span>,
  },
  {
    key: "permissions",
    header: "Permisos",
    render: (row: Role) => (
      <span className="text-sm text-gray-700">
        {row.permissionKeys.length} permisos
      </span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    render: (row: Role) => (
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadgeColor(
          row.status
        )}`}
      >
        {row.status === "ACTIVE" ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Acciones",
    headerClassName: "text-right",
    render: (row: Role) => (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={buttonStyles.base}
          onClick={() => {
            setState((prev) => ({
              ...prev,
              selected: { ...prev.selected, role: row },
            }));
            resetRoleUpsert({
              name: row.name,
              permissionKeys: row.permissionKeys,
            });
            setModalState(setState, "roleUpsert", true);
          }}
        >
          {icons.edit}
        </button>

        <button
          type="button"
          onClick={() => {
            setState((prev) => ({
              ...prev,
              deleteTarget: { id: row.id, type: "role" },
            }));
            setModalState(setState, "delete", true);
          }}
          className={buttonStyles.base}
        >
          {icons.delete}
        </button>
      </div>
    ),
  },
];

const permissionsColumns = (
  setState: React.Dispatch<React.SetStateAction<UsersPageState>>,
  resetPermissionUpsert: UseFormReturn<PermissionUpsertInput>["reset"]
) => [
  {
    key: "key",
    header: "Llave",
    render: (row: Permission) => (
      <span className="font-mono text-sm font-semibold">{row.key}</span>
    ),
  },
  {
    key: "label",
    header: "Etiqueta",
    render: (row: Permission) => (
      <span className="text-sm text-gray-700">{row.label}</span>
    ),
  },
  {
    key: "status",
    header: "Estado",
    render: (row: Permission) => (
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadgeColor(
          row.status
        )}`}
      >
        {row.status === "ACTIVE" ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Acciones",
    headerClassName: "text-right",
    render: (row: Permission) => (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className={buttonStyles.base}
          onClick={() => {
            setState((prev) => ({
              ...prev,
              selected: { ...prev.selected, permission: row },
            }));
            resetPermissionUpsert({
              key: row.key,
              label: row.label,
              description: row.description || "",
            });
            setModalState(setState, "permissionUpsert", true);
          }}
        >
          {icons.edit}
        </button>

        <button
          type="button"
          onClick={() => {
            setState((prev) => ({
              ...prev,
              deleteTarget: { id: row.id, type: "permission" },
            }));
            setModalState(setState, "delete", true);
          }}
          className={buttonStyles.base}
        >
          {icons.delete}
        </button>
      </div>
    ),
  },
];

// Loading/Empty/Error nodes
function LoadingNode({ message }: { message: string }) {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

function EmptyNode({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-gray-900">{message}</p>
        <p className="text-sm text-gray-500 mt-1">Crea el primero para comenzar</p>
      </div>
    </div>
  );
}

function ErrorNode({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <svg
          className="w-16 h-16 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-medium text-s text-gray-900">{message}</p>
        <p className="text-sm text-gray-500 mt-1">No se pudieron cargar los datos</p>
      </div>
      <button className={buttonStyles.blue} onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}
