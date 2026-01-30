import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../../core/config/axios";
import Modal from "../../../atoms/modal";
import Input from "../../../atoms/input";
import Textarea from "../../../atoms/textarea";
import Table from "../../../organisms/table";
import {
  buttonStyles,
  flexColGap2,
  flexJustifyEndGap3,
  flexWrapGap3,
  formTextStyles,
  inputStyles,
  modalStyle,
  spinnerStyle,
} from "../../../../core/helpers/styles";
import { setModalState } from "../../../../core/helpers/shared";
import { icons } from "../../../../core/helpers/icons";

// Import types and validations
import type { SuppliersPageState, SupplierRow } from "../../../../core/types/suppliers";
import {
  supplierUpsertSchema,
  supplierFiltersSchema,
  supplierFiltersDefaultValues,
  supplierUpsertDefaultValues,
  type SupplierUpsertInput,
  type SupplierFiltersInput,
} from "../../../../core/validations/suppliers";

export default function Suppliers() {
  const [state, setState] = useState<SuppliersPageState>({
    modal: "idle",
    loadAPI: "idle",

    suppliers: {
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

    modals: {
      upsert: false,
      delete: false,
    },

    selectedSupplier: null,
    filters: {},
  });

  const filtersForm = useForm<SupplierFiltersInput>({
    resolver: zodResolver(supplierFiltersSchema),
    defaultValues: supplierFiltersDefaultValues,
  });

  const upsertForm = useForm<SupplierUpsertInput>({
    resolver: zodResolver(supplierUpsertSchema),
    defaultValues: supplierUpsertDefaultValues,
  });

  // Fetch suppliers
  const fetchSuppliers = async (page: number = 1) => {
    try {
      setState((prev) => ({
        ...prev,
        suppliers: { ...prev.suppliers, load: "loading" },
      }));

      const filters = filtersForm.getValues();
      const response = await api.post("/inventory/suppliers/list", {
        page,
        perPage: state.suppliers.pagination.perPage,
        filters,
      });

      setState((prev) => ({
        ...prev,
        suppliers: {
          load: "ok",
          data: response.data.data,
          pagination: response.data.pagination,
        },
      }));
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setState((prev) => ({
        ...prev,
        suppliers: { ...prev.suppliers, load: "error" },
      }));
    }
  };

  // Create/Update supplier
  const handleUpsert = async (data: SupplierUpsertInput) => {
    try {
      setModalState(setState, "upsert", true, "loading");

      if (state.selectedSupplier) {
        // Update
        await api.put(`/inventory/suppliers/${state.selectedSupplier.id}`, data);
      } else {
        // Create
        await api.post("/inventory/suppliers", data);
      }

      setModalState(setState, "upsert", false, "ok");
      setTimeout(() => {
        fetchSuppliers(state.suppliers.pagination.page);
      }, 1000);
    } catch (error: any) {
      console.error("Error upserting supplier:", error);
      setModalState(setState, "upsert", true, "error");
    }
  };

  // Delete supplier
  const handleDelete = async () => {
    if (!state.selectedSupplier) return;

    try {
      setModalState(setState, "delete", true, "loading");
      await api.delete(`/inventory/suppliers/${state.selectedSupplier.id}`);

      setModalState(setState, "delete", false, "ok");
      setTimeout(() => {
        fetchSuppliers(state.suppliers.pagination.page);
      }, 1000);
    } catch (error: any) {
      console.error("Error deleting supplier:", error);
      setModalState(setState, "delete", true, "error");
    }
  };

  // Open upsert modal
  const openUpsertModal = (supplier?: SupplierRow) => {
    if (supplier) {
      setState((prev) => ({ ...prev, selectedSupplier: supplier }));
      upsertForm.reset({
        code: supplier.code,
        name: supplier.name,
        contactName: supplier.contactName || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: "",
        description: "",
      });
    } else {
      setState((prev) => ({ ...prev, selectedSupplier: null }));
      upsertForm.reset(supplierUpsertDefaultValues);
    }
    setState((prev) => ({
      ...prev,
      modals: { ...prev.modals, upsert: true },
    }));
  };

  const closeUpsertModal = () => {
    setState((prev) => ({
      ...prev,
      modals: { ...prev.modals, upsert: false },
      selectedSupplier: null,
      modal: "idle",
    }));
    upsertForm.reset(supplierUpsertDefaultValues);
  };

  // Open delete modal
  const openDeleteModal = (supplier: SupplierRow) => {
    setState((prev) => ({
      ...prev,
      selectedSupplier: supplier,
      modals: { ...prev.modals, delete: true },
    }));
  };

  const closeDeleteModal = () => {
    setState((prev) => ({
      ...prev,
      modals: { ...prev.modals, delete: false },
      selectedSupplier: null,
      modal: "idle",
    }));
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Gestión de Proveedores</h1>
        <p className="text-gray-600">
          Administra la información de tus proveedores y contactos comerciales.
        </p>
      </div>

      <div className={flexWrapGap3}>
        <button
          onClick={() => openUpsertModal()}
          className={buttonStyles.green}
        >
          Crear nuevo proveedor
        </button>
      </div>

      <form
        onSubmit={filtersForm.handleSubmit(() => fetchSuppliers(1))}
        className={`${flexWrapGap3} items-end`}
      >
        <Input
          label="Nombre"
          placeholder="Buscar por nombre"
          containerClassName="w-full md:w-64"
          labelClassName={formTextStyles.label}
          inputClassName={inputStyles.base}
          {...filtersForm.register("name")}
        />

        <button type="submit" className={buttonStyles.blue}>
          Buscar
        </button>
        <button
          type="button"
          onClick={() => {
            filtersForm.reset(supplierFiltersDefaultValues);
            fetchSuppliers(1);
          }}
          className={buttonStyles.white}
        >
          Limpiar
        </button>
      </form>

      <Table<SupplierRow>
        heightClass="h-96"
        columns={[
          {
            key: "code",
            header: "Código",
            render: (row) => (
              <span className="font-mono text-sm">{row.code}</span>
            ),
          },
          {
            key: "name",
            header: "Nombre",
            render: (row) => row.name,
          },
          {
            key: "contactName",
            header: "Contacto",
            render: (row) => row.contactName || "-",
          },
          {
            key: "email",
            header: "Email",
            render: (row) => row.email || "-",
          },
          {
            key: "phone",
            header: "Teléfono",
            render: (row) => row.phone || "-",
          },
          {
            key: "status",
            header: "Estado",
            render: (row) => (
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  row.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {row.isActive ? "Activo" : "Inactivo"}
              </span>
            ),
          },
          {
            key: "type",
            header: "Tipo",
            render: (row) => (
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  row.isSystem
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {row.isSystem ? "Sistema" : "Personalizado"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Acciones",
            render: (row) => (
              <div className="flex gap-2">
                {!row.isSystem && (
                  <>
                    <button
                      type="button"
                      onClick={() => openUpsertModal(row)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Editar"
                    >
                      {icons.edit}
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(row)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Eliminar"
                    >
                      {icons.delete}
                    </button>
                  </>
                )}
                {row.isSystem && (
                  <span className="text-xs text-gray-500 italic">
                    No editable
                  </span>
                )}
              </div>
            ),
          },
        ]}
        data={state.suppliers.data}
        load={state.suppliers.load}
        pagination={state.suppliers.pagination}
        onPageChange={(page) => fetchSuppliers(page)}
        loadingNode={
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Cargando proveedores...</p>
            </div>
          </div>
        }
        emptyNode={
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900">No hay proveedores creados</p>
              <p className="text-sm text-gray-500 mt-1">Crea tu primer proveedor para comenzar</p>
            </div>
            <button
              onClick={() => openUpsertModal()}
              className={buttonStyles.blue}
            >
              Crear nuevo proveedor
            </button>
          </div>
        }
        errorNode={
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-s text-gray-900">Error al cargar proveedores</p>
              <p className="text-sm text-gray-500 mt-1">No se pudieron cargar los datos</p>
            </div>
            <button
              onClick={() => fetchSuppliers(state.suppliers.pagination.page)}
              className={buttonStyles.blue}
            >
              Reintentar
            </button>
          </div>
        }
      />

      <Modal
        open={state.modals.upsert}
        onClose={closeUpsertModal}
        load={state.modal}
      >
        <form onSubmit={upsertForm.handleSubmit(handleUpsert)} className={modalStyle}>
          <h3 className="text-xl font-bold text-gray-900">
            {state.selectedSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
          </h3>

          <div className={flexColGap2}>
            <label className={formTextStyles.label}>
              Código <span className="text-red-500">*</span>
            </label>
            <Input
              {...upsertForm.register("code")}
              placeholder="Ej: SUPPLIER_001"
              inputClassName={inputStyles.base}
              disabled={!!state.selectedSupplier}
            />
            {upsertForm.formState.errors.code && (
              <span className={formTextStyles.error}>
                {upsertForm.formState.errors.code.message}
              </span>
            )}
          </div>

          <div className={flexColGap2}>
            <label className={formTextStyles.label}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              {...upsertForm.register("name")}
              placeholder="Nombre del proveedor"
              inputClassName={inputStyles.base}
            />
            {upsertForm.formState.errors.name && (
              <span className={formTextStyles.error}>
                {upsertForm.formState.errors.name.message}
              </span>
            )}
          </div>

          <div className={flexColGap2}>
            <label className={formTextStyles.label}>Nombre de Contacto</label>
            <Input
              {...upsertForm.register("contactName")}
              placeholder="Persona de contacto"
              inputClassName={inputStyles.base}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={flexColGap2}>
              <label className={formTextStyles.label}>Email</label>
              <Input
                {...upsertForm.register("email")}
                type="email"
                placeholder="email@ejemplo.com"
                inputClassName={inputStyles.base}
              />
              {upsertForm.formState.errors.email && (
                <span className={formTextStyles.error}>
                  {upsertForm.formState.errors.email.message}
                </span>
              )}
            </div>

            <div className={flexColGap2}>
              <label className={formTextStyles.label}>Teléfono</label>
              <Input
                {...upsertForm.register("phone")}
                placeholder="+52 123 456 7890"
                inputClassName={inputStyles.base}
              />
            </div>
          </div>

          <div className={flexColGap2}>
            <label className={formTextStyles.label}>Dirección</label>
            <Textarea
              {...upsertForm.register("address")}
              placeholder="Dirección del proveedor"
              textareaClassName={inputStyles.base}
              rows={2}
            />
          </div>

          <div className={flexColGap2}>
            <label className={formTextStyles.label}>Descripción</label>
            <Textarea
              {...upsertForm.register("description")}
              placeholder="Descripción del proveedor"
              textareaClassName={inputStyles.base}
              rows={3}
            />
          </div>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={closeUpsertModal}
              className={buttonStyles.white}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={state.modal === "loading"}
              className={buttonStyles.blue}
            >
              {state.modal === "loading" ? (
                <div className={spinnerStyle} />
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={state.modals.delete}
        onClose={closeDeleteModal}
        load={state.modal}
      >
        <div className={modalStyle}>
          <h3 className="text-xl font-bold text-gray-900">Eliminar Proveedor</h3>
          <p className="text-gray-600">
            ¿Estás seguro que deseas eliminar el proveedor{" "}
            <strong>{state.selectedSupplier?.name}</strong>? Esta acción no se puede
            deshacer.
          </p>

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              onClick={closeDeleteModal}
              className={buttonStyles.white}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={state.modal === "loading"}
              className={buttonStyles.red}
            >
              {state.modal === "loading" ? (
                <div className={spinnerStyle} />
              ) : (
                "Eliminar"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
