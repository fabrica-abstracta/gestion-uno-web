import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../../../core/config/axios';
import Modal from '../../../atoms/modal';
import Input from '../../../atoms/input';
import LoadingButton from '../../../atoms/loading-button';
import Badge from '../../../atoms/badge';
import Select from '../../../atoms/select';
import AsyncSelect from '../../../atoms/async-select';
import PermissionSelector from '../../../organisms/permission-selector';
import Table from '../../../organisms/table';
import Tabs from '../../../molecules/tabs';
import Breadcrumb from '../../../molecules/breadcrumb';
import {
  setModalState,
  setApiState,
  setButtonState,
  setSelectionState,
  setTableState,
  TableLoadingNode,
  TableEmptyNode,
  TableErrorNode,
  notifySuccess,
  notifyError,
} from '../../../../core/helpers/shared';
import {
  buttonStyles,
  flexColGap2,
  flexJustifyEndGap3,
  flexWrapGap3,
  modalStyle,
  containerStyle,
} from '../../../../core/helpers/styles';
import { icons } from '../../../../core/helpers/icons';
import {
  userFiltersDefaultValues,
  userFiltersSchema,
  userUpsertDefaultValues,
  userUpsertSchema,
  roleFiltersDefaultValues,
  roleFiltersSchema,
  roleUpsertDefaultValues,
  roleUpsertSchema,
  type UserFiltersInput,
  type UserUpsertInput,
  type RoleFiltersInput,
  type RoleUpsertInput,
} from '../../../../core/validations/users';
import type {
  UsersPageState,
  ModulesData,
} from '../../../../core/types/users';

