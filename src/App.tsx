import { Link, Outlet, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIdentity } from "./app/core/contexts/identity";
import { useModal } from "./app/core/contexts/modal";
import Sidebar from "./app/components/organisms/sidebar";
import { icons } from "./app/core/helpers/icons";
import Header from "./app/components/organisms/header";
import Avatar from "./app/components/atoms/avatar";
import Footer from "./app/components/organisms/footer";
import api from "./app/core/config/axios";
import { buttonStyles, flexJustifyEndGap3 } from "./app/core/helpers/styles";
import type { PaginationState } from "./app/components/organisms/pagination";
import Pagination from "./app/components/organisms/pagination";
import { notifyError, notifySuccess } from "./app/core/helpers/shared";
import Modal from "./app/components/atoms/modal";

export default function CTA() {
  const navigate = useNavigate();
  const { isAuth, logout, signIn, signUp } = useIdentity();
  const { modals, modalData, openModal, closeModal } = useModal();
  const [sidebarOpenMenu, setSidebarOpenMenu] = useState(false);
  const [sidebarOpenAccount, setSidebarOpenAccount] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [page, setPage] = useState(1);
  const [recoverSuccess, setRecoverSuccess] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const signInForm = useForm<{ email: string; password: string }>({
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<{ email: string; password: string; confirmPassword: string }>({
    mode: "onChange",
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const recoverForm = useForm<{ email: string }>({
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const resetForm = useForm<{ code: string; password: string; confirmPassword: string }>({
    mode: "onChange",
    defaultValues: { code: "", password: "", confirmPassword: "" },
  });

  const reportForm = useForm<{ title: string; description: string }>({
    mode: "onChange",
    defaultValues: { title: "", description: "" },
  });

  const perPage = 6;
  const pagination: PaginationState = useMemo(() => {
    const totalItems = images.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const safePage = Math.min(Math.max(1, page), totalPages);
    return {
      page: safePage,
      perPage,
      totalItems,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    };
  }, [images.length, page]);

  const pageItems = useMemo(() => {
    const start = (pagination.page - 1) * perPage;
    return images.slice(start, start + perPage);
  }, [images, pagination.page]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...images, ...Array.from(files)];
    setImages(next);
    const totalPages = Math.max(1, Math.ceil(next.length / perPage));
    setPage(totalPages);
  };

  const removeByGlobalIndex = (globalIndex: number) => {
    const next = images.filter((_, i) => i !== globalIndex);
    setImages(next);
    const totalPages = Math.max(1, Math.ceil(next.length / perPage));
    setPage((p) => Math.min(p, totalPages));
  };

  const signUpPassword = signUpForm.watch("password");
  const resetPassword = resetForm.watch("password");

  return (
    <>
      <Modal open={modals.signIn} onClose={() => closeModal("signIn")}>
        <div className="w-full max-w-[520px] mx-auto rounded-lg bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-gray-600">Accede a tu cuenta para continuar</p>
          </div>

          <form onSubmit={signInForm.handleSubmit(async (data) => {
            try {
              await signIn(data);
              closeModal("signIn");
            } catch (err) {
              notifyError(err);
            }
          })} className="space-y-4">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">O continúa con email</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...signInForm.register("email", {
                  required: "El email es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido",
                  },
                })}
              />
              {signInForm.formState.errors.email && <p className="mt-1 text-xs text-red-600">{signInForm.formState.errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...signInForm.register("password", {
                  required: "La contraseña es requerida",
                  minLength: { value: 6, message: "Mínimo 6 caracteres" },
                })}
              />
              {signInForm.formState.errors.password && <p className="mt-1 text-xs text-red-600">{signInForm.formState.errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={!signInForm.formState.isValid || signInForm.formState.isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              {signInForm.formState.isSubmitting ? "Iniciando sesión..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                closeModal("signIn");
                openModal("recover");
              }}
              className="block w-full text-blue-600 hover:text-blue-700 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
            <div className="text-gray-600">
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => {
                  closeModal("signIn");
                  openModal("signUp");
                }}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Regístrate
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modals.signUp} onClose={() => closeModal("signUp")}>
        <div className="w-full max-w-[520px] mx-auto rounded-lg bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Crear cuenta</h2>
            <p className="mt-1 text-sm text-gray-600">
              {modalData.signUp?.planName 
                ? `Regístrate para comenzar con el plan ${modalData.signUp.planName}`
                : "Regístrate para comenzar a usar Gestión Uno"}
            </p>
          </div>

          {modalData.signUp?.planName && modalData.signUp?.planPrice && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Plan {modalData.signUp.planName}</p>
                  <p className="text-xs text-gray-600 mt-1">Acceso completo a todas las funciones</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">${modalData.signUp.planPrice}</p>
                  <p className="text-xs text-gray-500">por mes</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={signUpForm.handleSubmit(async (data) => {
            try {
              const payload: any = { email: data.email, password: data.password };
              if (modalData.signUp?.planCode) {
                payload.planCode = modalData.signUp.planCode;
              }
              await signUp(payload);
              closeModal("signUp");
            } catch (err) {
              notifyError(err);
            }
          })} className="space-y-4">
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const baseUrl = import.meta.env.VITE_API_BASE_URL;
                  const planCode = modalData.signUp?.planCode;
                  const url = planCode ? `${baseUrl}/auth/google?planCode=${encodeURIComponent(planCode)}` : `${baseUrl}/auth/google`;
                  window.location.href = url;
                }}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar con Google
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">O regístrate con email</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...signUpForm.register("email", {
                  required: "El email es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido",
                  },
                })}
              />
              {signUpForm.formState.errors.email && <p className="mt-1 text-xs text-red-600">{signUpForm.formState.errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...signUpForm.register("password", {
                  required: "La contraseña es requerida",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" },
                })}
              />
              {signUpForm.formState.errors.password && <p className="mt-1 text-xs text-red-600">{signUpForm.formState.errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...signUpForm.register("confirmPassword", {
                  required: "Confirma tu contraseña",
                  validate: (value) => value === signUpPassword || "Las contraseñas no coinciden",
                })}
              />
              {signUpForm.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{signUpForm.formState.errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={!signUpForm.formState.isValid || signUpForm.formState.isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              {signUpForm.formState.isSubmitting ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => {
                closeModal("signUp");
                openModal("signIn");
              }}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Inicia sesión
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={modals.recover} onClose={() => {
        closeModal("recover");
        setRecoverSuccess(false);
      }}>
        <div className="w-full max-w-[520px] mx-auto rounded-lg bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recuperar contraseña</h2>
            <p className="mt-1 text-sm text-gray-600">Te enviaremos un código de verificación a tu email</p>
          </div>

          {recoverSuccess ? (
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm font-medium text-green-800">Código enviado</p>
              <p className="mt-1 text-xs text-green-700">Revisa tu email para continuar</p>
            </div>
          ) : (
            <form onSubmit={recoverForm.handleSubmit(async (data) => {
              try {
                await api.post(`/recover/${data.email}`);
                setRecoverSuccess(true);
                setTimeout(() => {
                  closeModal("recover");
                  openModal("reset");
                  setRecoverSuccess(false);
                }, 2000);
              } catch (err) {
                notifyError(err);
              }
            })} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  {...recoverForm.register("email", {
                    required: "El email es requerido",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido",
                    },
                  })}
                />
                {recoverForm.formState.errors.email && <p className="mt-1 text-xs text-red-600">{recoverForm.formState.errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={!recoverForm.formState.isValid || recoverForm.formState.isSubmitting}
                className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
              >
                {recoverForm.formState.isSubmitting ? "Enviando código..." : "Enviar código"}
              </button>
            </form>
          )}

          <div className="mt-6 space-y-3 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                closeModal("recover");
                openModal("reset");
              }}
              className="block w-full text-blue-600 hover:text-blue-700 hover:underline"
            >
              ¿Ya tienes un código? Úsalo aquí
            </button>
            <button
              type="button"
              onClick={() => {
                closeModal("recover");
                openModal("signIn");
              }}
              className="block w-full text-gray-600 hover:text-gray-700 hover:underline"
            >
              Volver a iniciar sesión
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={modals.reset} onClose={() => closeModal("reset")}>
        <div className="w-full max-w-[520px] mx-auto rounded-lg bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Nueva contraseña</h2>
            <p className="mt-1 text-sm text-gray-600">Ingresa el código y tu nueva contraseña</p>
          </div>

          <form onSubmit={resetForm.handleSubmit(async (data) => {
            try {
              await api.patch("/reset", { code: data.code, password: data.password });
              closeModal("reset");
            } catch (err) {
              notifyError(err);
            }
          })} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código de verificación</label>
              <input
                type="text"
                placeholder="123456"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...resetForm.register("code", {
                  required: "El código es requerido",
                  minLength: { value: 6, message: "El código debe tener 6 dígitos" },
                })}
              />
              {resetForm.formState.errors.code && <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...resetForm.register("password", {
                  required: "La contraseña es requerida",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" },
                })}
              />
              {resetForm.formState.errors.password && <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...resetForm.register("confirmPassword", {
                  required: "Confirma tu contraseña",
                  validate: (value) => value === resetPassword || "Las contraseñas no coinciden",
                })}
              />
              {resetForm.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{resetForm.formState.errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={!resetForm.formState.isValid || resetForm.formState.isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              {resetForm.formState.isSubmitting ? "Cambiando contraseña..." : "Cambiar contraseña"}
            </button>
          </form>
        </div>
      </Modal>

      <Modal open={modals.report} onClose={() => {
        closeModal("report");
        reportForm.reset();
        setImages([]);
        setPage(1);
      }}>
        <div className="max-w-[520px] mx-auto rounded-lg bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Informar de un error
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Cuéntanos qué salió mal. Esto nos ayuda a mejorar la plataforma.
            </p>
          </div>

          <form onSubmit={reportForm.handleSubmit(async (data) => {
            try {
              setReportLoading(true);
              await api.post("/bug-upsert", {
                title: data.title,
                description: data.description,
                status: "open",
              });
              notifySuccess({ message: "Reporte enviado exitosamente. Revisaremos tu incidencia pronto.", code: "SUCCESS" });
              closeModal("report");
              reportForm.reset();
              setImages([]);
              setPage(1);
              navigate("/bugs", { state: { reload: Date.now() } });
            } catch (err) {
              notifyError(err);
            } finally {
              setReportLoading(false);
            }
          })} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del problema *
              </label>
              <input
                type="text"
                placeholder="Ej: Error al crear un producto"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...reportForm.register("title", { required: "El título es requerido" })}
              />
              {reportForm.formState.errors.title && (
                <p className="mt-1 text-xs text-red-600">{reportForm.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                rows={5}
                placeholder="Describe qué estabas haciendo y qué ocurrió..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                {...reportForm.register("description", { required: "La descripción es requerida" })}
              />
              {reportForm.formState.errors.description && (
                <p className="mt-1 text-xs text-red-600">{reportForm.formState.errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adjuntar imágenes
              </label>

              <label className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <span className="text-2xl">📷</span>
                <span className="font-medium">Haz clic o arrastra imágenes</span>
                <span className="text-xs text-gray-400">
                  PNG, JPG · Se muestran 6 por página (3×2)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />
              </label>

              {images.length > 0 && (
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {pageItems.map((file, localIndex) => {
                      const globalIndex = (pagination.page - 1) * perPage + localIndex;
                      return (
                        <div
                          key={`${file.name}-${file.size}-${globalIndex}`}
                          className="relative group rounded-lg overflow-hidden border"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="h-24 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeByGlobalIndex(globalIndex)}
                            className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition"
                          >
                            ❌
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {pagination.totalPages > 1 && (
                    <Pagination pagination={pagination} onPageChange={setPage} />
                  )}
                </div>
              )}
            </div>

            <div className={flexJustifyEndGap3}>
              <button 
                type="button" 
                onClick={() => closeModal("report")} 
                className={buttonStyles.white}
                disabled={reportLoading}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className={buttonStyles.red}
                disabled={!reportForm.formState.isValid || reportLoading}
              >
                {reportLoading ? "Enviando..." : "Enviar reporte"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Sidebar side="left" open={sidebarOpenMenu} onClose={() => setSidebarOpenMenu(false)}>
        <div className="h-full w-72 bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 flex flex-col shadow-2xl">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-bold text-white">Módulos</div>
                  <div className="text-xs text-white/70">Gestión empresarial</div>
                </div>
              </div>
              <button type="button" onClick={() => setSidebarOpenMenu(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {[
              { label: "Productos", to: "/inventory", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
              { label: "Movimientos", to: "/movements", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
              { label: "Punto de venta", to: "/pos", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
              { label: "Permisos", to: "/permissions", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg> }
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpenMenu(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-600 font-medium transition-all group border border-transparent hover:border-blue-200"
              >
                <span className="text-gray-500 group-hover:text-blue-600 transition-colors">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
              <div className="flex items-center gap-2 text-xs text-gray-700 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Sistema activo</span>
              </div>
              <div className="text-xs text-gray-500">Versión 1.0.0</div>
            </div>
          </div>
        </div>
      </Sidebar>

      <Sidebar side="right" open={sidebarOpenAccount} onClose={() => setSidebarOpenAccount(false)}>
        <div className="h-full w-72 bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 flex flex-col shadow-2xl">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {isAuth ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="text-base font-bold text-white">{isAuth ? "Mi Cuenta" : "Menú"}</div>
                  <div className="text-xs text-white/70">Opciones de usuario</div>
                </div>
              </div>
              <button type="button" onClick={() => setSidebarOpenAccount(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {isAuth
              ? [
                { to: "/settings", label: "Configuraciones", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
                { to: "/bugs", label: "Informar de un error", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg> },
                { to: "/manual", label: "Manual de uso", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={() => {
                    setSidebarOpenAccount(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-600 transition-all group border border-transparent hover:border-blue-200"
                >
                  <span className="text-gray-500 group-hover:text-blue-600 transition-colors">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))
              : [
                { to: "plans", label: "Planes", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg> },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={() => setSidebarOpenAccount(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-600 transition-all group border border-transparent hover:border-blue-200"
                >
                  <span className="text-gray-500 group-hover:text-blue-600 transition-colors">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            {isAuth ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setSidebarOpenAccount(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openModal("signIn");
                    setSidebarOpenAccount(false);
                  }}
                  className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-semibold py-3 rounded-xl transition-all"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("signUp");
                    setSidebarOpenAccount(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </Sidebar>

      <div className="min-h-screen flex flex-col">
        <Header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b-4 border-blue-500">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-16">
            <div className="flex items-center gap-4">
              {isAuth && (
                <button type="button" onClick={() => setSidebarOpenMenu(true)} className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="hidden md:block">
                  <div className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Gestión Uno</div>
                  <div className="text-xs font-semibold text-gray-500">Sistema de gestión empresarial</div>
                </div>
              </Link>
            </div>

            <button type="button" onClick={() => setSidebarOpenAccount(true)} className="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all">
              {isAuth ? <Avatar /> : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </Header>

        <main className="flex-1 pt-16">
          <Outlet />
        </main>

        <Footer className="bg-white border-t border-gray-300">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              {[
                { label: "© 2025 Fábrica Abstracta", to: "/" },
                { label: "Términos", to: "/terms#terms" },
                { label: "Privacidad", to: "/terms#privacy" },
                { label: "Seguridad", to: "/terms#security" },
                { label: "Comunidad", to: "/terms#community" },
              ].map((item) => (
                <Link key={item.label} to={item.to} className="hover:text-black">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </Footer>
      </div>
    </>
  );
}
