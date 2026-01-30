import Breadcrumb from "../../molecules/Breadcrumb";
import Table from "../../organisms/Table";
import Pagination, { type PaginationState } from "../../organisms/Pagination";
import Modal from "../../atoms/Modal";
import Button from "../../atoms/Button";
import Input from "../../atoms/Input";
import Textarea from "../../atoms/Textarea";
import Switch from "../../atoms/Switch";
import { useEffect, useState } from "react";
import api from "../../../core/config/Axios";

interface Provider {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface Pagination {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ListResponse<T> {
  data: T[];
  pagination: Pagination;
}

interface UpsertResponse {
  id: string;
  message: string;
}

interface ProvidersState {
  modals: {
    createEdit: boolean;
    delete: boolean;
  };

  createEdit: {
    mode: 'create' | 'edit' | null;
    providerId: string | null;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    status: 'ACTIVE' | 'INACTIVE';
  };

  delete: {
    providerId: string | null;
  };

  providers: {
    data: Provider[];
    pagination: PaginationState;
  };
}

export default function Providers() {
  const [state, setState] = useState<ProvidersState>({
    modals: {
      createEdit: false,
      delete: false,
    },

    createEdit: {
      mode: null,
      providerId: null,
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      status: 'ACTIVE',
    },

    delete: {
      providerId: null,
    },

    providers: {
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

  const openCreateEdit = (provider?: Provider) => {
    if (provider) {
      // Edit mode
      setState(s => ({
        ...s,
        createEdit: {
          mode: 'edit',
          providerId: provider.id,
          name: provider.name,
          contactName: provider.contactName,
          email: provider.email,
          phone: provider.phone,
          address: provider.address || "",
          notes: provider.notes || "",
          status: provider.status,
        },
        modals: { ...s.modals, createEdit: true },
      }));
    } else {
      // Create mode
      setState(s => ({
        ...s,
        createEdit: {
          mode: 'create',
          providerId: null,
          name: "",
          contactName: "",
          email: "",
          phone: "",
          address: "",
          notes: "",
          status: 'ACTIVE',
        },
        modals: { ...s.modals, createEdit: true },
      }));
    }
  };

  const closeCreateEdit = () => {
    setState(s => ({
      ...s,
      createEdit: {
        mode: null,
        providerId: null,
        name: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        status: 'ACTIVE',
      },
      modals: { ...s.modals, createEdit: false },
    }));
  };

  const saveProvider = async () => {
    await api.post<UpsertResponse>("/upsert-providers", {
      id: state.createEdit.providerId,
      name: state.createEdit.name,
      contactName: state.createEdit.contactName,
      email: state.createEdit.email,
      phone: state.createEdit.phone,
      address: state.createEdit.address,
      notes: state.createEdit.notes,
      status: state.createEdit.status,
    });

    await fetchProviders();
    closeCreateEdit();
  };

  const openDelete = (provider: Provider) => {
    setState(s => ({
      ...s,
      delete: { providerId: provider.id },
      modals: { ...s.modals, delete: true },
    }));
  };

  const closeDelete = () => {
    setState(s => ({
      ...s,
      delete: { providerId: null },
      modals: { ...s.modals, delete: false },
    }));
  };

  const deleteProvider = async () => {
    if (!state.delete.providerId) return;

    await api.delete(`/providers/${state.delete.providerId}`);
    await fetchProviders();
    closeDelete();
  };

  const fetchProviders = async (page: number = 1, perPage: number = 10) => {
    const response = await api.post<ListResponse<Provider>>("/providers", { page, perPage });

    setState(s => ({
      ...s,
      providers: {
        data: response.data.data,
        pagination: response.data.pagination,
      },
    }));
  };

  const getStatusBadgeColor = (status: string): string => {
    return status === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string): string => {
    return status === 'ACTIVE' ? 'Activo' : 'Inactivo';
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <>
      <div className="mx-auto max-w-7xl flex flex-col gap-6">
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Proveedores" },
          ]}
        />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-gray-600">
            Gestión de proveedores y contactos de suministro.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => openCreateEdit()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
          >
            + Agregar Proveedor
          </Button>
        </div>

        <Table
          data={state.providers.data}
          columns={[
            {
              key: "name",
              header: "Nombre",
              render: (provider: Provider) => (
                <span className="font-medium">{provider.name}</span>
              )
            },
            {
              key: "contactName",
              header: "Contacto",
              render: (provider: Provider) => (
                <span className="text-sm">{provider.contactName}</span>
              )
            },
            {
              key: "email",
              header: "Email",
              render: (provider: Provider) => (
                <span className="text-sm text-blue-600">{provider.email}</span>
              )
            },
            {
              key: "phone",
              header: "Teléfono",
              render: (provider: Provider) => (
                <span className="text-sm">{provider.phone}</span>
              )
            },
            {
              key: "status",
              header: "Estado",
              render: (provider: Provider) => (
                <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusBadgeColor(provider.status)}`}>
                  {getStatusLabel(provider.status)}
                </span>
              )
            },
            {
              key: "actions",
              header: "Acciones",
              align: "right",
              render: (provider: Provider) => (
                <div className="flex gap-2 justify-end">
                  <button
                    title="Editar"
                    onClick={() => openCreateEdit(provider)}
                    className="hover:text-blue-600 transition text-lg"
                  >
                    ✏️
                  </button>
                  <button
                    title="Eliminar"
                    onClick={() => openDelete(provider)}
                    className="hover:text-red-600 transition text-lg"
                  >
                    🗑
                  </button>
                </div>
              )
            }
          ]}
        />

        <Pagination
          pagination={state.providers.pagination}
          onChange={(page: number) => fetchProviders(page)}
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal open={state.modals.createEdit} onClose={closeCreateEdit}>
        <div className="w-[600px] rounded-2xl bg-white p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">
              {state.createEdit.mode === 'create' ? 'Agregar Proveedor' : 'Editar Proveedor'}
            </h2>
            <p className="text-sm text-gray-500">
              {state.createEdit.mode === 'create'
                ? 'Completa los datos para crear un nuevo proveedor.'
                : 'Actualiza los datos del proveedor.'}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Nombre</label>
                <Input
                  type="text"
                  placeholder="Nombre del proveedor"
                  value={state.createEdit.name}
                  onChange={(e) => setState(s => ({
                    ...s,
                    createEdit: { ...s.createEdit, name: e.target.value }
                  }))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Contacto</label>
                <Input
                  type="text"
                  placeholder="Nombre de contacto"
                  value={state.createEdit.contactName}
                  onChange={(e) => setState(s => ({
                    ...s,
                    createEdit: { ...s.createEdit, contactName: e.target.value }
                  }))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Email</label>
                <Input
                  type="email"
                  placeholder="Email del contacto"
                  value={state.createEdit.email}
                  onChange={(e) => setState(s => ({
                    ...s,
                    createEdit: { ...s.createEdit, email: e.target.value }
                  }))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Teléfono</label>
                <Input
                  type="tel"
                  placeholder="Teléfono"
                  value={state.createEdit.phone}
                  onChange={(e) => setState(s => ({
                    ...s,
                    createEdit: { ...s.createEdit, phone: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Dirección</label>
              <Textarea
                placeholder="Dirección completa (opcional)"
                value={state.createEdit.address}
                onChange={(e) => setState(s => ({
                  ...s,
                  createEdit: { ...s.createEdit, address: e.target.value }
                }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold">Notas</label>
              <Textarea
                placeholder="Notas adicionales (opcional)"
                value={state.createEdit.notes}
                onChange={(e) => setState(s => ({
                  ...s,
                  createEdit: { ...s.createEdit, notes: e.target.value }
                }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold">Estado</label>
              <Switch
                checked={state.createEdit.status === 'ACTIVE'}
                onChange={(checked) => setState(s => ({
                  ...s,
                  createEdit: { ...s.createEdit, status: checked ? 'ACTIVE' : 'INACTIVE' }
                }))}
              />
              <span className="text-sm text-gray-600">
                {state.createEdit.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={closeCreateEdit}
              className="rounded border border-gray-400 px-4 py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={saveProvider}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              {state.createEdit.mode === 'create' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={state.modals.delete} onClose={closeDelete}>
        <div className="w-[400px] rounded-2xl bg-white p-6 flex flex-col gap-6 shadow-xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar Proveedor</h2>
            <p className="text-sm text-gray-500">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <p className="text-gray-700">
            ¿Está seguro que desea eliminar este proveedor?
          </p>

          <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={closeDelete}
              className="rounded border border-gray-400 px-4 py-2 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={deleteProvider}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