export default function Permissions() {
  const [state, setState] = useState<UsersPageState>({
    modal: 'idle',
    apis: {
      detail: 'idle',
      upsert: 'idle',
      delete: 'idle',
      pagination: 'idle',
      modules: 'idle',
    },
    modals: {
      userUpsert: false,
      roleUpsert: false,
      delete: false,
    },
    buttons: {
      upsert: false,
      delete: false,
    },
    selections: {
      userRow: null,
      roleRow: null,
      userDelete: null,
      roleDelete: null,
    },
    asyncSelections: {
      roles: {
        items: [],
        loading: 'idle',
      },
    },
    users: {
      data: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    roles: {
      data: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
    modules: null,
  });

  const {
    register: filterUsersRegister,
    getValues: getUsersFilterValues,
    handleSubmit: handleUsersFilterSubmit,
    reset: resetUsersFilters,
    control: filterUsersControl,
  } = useForm<UserFiltersInput>({
    resolver: zodResolver(userFiltersSchema),
    defaultValues: userFiltersDefaultValues,
  });

  const {
    register: upsertUsersRegister,
    handleSubmit: handleUsersUpsertSubmit,
    reset: resetUsersUpsert,
    control: upsertUsersControl,
    formState: { errors: upsertUsersErrors, isValid: isValidUsers, isSubmitting: isSubmittingUsers },
    watch: watchUsersUpsert,
    setValue: setUsersUpsertValue,
  } = useForm<UserUpsertInput>({
    resolver: zodResolver(userUpsertSchema),
    defaultValues: userUpsertDefaultValues,
    mode: "onChange",
  });

  const {
    register: filterRolesRegister,
    getValues: getRolesFilterValues,
    handleSubmit: handleRolesFilterSubmit,
    reset: resetRolesFilters,
  } = useForm<RoleFiltersInput>({
    resolver: zodResolver(roleFiltersSchema),
    defaultValues: roleFiltersDefaultValues,
  });

  const {
    register: upsertRolesRegister,
    handleSubmit: handleRolesUpsertSubmit,
    reset: resetRolesUpsert,
    control: upsertRolesControl,
    formState: { errors: upsertRolesErrors, isValid: isValidRoles, isSubmitting: isSubmittingRoles },
    watch: watchRolesUpsert,
    setValue: setRolesUpsertValue,
  } = useForm<RoleUpsertInput>({
    resolver: zodResolver(roleUpsertSchema),
    defaultValues: roleUpsertDefaultValues,
    mode: "onChange",
  });

  const loadModules = async () => {
    setApiState(setState, 'modules', 'loading');
    try {
      const response = await api.get<{ data: ModulesData }>('/modules');
      setState((prev) => ({
        ...prev,
        modules: response.data.data,
      }));
      setApiState(setState, 'modules', 'ok');
    } catch (error: any) {
      notifyError(error);
      setApiState(setState, 'modules', 'error');
    }
  };

  const loadUsers = async (page = 1) => {
    setApiState(setState, 'pagination', 'loading');
    setTableState(setState, 'users', undefined, { page });

    api.post('/users', {
      ...getUsersFilterValues(),
      page,
    })
      .then(res => {
        setApiState(setState, 'pagination', 'ok');
        setTableState(setState, 'users', res.data.data, res.data.pagination);
      })
      .catch((err) => {
        setApiState(setState, 'pagination', 'error');
        notifyError(err);
      });
  };

  const loadRoles = async (page = 1) => {
    setApiState(setState, 'pagination', 'loading');
    setTableState(setState, 'roles', undefined, { page });

    api.post('/roles', {
      ...getRolesFilterValues(),
      page,
    })
      .then(res => {
        setApiState(setState, 'pagination', 'ok');
        setTableState(setState, 'roles', res.data.data, res.data.pagination);
      })
      .catch((err) => {
        setApiState(setState, 'pagination', 'error');
        notifyError(err);
      });
  };

  useEffect(() => {
    document.title = "Gestión Uno - Control de Acceso";
    loadModules();
    loadUsers();
  }, []);

  const [activeTab, setActiveTab] = useState<string>("users");

  useEffect(() => {
    if (activeTab === "roles") {
      loadRoles(1);
    } else if (activeTab === "users") {
      loadUsers(1);
    }
  }, [activeTab]);

  const openUserCreateModal = () => {
    resetUsersUpsert(userUpsertDefaultValues);
    setSelectionState(setState, 'userRow', null);
    setModalState(setState, 'userUpsert', true);
  };

  const openRoleCreateModal = () => {
    resetRolesUpsert(roleUpsertDefaultValues);
    setSelectionState(setState, 'roleRow', null);
    setModalState(setState, 'roleUpsert', true);
  };

  return (
    <div className={containerStyle}>
      <Breadcrumb
        items={[
          { label: "Inicio", to: "/" },
          { label: "Control de Acceso", to: "/permissions" },
        ]}
      />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Control de Acceso</h1>
        <p className="text-gray-600">Gestiona usuarios y roles del sistema</p>
      </div>


      <Tabs
        orientation="horizontal"
        onTabChange={(tabId) => setActiveTab(tabId)}
        items={[
          {
            id: "users",
            label: "Colaboradores",
            content: (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Gestión de Colaboradores</h2>
                  <p className="text-sm text-gray-600">
                    Administra los usuarios del sistema, configura permisos y asigna roles de acceso.
                  </p>
                </div>

                <div className={flexWrapGap3}>
                  <button type="button" className={buttonStyles.green} onClick={openUserCreateModal}>
                    Crear Usuario
                  </button>
                </div>

                <form onSubmit={handleUsersFilterSubmit(() => loadUsers(1))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      label="Nombres"
                      placeholder="Buscar por nombres..."
                      {...filterUsersRegister('names')}
                    />

                    <Input
                      label="Email"
                      placeholder="Buscar por email..."
                      {...filterUsersRegister('email')}
                    />

                    <Controller
                      name="role"
                      control={filterUsersControl}
                      render={({ field }) => (
                        <AsyncSelect
                          label="Rol"
                          endpoint="/roles"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Seleccionar rol"
                        />
                      )}
                    />

                    <Select
                      label="Estado"
                      options={[
                        { label: "Todos", value: "" },
                        { label: "Activo", value: "active" },
                        { label: "Inactivo", value: "inactive" },
                      ]}
                      value={getUsersFilterValues().status || ""}
                      onChange={(value) => filterUsersRegister('status').onChange({ target: { value } })}
                      placeholder="Seleccionar estado"
                    />

                    <Input
                      label="Desde"
                      type="date"
                      {...filterUsersRegister('dateFrom')}
                    />

                    <Input
                      label="Hasta"
                      type="date"
                      {...filterUsersRegister('dateTo')}
                    />
                  </div>

                  <div className="flex gap-3 items-end flex-col md:flex-row justify-end">
                    <button type="submit" className={buttonStyles.blue}>Buscar</button>
                    <button
                      type="button"
                      className={buttonStyles.white}
                      onClick={() => {
                        resetUsersFilters(userFiltersDefaultValues);
                        loadUsers(1);
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </form>

                <Table
                  heightClass="h-96"
                  data={state.users.data}
                  columns={[
                    {
                      key: 'names',
                      header: 'Nombres',
                      render: (row: any) => <span className="text-sm">{row.names}</span>,
                    },
                    {
                      key: 'documentNumber',
                      header: 'N° Documento',
                      render: (row: any) => <span className="text-sm">{row.documentNumber}</span>,
                    },
                    {
                      key: 'email',
                      header: 'Email',
                      render: (row: any) => <span className="text-sm">{row.email}</span>,
                    },
                    {
                      key: 'username',
                      header: 'Usuario',
                      render: (row: any) => <span className="text-sm">{row.username}</span>,
                    },
                    {
                      key: 'role',
                      header: 'Rol',
                      render: (row: any) => <span className="text-sm">{row.role}</span>,
                    },
                    {
                      key: 'status',
                      header: 'Estado',
                      render: (row: any) => (
                        <Badge
                          label={row.status === 'active' ? 'Activo' : 'Inactivo'}
                          color={row.status === 'active' ? '#16A34A' : '#6B7280'}
                        />
                      ),
                    },
                    {
                      key: 'inUse',
                      header: 'En Uso',
                      render: (row: any) => (
                        <Badge
                          label={row.inUse ? 'Sí' : 'No'}
                          color={row.inUse ? '#2563EB' : '#6B7280'}
                        />
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Acciones',
                      headerClassName: 'text-right',
                      render: (row: any) => (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar usuario"
                            onClick={async () => {
                              setSelectionState(setState, 'userRow', row);
                              setModalState(setState, 'userUpsert', true, 'loading');
                              setApiState(setState, 'detail', 'loading');

                              try {
                                const response = await api.get(`/user/${row.id}`);
                                const userData = response.data.data;

                                resetUsersUpsert({
                                  documentType: userData.documentType || "",
                                  documentNumber: userData.documentNumber,
                                  paternalSurnames: userData.paternalSurnames || "",
                                  maternalSurnames: userData.maternalSurnames || "",
                                  names: userData.names,
                                  email: userData.email,
                                  phone: userData.phone || "",
                                  address: userData.address || {
                                    continent: "",
                                    country: "",
                                    state: "",
                                    city: "",
                                    district: "",
                                    street: "",
                                    number: "",
                                    zip: "",
                                  },
                                  preferences: userData.preferences || {
                                    darkMode: false,
                                    notifications: {
                                      promotions: false,
                                      updates: false,
                                      payments: true,
                                    },
                                    autoRenew: false,
                                  },
                                  role: userData.role,
                                  status: userData.status,
                                  inUse: userData.inUse || false,
                                });

                                setApiState(setState, 'detail', 'ok');
                                setModalState(setState, 'userUpsert', true, 'ok');
                              } catch (error: any) {
                                notifyError(error);
                                setApiState(setState, 'detail', 'error');
                                setModalState(setState, 'userUpsert', false);
                              }
                            }}
                            className={buttonStyles.base}
                          >
                            {icons.edit}
                          </button>

                          <button
                            type="button"
                            title="Eliminar usuario"
                            onClick={() => {
                              setSelectionState(setState, 'userDelete', row);
                              setModalState(setState, 'delete', true);
                            }}
                            disabled={row.inUse}
                            className={buttonStyles.base}
                          >
                            {icons.delete}
                          </button>
                        </div>
                      ),
                    },
                  ]}
                  load={state.apis.pagination}
                  pagination={state.users.pagination}
                  onPageChange={(page) => loadUsers(page)}
                  loadingNode={<TableLoadingNode message="Cargando usuarios..." />}
                  emptyNode={
                    <TableEmptyNode
                      title="No hay usuarios creados"
                      description="Crea tu primer usuario para comenzar"
                      buttonText="Crear Usuario"
                      onAction={openUserCreateModal}
                    />
                  }
                  errorNode={
                    <TableErrorNode
                      title="Error al cargar usuarios"
                      description="No se pudieron cargar los datos"
                      buttonText="Reintentar"
                      onRetry={() => loadUsers(state.users.pagination.page)}
                    />
                  }
                />
              </div>)
          },
          {
            id: "roles",
            label: "Roles",
            content: (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900">Gestión de Roles</h2>
                  <p className="text-sm text-gray-600">
                    Define y configura roles con permisos específicos para controlar el acceso a diferentes módulos del sistema.
                  </p>
                </div>

                <div className={flexWrapGap3}>
                  <button type="button" className={buttonStyles.green} onClick={openRoleCreateModal}>
                    Crear Rol
                  </button>
                </div>

                <form onSubmit={handleRolesFilterSubmit(() => loadRoles(1))} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input
                      label="Nombre"
                      placeholder="Buscar por nombre..."
                      {...filterRolesRegister('name')}
                    />

                    <Select
                      label="Estado"
                      options={[
                        { label: "Todos", value: "" },
                        { label: "Activo", value: "active" },
                        { label: "Inactivo", value: "inactive" },
                      ]}
                      value={getRolesFilterValues().status || ""}
                      onChange={(value) => filterRolesRegister('status').onChange({ target: { value } })}
                      placeholder="Seleccionar estado"
                    />

                    <Input
                      label="Desde"
                      type="date"
                      {...filterRolesRegister('dateFrom')}
                    />

                    <Input
                      label="Hasta"
                      type="date"
                      {...filterRolesRegister('dateTo')}
                    />
                  </div>

                  <div className="flex gap-3 items-end flex-col md:flex-row justify-end">
                    <button type="submit" className={buttonStyles.blue}>Buscar</button>
                    <button
                      type="button"
                      className={buttonStyles.white}
                      onClick={() => {
                        resetRolesFilters(roleFiltersDefaultValues);
                        loadRoles(1);
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                </form>

                <Table
                  heightClass="h-96"
                  data={state.roles.data}
                  columns={[
                    {
                      key: 'name',
                      header: 'Nombre',
                      render: (row: any) => <span className="text-sm">{row.name}</span>,
                    },
                    {
                      key: 'status',
                      header: 'Estado',
                      render: (row: any) => (
                        <Badge
                          label={row.status === 'active' ? 'Activo' : 'Inactivo'}
                          color={row.status === 'active' ? '#16A34A' : '#6B7280'}
                        />
                      ),
                    },
                    {
                      key: 'inUse',
                      header: 'En Uso',
                      render: (row: any) => (
                        <Badge
                          label={row.inUse ? 'Sí' : 'No'}
                          color={row.inUse ? '#2563EB' : '#6B7280'}
                        />
                      ),
                    },
                    {
                      key: 'actions',
                      header: 'Acciones',
                      headerClassName: 'text-right',
                      render: (row: any) => (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Editar rol"
                            onClick={async () => {
                              setSelectionState(setState, 'roleRow', row);
                              setModalState(setState, 'roleUpsert', true, 'loading');
                              setApiState(setState, 'detail', 'loading');

                              try {
                                const response = await api.get(`/role/${row.id}`);
                                const roleData = response.data.data;

                                resetRolesUpsert({
                                  name: roleData.name,
                                  description: roleData.description,
                                  permissions: roleData.permissions,
                                  status: roleData.status,
                                  inUse: roleData.inUse || false,
                                });

                                setApiState(setState, 'detail', 'ok');
                                setModalState(setState, 'roleUpsert', true, 'ok');
                              } catch (error: any) {
                                notifyError(error);
                                setApiState(setState, 'detail', 'error');
                                setModalState(setState, 'roleUpsert', false);
                              }
                            }}
                            className={buttonStyles.base}
                          >
                            {icons.edit}
                          </button>

                          <button
                            type="button"
                            title="Eliminar rol"
                            onClick={() => {
                              setSelectionState(setState, 'roleDelete', row);
                              setModalState(setState, 'delete', true);
                            }}
                            disabled={row.inUse}
                            className={buttonStyles.base}
                          >
                            {icons.delete}
                          </button>
                        </div>
                      ),
                    },
                  ]}
                  load={state.apis.pagination}
                  pagination={state.roles.pagination}
                  onPageChange={(page) => loadRoles(page)}
                  loadingNode={<TableLoadingNode message="Cargando roles..." />}
                  emptyNode={
                    <TableEmptyNode
                      title="No hay roles creados"
                      description="Crea tu primer rol para comenzar"
                      buttonText="Crear Rol"
                      onAction={openRoleCreateModal}
                    />
                  }
                  errorNode={
                    <TableErrorNode
                      title="Error al cargar roles"
                      description="No se pudieron cargar los datos"
                      buttonText="Reintentar"
                      onRetry={() => loadRoles(state.roles.pagination.page)}
                    />
                  }
                />
              </div>)
          }
        ]}
      />

      <Modal
        open={state.modals.userUpsert}
        load={state.modal}
        onRetry={() => {
          const userId = state.selections.userRow?.id;
          if (!userId) return;

          setModalState(setState, 'userUpsert', true, 'loading');

          api.get(`/user/${userId}`)
            .then(res => {
              const userData = res.data.data;
              resetUsersUpsert({
                documentType: userData.documentType || "",
                documentNumber: userData.documentNumber,
                paternalSurnames: userData.paternalSurnames || "",
                maternalSurnames: userData.maternalSurnames || "",
                names: userData.names,
                email: userData.email,
                phone: userData.phone || "",
                address: userData.address || {
                  continent: "",
                  country: "",
                  state: "",
                  city: "",
                  district: "",
                  street: "",
                  number: "",
                  zip: "",
                },
                preferences: userData.preferences || {
                  darkMode: false,
                  notifications: {
                    promotions: false,
                    updates: false,
                    payments: true,
                  },
                  autoRenew: false,
                },
                role: userData.role,
                status: userData.status,
                inUse: userData.inUse || false,
              });
              setModalState(setState, 'userUpsert', true, 'ok');
            })
            .catch((err) => {
              setModalState(setState, 'userUpsert', true, 'error');
              notifyError(err);
            });
        }}
        onClose={() => {
          resetUsersUpsert(userUpsertDefaultValues);
          setSelectionState(setState, 'userRow', null);
          setModalState(setState, 'userUpsert', false);
        }}
      >
        <form
          onSubmit={handleUsersUpsertSubmit(async (data) => {
            setApiState(setState, 'upsert', 'loading');
            setButtonState(setState, 'upsert', true);

            const payload = { ...data };
            if (state.selections.userRow?.id) payload.id = state.selections.userRow.id;

            api.post('/user-upsert', payload)
              .then((res) => {
                notifySuccess(res.data);
                loadUsers(state.users.pagination.page);
                resetUsersUpsert(userUpsertDefaultValues);
                setApiState(setState, 'upsert', 'ok');
                setButtonState(setState, 'upsert', false);
                setSelectionState(setState, 'userRow', null);
                setModalState(setState, 'userUpsert', false);
              })
              .catch((err) => {
                setApiState(setState, 'upsert', 'error');
                setButtonState(setState, 'upsert', false);
                notifyError(err);
              });
          })}
          className={`${modalStyle} max-w-[560px]`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selections.userRow ? 'Editar Usuario' : 'Crear Usuario'}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selections.userRow
                ? 'Modifica los datos del usuario.'
                : 'Las credenciales de acceso serán generadas automáticamente y enviadas al correo registrado.'}
            </p>
          </div>

          <div className={flexColGap2}>
            <Select
              label="Tipo de Documento"
              options={[
                { label: "DNI", value: "DNI" },
                { label: "Pasaporte", value: "Pasaporte" },
                { label: "Carnet de Extranjería", value: "CE" },
                { label: "RUC", value: "RUC" },
              ]}
              value={watchUsersUpsert('documentType') || ""}
              onChange={(value) => setUsersUpsertValue('documentType', value)}
              placeholder="Seleccionar tipo"
              error={upsertUsersErrors.documentType?.message}
            />

            <Input
              label="N° de Documento *"
              placeholder="Número de documento"
              {...upsertUsersRegister('documentNumber')}
              disabled={!!state.selections.userRow}
              error={upsertUsersErrors.documentNumber?.message}
            />

            <Input
              label="Apellido Paterno"
              placeholder="Apellido paterno"
              {...upsertUsersRegister('paternalSurnames')}
              error={upsertUsersErrors.paternalSurnames?.message}
            />

            <Input
              label="Apellido Materno"
              placeholder="Apellido materno"
              {...upsertUsersRegister('maternalSurnames')}
              error={upsertUsersErrors.maternalSurnames?.message}
            />

            <Input
              label="Nombres *"
              placeholder="Nombres completos"
              {...upsertUsersRegister('names')}
              error={upsertUsersErrors.names?.message}
            />

            <Input
              label="Email *"
              type="email"
              placeholder="correo@ejemplo.com"
              {...upsertUsersRegister('email')}
              error={upsertUsersErrors.email?.message}
            />

            <Input
              label="Teléfono"
              placeholder="+51 999 999 999"
              {...upsertUsersRegister('phone')}
              error={upsertUsersErrors.phone?.message}
            />

            <Controller
              name="role"
              control={upsertUsersControl}
              render={({ field }) => (
                <AsyncSelect
                  label="Rol *"
                  endpoint="/roles"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Seleccionar rol"
                  error={upsertUsersErrors.role?.message}
                />
              )}
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={watchUsersUpsert('status') === 'active'}
                onChange={(e) =>
                  setUsersUpsertValue('status', e.target.checked ? 'active' : 'inactive', { shouldValidate: true })
                }
              />
              <span className="text-sm font-medium">Activo</span>
            </label>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, 'userUpsert', false)}
            >
              Cancelar
            </button>

            <LoadingButton
              type="submit"
              disabled={!isValidUsers || isSubmittingUsers}
              isLoading={state.buttons.upsert}
              loadingText="Guardando…"
              normalText="Guardar"
              className={buttonStyles.blue}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={state.modals.roleUpsert}
        load={state.modal}
        onRetry={() => {
          const roleId = state.selections.roleRow?.id;
          if (!roleId) return;

          setModalState(setState, 'roleUpsert', true, 'loading');

          api.get(`/role/${roleId}`)
            .then(res => {
              const roleData = res.data.data;
              resetRolesUpsert({
                name: roleData.name,
                description: roleData.description,
                permissions: roleData.permissions,
                status: roleData.status,
                inUse: roleData.inUse || false,
              });
              setModalState(setState, 'roleUpsert', true, 'ok');
            })
            .catch((err) => {
              setModalState(setState, 'roleUpsert', true, 'error');
              notifyError(err);
            });
        }}
        onClose={() => {
          resetRolesUpsert(roleUpsertDefaultValues);
          setSelectionState(setState, 'roleRow', null);
          setModalState(setState, 'roleUpsert', false);
        }}
      >
        <form
          onSubmit={handleRolesUpsertSubmit(async (data) => {
            setApiState(setState, 'upsert', 'loading');
            setButtonState(setState, 'upsert', true);

            const payload = { ...data };
            if (!payload.permissions) payload.permissions = {};
            if (state.selections.roleRow?.id) payload.id = state.selections.roleRow.id;

            api.post('/role-upsert', payload)
              .then((res) => {
                notifySuccess(res.data);
                loadRoles(state.roles.pagination.page);
                resetRolesUpsert(roleUpsertDefaultValues);
                setApiState(setState, 'upsert', 'ok');
                setButtonState(setState, 'upsert', false);
                setSelectionState(setState, 'roleRow', null);
                setModalState(setState, 'roleUpsert', false);
              })
              .catch((err) => {
                setApiState(setState, 'upsert', 'error');
                setButtonState(setState, 'upsert', false);
                notifyError(err);
              });
          })}
          className={`${modalStyle} max-w-[720px]`}
        >
          <div>
            <h2 className="text-xl font-semibold">
              {state.selections.roleRow ? 'Editar Rol' : 'Crear Rol'}
            </h2>
            <p className="text-sm text-gray-500">
              {state.selections.roleRow
                ? 'Modifica los datos del rol.'
                : 'Agrega un nuevo rol al sistema.'}
            </p>
          </div>

          <div className={flexColGap2}>
            <Input label="Nombre *"
              placeholder="Nombre del rol"
              {...upsertRolesRegister('name')}
              error={upsertRolesErrors.name?.message}
            />

            <Input
              label="Descripción"
              placeholder="Descripción del rol"
              {...upsertRolesRegister('description')}
              error={upsertRolesErrors.description?.message}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Permisos</label>
              {state.modules?.modules && (
                <Controller
                  name="permissions"
                  control={upsertRolesControl}
                  render={({ field }) => (
                    <PermissionSelector
                      modules={state.modules?.modules || []}
                      selectedPermissions={field.value as Record<string, string[]> | undefined}
                      onChange={field.onChange}
                    />
                  )}
                />
              )}
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={watchRolesUpsert('status') === 'active'}
                onChange={(e) =>
                  setRolesUpsertValue('status', e.target.checked ? 'active' : 'inactive', { shouldValidate: true })
                }
              />
              <span className="text-sm font-medium">Activo</span>
            </label>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => setModalState(setState, 'roleUpsert', false)}
            >
              Cancelar
            </button>

            <LoadingButton
              type="submit"
              disabled={!isValidRoles || isSubmittingRoles}
              isLoading={state.buttons.upsert}
              loadingText="Guardando…"
              normalText="Guardar"
              className={buttonStyles.blue}
            />
          </div>
        </form>
      </Modal>

      <Modal
        load={state.modal}
        open={state.modals.delete && !!state.selections.userDelete}
        onClose={() => {
          setModalState(setState, 'delete', false);
          setSelectionState(setState, 'userDelete', null);
        }}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar Usuario</h2>
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
            </p>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => {
                setModalState(setState, 'delete', false);
                setSelectionState(setState, 'userDelete', null);
              }}
            >
              Cancelar
            </button>

            <LoadingButton
              type="button"
              isLoading={state.buttons.delete}
              loadingText="Eliminando…"
              normalText="Eliminar"
              className={buttonStyles.red}
              onClick={() => {
                if (!state.selections.userDelete) return;

                setApiState(setState, 'delete', 'loading');
                setButtonState(setState, 'delete', true);

                api.delete(`/user/${state.selections.userDelete.id}`)
                  .then((res) => {
                    notifySuccess(res.data);
                    loadUsers(state.users.pagination.page);
                    setModalState(setState, 'delete', false);
                    setApiState(setState, 'delete', 'ok');
                    setButtonState(setState, 'delete', false);
                    setSelectionState(setState, 'userDelete', null);
                  })
                  .catch((err) => {
                    setApiState(setState, 'delete', 'error');
                    setButtonState(setState, 'delete', false);
                    notifyError(err);
                  });
              }}
            />
          </div>
        </form>
      </Modal>

      <Modal
        load={state.modal}
        open={state.modals.delete && !!state.selections.roleDelete}
        onClose={() => {
          setModalState(setState, 'delete', false);
          setSelectionState(setState, 'roleDelete', null);
        }}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar Rol</h2>
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer.
            </p>
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.white}
              onClick={() => {
                setModalState(setState, 'delete', false);
                setSelectionState(setState, 'roleDelete', null);
              }}
            >
              Cancelar
            </button>

            <LoadingButton
              type="button"
              isLoading={state.buttons.delete}
              loadingText="Eliminando…"
              normalText="Eliminar"
              className={buttonStyles.red}
              onClick={() => {
                if (!state.selections.roleDelete) return;

                setApiState(setState, 'delete', 'loading');
                setButtonState(setState, 'delete', true);

                api.delete(`/role/${state.selections.roleDelete.id}`)
                  .then((res) => {
                    notifySuccess(res.data);
                    loadRoles(state.roles.pagination.page);
                    setModalState(setState, 'delete', false);
                    setApiState(setState, 'delete', 'ok');
                    setButtonState(setState, 'delete', false);
                    setSelectionState(setState, 'roleDelete', null);
                  })
                  .catch((err) => {
                    setApiState(setState, 'delete', 'error');
                    setButtonState(setState, 'delete', false);
                    notifyError(err);
                  });
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
