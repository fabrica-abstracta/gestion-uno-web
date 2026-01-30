import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router-dom";
import { useModal } from "../../core/contexts/modal";
import api from "../../core/config/axios";
import Modal from "../atoms/modal";
import Input from "../atoms/input";
import Select from "../atoms/select";
import LoadingButton from "../atoms/loading-button";
import Badge from "../atoms/badge";
import {
  buttonStyles,
  flexJustifyEndGap3,
  flexWrapGap3,
  modalStyle,
  containerStyle,
} from "../../core/helpers/styles";
import { setModalState, setApiState, setButtonState, setSelectionState, setTableState, TableLoadingNode, TableEmptyNode, TableErrorNode, notifySuccess, notifyError } from "../../core/helpers/shared";
import { icons } from "../../core/helpers/icons";
import Table from "../organisms/table";
import type { BugRow, BugsState } from "../../core/types/bugs";
import {
  bugFiltersSchema,
  bugFiltersDefaultValues,
  type BugFiltersInput,
} from "../../core/validations/bugs";
import Breadcrumb from "../molecules/breadcrumb";

export default function Bugs() {
  const location = useLocation();
  const { openModal } = useModal();
  const [state, setState] = useState<BugsState>({
    modal: "idle",

    apis: {
      detail: "idle",
      upsert: "idle",
      delete: "idle",
      pagination: "idle",
    },

    modals: {
      upsert: false,
      delete: false,
      detail: false,
    },

    buttons: {
      upsert: false,
      delete: false,
    },

    selections: {
      bugRow: null,
      bugDelete: null,
      bugDetail: null,
    },

    bugs: {
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

  const {
    register: filterRegister,
    getValues: getFilterValues,
    handleSubmit: handleFilterSubmit,
    reset: resetFilters,
    setValue: setFilterValue,
    watch: watchFilter,
  } = useForm<BugFiltersInput>({
    resolver: zodResolver(bugFiltersSchema),
    defaultValues: bugFiltersDefaultValues,
  });

  const onSearch = (page: number) => {
    setApiState(setState, "pagination", "loading");

    // Filtrar valores vacíos antes de enviar
    const filters = getFilterValues();
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    api.post("/bugs", {
      ...cleanFilters,
      page,
    })
      .then(res => {
        setApiState(setState, "pagination", "ok");
        setTableState(setState, "bugs", res.data.data, res.data.pagination);
      })
      .catch((err) => {
        setApiState(setState, "pagination", "error");
        notifyError(err);
      });
  };

  useEffect(() => {
    document.title = "Gestión Uno - Incidencias";
    onSearch(1);
  }, [location.state]);

  return (
    <>
      <div className={containerStyle}>
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Incidencias", to: "/bugs" },
          ]}
        />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Gestión de Incidencias</h1>
          <p className="text-gray-600">
            Administra y da seguimiento a los reportes de incidencias y errores del sistema.
          </p>
        </div>

        <div className={flexWrapGap3}>
          <button
            onClick={() => openModal("report")}
            className={buttonStyles.red}
          >
            Reportar incidencia
          </button>
        </div>

        <form onSubmit={handleFilterSubmit(() => onSearch(1))} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Código"
              placeholder="Buscar por código"
              {...filterRegister("code")}
            />

            <Select
              label="Estado"
              placeholder="Todos"
              options={[
                { label: "Todos", value: "" },
                { label: "Abierto", value: "open" },
                { label: "En progreso", value: "in-progress" },
                { label: "Resuelto", value: "resolved" },
                { label: "Cerrado", value: "closed" },
              ]}
              value={watchFilter("status") || ""}
              onChange={(value) => setFilterValue("status", value)}
            />

            <Input
              label="Fecha desde"
              type="date"
              {...filterRegister("dateFrom")}
            />

            <Input
              label="Fecha hasta"
              type="date"
              {...filterRegister("dateTo")}
            />
          </div>

          <div className="flex gap-3 items-end flex-col md:flex-row justify-end">
            <button type="submit" className={buttonStyles.blue}>Buscar</button>
            <button
              type="button"
              onClick={() => {
                resetFilters(bugFiltersDefaultValues);
                onSearch(1);
              }}
              className={buttonStyles.white}
            >
              Limpiar
            </button>
          </div>
        </form>

        <Table
          heightClass="h-96"
          data={state.bugs.data}
          load={state.apis.pagination}
          columns={bugsColumns(setState)}
          pagination={state.bugs.pagination}
          onPageChange={(page) => onSearch(page)}
          loadingNode={<TableLoadingNode message="Cargando incidencias..." />}
          emptyNode={
            <TableEmptyNode
              title="No hay incidencias reportadas"
              description="Crea tu primera incidencia para comenzar"
              buttonText="Reportar incidencia"
              onAction={() => openModal("report")}
            />
          }
          errorNode={
            <TableErrorNode
              title="Error al cargar incidencias"
              description="No se pudieron cargar los datos"
              buttonText="Reintentar"
              onRetry={() => onSearch(state.bugs.pagination.page)}
            />
          }
        />
      </div>

      <Modal
        load={state.modal}
        open={state.modals.delete}
        onClose={() => setModalState(setState, "delete", false)}
      >
        <form className={`mx-auto max-w-[420px] ${modalStyle}`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Eliminar Incidencia</h2>
            <p className="text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar esta incidencia? Esta acción no se puede deshacer.
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

            <LoadingButton
              type="button"
              isLoading={state.buttons.delete}
              loadingText="Eliminando…"
              normalText="Eliminar"
              className={buttonStyles.red}
              onClick={() => {
                if (!state.selections.bugDelete) return;

                setApiState(setState, "delete", "loading");
                setButtonState(setState, "delete", true);

                api.delete(`/bugs/${state.selections.bugDelete.id}`)
                  .then((res) => {
                    notifySuccess(res.data);
                    onSearch(state.bugs.pagination.page);
                    setModalState(setState, "delete", false);
                    setApiState(setState, "delete", "ok");
                    setButtonState(setState, "delete", false);
                    setSelectionState(setState, "bugDelete", null);
                  })
                  .catch((err) => {
                    setApiState(setState, "delete", "error");
                    setButtonState(setState, "delete", false);
                    notifyError(err);
                  });
              }}
            />
          </div>
        </form>
      </Modal>

      <Modal
        load={state.modal}
        open={state.modals.detail}
        onRetry={() => {
          const id = state.selections.bugDetail?.id;
          if (!id) return;

          setModalState(setState, "detail", true, "loading");

          api.get(`/bugs/${id}`)
            .then(res => {
              setSelectionState(setState, "bugDetail", res.data.data);
              setModalState(setState, "detail", true, "ok");
            })
            .catch((err) => {
              setModalState(setState, "detail", true, "error");
              notifyError(err);
            });
        }}
        onClose={() => {
          setModalState(setState, "detail", false);
          setSelectionState(setState, "bugDetail", null);
        }}
      >
        <div className={`${modalStyle} max-w-[720px]`}>
          <div>
            <h2 className="text-xl font-semibold">Detalles de la Incidencia</h2>
            <p className="text-sm text-gray-500">
              Información completa del reporte
            </p>
          </div>

          {state.selections.bugDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Código</p>
                  <p className="text-sm font-semibold">{state.selections.bugDetail.code}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Estado</p>
                  {state.selections.bugDetail.statusLabel && (
                    <Badge
                      label={state.selections.bugDetail.statusLabel.label}
                      color={state.selections.bugDetail.statusLabel.color}
                    />
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Título</p>
                <p className="text-sm font-semibold">{state.selections.bugDetail.title}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Descripción</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {state.selections.bugDetail.description || "Sin descripción"}
                </p>
              </div>

              {state.selections.bugDetail.stepsToReproduce && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pasos para reproducir</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {state.selections.bugDetail.stepsToReproduce}
                  </p>
                </div>
              )}

              {state.selections.bugDetail.expectedBehavior && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Comportamiento esperado</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {state.selections.bugDetail.expectedBehavior}
                  </p>
                </div>
              )}

              {state.selections.bugDetail.actualBehavior && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Comportamiento actual</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {state.selections.bugDetail.actualBehavior}
                  </p>
                </div>
              )}

              {state.selections.bugDetail.environment && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Entorno</p>
                  <p className="text-sm text-gray-700">{state.selections.bugDetail.environment}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reportado</p>
                  <p className="text-sm">
                    {new Date(state.selections.bugDetail.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Última actualización</p>
                  <p className="text-sm">
                    {new Date(state.selections.bugDetail.updatedAt).toLocaleString("es-ES")}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className={flexJustifyEndGap3}>
            <button
              type="button"
              className={buttonStyles.blue}
              onClick={() => setModalState(setState, "detail", false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

const bugsColumns = (
  setState: React.Dispatch<React.SetStateAction<BugsState>>,
) => [
    {
      key: "code",
      header: "Código",
      render: (row: BugRow) => (
        <button
          onClick={() => {
            setSelectionState(setState, "bugDetail", row);
            setModalState(setState, "detail", true, "loading");
            api.get(`/bugs/${row.id}`)
              .then(res => {
                setSelectionState(setState, "bugDetail", res.data.data);
                setModalState(setState, "detail", true, "ok");
              })
              .catch((err) => {
                setModalState(setState, "detail", true, "error");
                notifyError(err);
              });
          }}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {row.code}
        </button>
      )
    },
    {
      key: "status",
      header: "Estado",
      render: (row: BugRow) => (
        row.statusLabel ? <Badge label={row.statusLabel.label} color={row.statusLabel.color} /> : null
      )
    },
    {
      key: "createdAt",
      header: "Fecha creación",
      render: (row: BugRow) => (
        <span className="text-sm text-gray-600">
          {new Date(row.createdAt).toLocaleDateString("es-ES")}
        </span>
      )
    },
    {
      key: "updatedAt",
      header: "Última actualización",
      render: (row: BugRow) => (
        <span className="text-sm text-gray-600">
          {new Date(row.updatedAt).toLocaleDateString("es-ES")}
        </span>
      )
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      render: (row: BugRow) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            title="Eliminar incidencia"
            onClick={() => {
              setSelectionState(setState, "bugDelete", row);
              setModalState(setState, "delete", true);
            }}
            className={buttonStyles.base}
          >
            {icons.delete}
          </button>
        </div>
      )
    }
  ];
