import { Link, Outlet } from "react-router-dom";
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
import { notifyError } from "./app/core/helpers/shared";
import Modal from "./app/components/atoms/modal";

export default function CTA() {
  const { isAuth, logout, signIn, signUp } = useIdentity();
  const { modals, openModal, closeModal } = useModal();
  const [sidebarOpenMenu, setSidebarOpenMenu] = useState(false);
  const [sidebarOpenAccount, setSidebarOpenAccount] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [page, setPage] = useState(1);
  const [recoverSuccess, setRecoverSuccess] = useState(false);

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

              <button
                type="button"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github`}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Continuar con GitHub
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
            <p className="mt-1 text-sm text-gray-600">Regístrate para comenzar a usar Mock API</p>
          </div>

          <form onSubmit={signUpForm.handleSubmit(async (data) => {
            try {
              await signUp({ email: data.email, password: data.password });
              closeModal("signUp");
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

              <button
                type="button"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github`}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Continuar con GitHub
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

      <Modal open={modals.report} onClose={() => closeModal("report")}>
        <div className="max-w-[520px] mx-auto rounded-lg bg-white p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Informar de un error
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Cuéntanos qué salió mal. Esto nos ayuda a mejorar la plataforma.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del problema
              </label>
              <input
                type="text"
                placeholder="Ej: Error al crear un OpenAPI"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                rows={5}
                placeholder="Describe qué estabas haciendo y qué ocurrió..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
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
              <button type="button" onClick={() => closeModal("report")} className={buttonStyles.white}>Cancelar</button>
              <button type="button" className={buttonStyles.red}>Enviar reporte</button>
            </div>
          </div>
        </div>
      </Modal>

      <Sidebar side="left" open={sidebarOpenMenu} onClose={() => setSidebarOpenMenu(false)}>
        <div className="h-full w-72 bg-white flex flex-col shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
            <span className="text-lg font-semibold">Módulos</span>
            <button type="button" onClick={() => setSidebarOpenMenu(false)} className="text-gray-500 hover:text-black">
              {icons.close}
            </button>
          </div>

          <div className="flex flex-col p-4 space-y-2">
            {[{ label: "OpenAPIs", to: "/openapis" }].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpenMenu(false)}
                className="px-3 py-2 rounded hover:bg-gray-100 text-gray-700 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </Sidebar>

      <Sidebar side="right" open={sidebarOpenAccount} onClose={() => setSidebarOpenAccount(false)}>
        <div className="h-full w-72 bg-white flex flex-col shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
            <span className="text-lg font-semibold">{isAuth ? "Cuenta" : "Menú"}</span>
            <button type="button" onClick={() => setSidebarOpenAccount(false)} className="text-gray-500 hover:text-black">
              ❌
            </button>
          </div>

          <div className="flex-1 p-4 space-y-2">
            {isAuth
              ? [
                { to: "settings", label: "Configuraciones" },
                { to: "report-bug", label: "Informar de un error", modal: "report" as const },
                { to: "manual", label: "Manual de uso" },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={(e) => {
                    setSidebarOpenAccount(false);
                    if (item.modal) {
                      e.preventDefault();
                      openModal(item.modal);
                    }
                  }}
                  className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
                >
                  {item.label}
                </Link>
              ))
              : [
                { to: "plans", label: "Planes" },
              ].map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  onClick={() => setSidebarOpenAccount(false)}
                  className="block px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
                >
                  {item.label}
                </Link>
              ))}
          </div>

          <div className="p-4 border-t border-gray-300">
            {isAuth ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setSidebarOpenAccount(false);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded"
              >
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
                  className={buttonStyles.white}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("signUp");
                    setSidebarOpenAccount(false);
                  }}
                  className={buttonStyles.black}
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </div>
      </Sidebar>

      <div className="min-h-screen flex flex-col">
        <Header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-300 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center px-4 h-16">
            <div className="flex items-center gap-3">
              {isAuth && (
                <button type="button" onClick={() => setSidebarOpenMenu(true)} className="p-2 hover:bg-gray-100 rounded">
                  {icons.menu}
                </button>
              )}

              <Link to="/" className="hidden md:flex gap-2">
                <span className="text-xl font-extrabold">Gestión uno</span>
                <span className="text-sm italic text-gray-500">v1.0.0</span>
              </Link>
            </div>

            <button type="button" onClick={() => setSidebarOpenAccount(true)} className="p-2 hover:bg-gray-100 rounded">
              {isAuth ? <Avatar /> : icons.menu}
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
