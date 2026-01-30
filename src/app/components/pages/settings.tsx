import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../core/config/axios";
import Breadcrumb from "../molecules/breadcrumb";
import Tabs from "../molecules/tabs";
import Input from "../atoms/input";
import LoadingButton from "../atoms/loading-button";
import Modal from "../atoms/modal";
import {
  buttonStyles,
  containerStyle,
  flexColGap3,
  flexJustifyEndGap3,
  modalStyle,
} from "../../core/helpers/styles";
import {
  setModalState,
  setApiState,
  setButtonState,
  notifySuccess,
  notifyError,
} from "../../core/helpers/shared";
import type { SettingsState } from "../../core/types/settings";
import {
  profileUpdateSchema,
  profileUpdateDefaultValues,
  passwordUpdateSchema,
  passwordUpdateDefaultValues,
  deleteAccountSchema,
  deleteAccountDefaultValues,
  paymentMethodSchema,
  paymentMethodDefaultValues,
  type ProfileUpdateInput,
  type PasswordUpdateInput,
  type DeleteAccountInput,
  type PaymentMethodInput,
} from "../../core/validations/settings";
import { useIdentity } from "../../core/contexts/identity";

export default function Settings() {
  const { logout } = useIdentity();
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [activeSubTab, setActiveSubTab] = useState<string>("profile-edit");
  const [activeBillingTab, setActiveBillingTab] = useState<string>("summary");
  const [state, setState] = useState<SettingsState>({
    modal: "idle",
    apis: {
      profile: "idle",
      preferences: "idle",
      password: "idle",
      email: "idle",
      delete: "idle",
      billingSummary: "idle",
      billingPlan: "idle",
      billingPayment: "idle",
    },
    buttons: {
      profile: false,
      preferences: false,
      password: false,
      email: false,
      delete: false,
      billingPlan: false,
      billingPayment: false,
    },
    modals: {
      deleteConfirm: false,
      deletePaymentMethod: false,
    },
    profile: null,
    preferences: null,
    billingSummary: null,
    billingPlan: null,
    billingPayment: null,
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { isValid: isProfileValid },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: profileUpdateDefaultValues,
    mode: "onChange",
  });

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { isValid: isPasswordValid, errors: passwordErrors },
  } = useForm<PasswordUpdateInput>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: passwordUpdateDefaultValues,
    mode: "onChange",
  });

  const {
    register: deleteRegister,
    handleSubmit: handleDeleteSubmit,
    reset: resetDelete,
    formState: { isValid: isDeleteValid },
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: deleteAccountDefaultValues,
    mode: "onChange",
  });

  const {
    register: paymentRegister,
    handleSubmit: handlePaymentSubmit,
    reset: resetPayment,
    formState: { isValid: isPaymentValid, errors: paymentErrors },
  } = useForm<PaymentMethodInput>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: paymentMethodDefaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    // Cargar datos según la pestaña activa
    if (activeSubTab === "profile-edit" && state.apis.profile === "idle") {
      loadProfile();
    } else if (activeSubTab === "preferences" && state.apis.preferences === "idle") {
      loadPreferences();
    } else if (activeTab === "billing") {
      if (activeBillingTab === "summary" && state.apis.billingSummary === "idle") {
        loadBillingSummary();
      } else if (activeBillingTab === "plan" && state.apis.billingPlan === "idle") {
        loadBillingPlan();
      } else if (activeBillingTab === "payment" && state.apis.billingPayment === "idle") {
        loadBillingPayment();
      }
    }
  }, [activeSubTab, activeTab, activeBillingTab]);

  const loadProfile = () => {
    setApiState(setState, "profile", "loading");
    api
      .get("/settings/profile")
      .then((res) => {
        const profile = res.data;
        setState((prev) => ({ ...prev, profile }));
        
        resetProfile({
          documentType: profile.documentType || "",
          documentNumber: profile.documentNumber || "",
          paternalSurnames: profile.paternalSurnames || "",
          maternalSurnames: profile.maternalSurnames || "",
          names: profile.names || "",
          phone: profile.phone || "",
          address: profile.address || profileUpdateDefaultValues.address,
        });
        
        setApiState(setState, "profile", "ok");
      })
      .catch((err) => {
        setApiState(setState, "profile", "error");
        notifyError(err);
      });
  };

  const loadPreferences = () => {
    setApiState(setState, "preferences", "loading");
    api
      .get("/settings/preferences")
      .then((res) => {
        const preferences = res.data;
        setState((prev) => ({ ...prev, preferences }));
        setApiState(setState, "preferences", "ok");
      })
      .catch((err) => {
        setApiState(setState, "preferences", "error");
        notifyError(err);
      });
  };

  const loadBillingSummary = () => {
    setApiState(setState, "billingSummary", "loading");
    api
      .get("/settings/billing/summary")
      .then((res) => {
        setState((prev) => ({ ...prev, billingSummary: res.data }));
        setApiState(setState, "billingSummary", "ok");
      })
      .catch((err) => {
        setApiState(setState, "billingSummary", "error");
        notifyError(err);
      });
  };

  const loadBillingPlan = () => {
    setApiState(setState, "billingPlan", "loading");
    api
      .get("/settings/billing/plan")
      .then((res) => {
        setState((prev) => ({ ...prev, billingPlan: res.data }));
        setApiState(setState, "billingPlan", "ok");
      })
      .catch((err) => {
        setApiState(setState, "billingPlan", "error");
        notifyError(err);
      });
  };

  const loadBillingPayment = () => {
    setApiState(setState, "billingPayment", "loading");
    api
      .get("/settings/billing/payment-method")
      .then((res) => {
        setState((prev) => ({ ...prev, billingPayment: res.data.paymentMethod }));
        setApiState(setState, "billingPayment", "ok");
      })
      .catch((err) => {
        setApiState(setState, "billingPayment", "error");
        notifyError(err);
      });
  };

  const handlePreferencesChange = (field: string, value: any) => {
    setState((prev) => {
      if (!prev.preferences) return prev;
      
      if (field.includes('notifications.')) {
        const notifField = field.split('.')[1];
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            notifications: {
              ...prev.preferences.notifications,
              [notifField]: value
            }
          }
        };
      }
      
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: value
        }
      };
    });
  };

  const onProfileUpdate = (data: ProfileUpdateInput) => {
    setButtonState(setState, "profile", true);
    api
      .patch("/settings/profile", data)
      .then((res) => {
        notifySuccess(res.data.message || "Información actualizada correctamente");
        loadProfile();
        setButtonState(setState, "profile", false);
      })
      .catch((err) => {
        notifyError(err);
        setButtonState(setState, "profile", false);
      });
  };

  const onPasswordUpdate = (data: PasswordUpdateInput) => {
    setButtonState(setState, "password", true);
    api
      .patch("/settings/password", data)
      .then((res) => {
        notifySuccess(res.data.message || "Contraseña actualizada correctamente");
        resetPassword();
        setButtonState(setState, "password", false);
      })
      .catch((err) => {
        notifyError(err);
        setButtonState(setState, "password", false);
      });
  };

  const onPreferencesUpdate = () => {
    if (!state.preferences) return;
    
    setButtonState(setState, "preferences", true);
    api
      .patch("/settings/preferences", state.preferences)
      .then((res) => {
        notifySuccess(res.data.message || "Preferencias actualizadas correctamente");
        setButtonState(setState, "preferences", false);
      })
      .catch((err) => {
        notifyError(err);
        setButtonState(setState, "preferences", false);
      });
  };

  const onDeleteAccount = (data: DeleteAccountInput) => {
    setButtonState(setState, "delete", true);
    api
      .delete("/settings/account", { data })
      .then((res) => {
        notifySuccess(res.data.message || "Cuenta eliminada correctamente");
        setModalState(setState, "deleteConfirm", false);
        setTimeout(() => {
          logout();
        }, 1500);
      })
      .catch((err) => {
        notifyError(err);
        setButtonState(setState, "delete", false);
      });
  };

  const onAddPaymentMethod = (data: PaymentMethodInput) => {
    setButtonState(setState, "billingPayment", true);
    api
      .post("/settings/billing/payment-method", data)
      .then((res) => {
        notifySuccess(res.data.message || "Método de pago guardado correctamente");
        setState((prev) => ({ ...prev, apis: { ...prev.apis, billingPayment: "idle" } }));
        setModalState(setState, "deletePaymentMethod", false);
        resetPayment();
        loadBillingPayment();
        setButtonState(setState, "billingPayment", false);
      })
      .catch((err) => {
        notifyError(err);
        setButtonState(setState, "billingPayment", false);
      });
  };

  const onDeletePaymentMethod = () => {
    setButtonState(setState, "billingPayment", true);
    api
      .delete("/settings/billing/payment-method")
      .then((res) => {
        notifySuccess(res.data.message || "Método de pago eliminado correctamente");
        setState((prev) => ({ ...prev, billingPayment: null }));
        setButtonState(setState, "billingPayment", false);
      })
      .catch((err) => {
        notifyError(err);
        setButtonState(setState, "billingPayment", false);
      });
  };

  return (
    <div className={containerStyle}>
      <Breadcrumb
        items={[
          { label: "Inicio", to: "/" },
          { label: "Configuraciones", to: "" },
        ]}
      />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Configuraciones</h1>
        <p className="text-gray-600">
          Administra tu cuenta, preferencias y seguridad desde este panel de control.
        </p>
      </div>

      <Tabs
        activeId={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          if (tabId === "profile") setActiveSubTab("profile-edit");
          if (tabId === "security") setActiveSubTab("password");
          if (tabId === "billing") setActiveSubTab("summary");
        }}
        items={[
          {
            id: "profile",
            label: "Cuenta",
            content: (
              <Tabs
                activeId={activeSubTab}
                onTabChange={(tabId) => {
                  setActiveSubTab(tabId);
                  if (tabId === "profile-edit" && state.apis.profile === "idle") {
                    loadProfile();
                  } else if (tabId === "preferences" && state.apis.preferences === "idle") {
                    loadPreferences();
                  }
                }}
                items={[
                  {
                    id: "profile-edit",
                    label: "Información personal",
                    content: (
                      <div className={flexColGap3}>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Información personal</h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Actualiza tu información personal y de contacto
                          </p>
                        </div>

                        {state.apis.profile === "loading" && (
                          <div className="flex justify-center py-8">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}

                        {state.apis.profile === "ok" && (
                          <form onSubmit={handleProfileSubmit(onProfileUpdate)} className={flexColGap3}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                label="Tipo de documento"
                                placeholder="DNI, Pasaporte, etc."
                                {...profileRegister("documentType")}
                              />
                              <Input
                                label="Número de documento *"
                                placeholder="12345678"
                                {...profileRegister("documentNumber")}
                              />
                            </div>

                            <Input
                              label="Nombres *"
                              placeholder="Juan Carlos"
                              {...profileRegister("names")}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Input
                                label="Apellido paterno"
                                placeholder="Pérez"
                                {...profileRegister("paternalSurnames")}
                              />
                              <Input
                                label="Apellido materno"
                                placeholder="García"
                                {...profileRegister("maternalSurnames")}
                              />
                            </div>

                            <Input
                              label="Teléfono"
                              placeholder="+51 999 999 999"
                              {...profileRegister("phone")}
                            />

                            <div className="border-t pt-4">
                              <h3 className="text-lg font-medium text-gray-900 mb-3">Dirección</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                  label="País"
                                  placeholder="Perú"
                                  {...profileRegister("address.country")}
                                />
                                <Input
                                  label="Estado/Región"
                                  placeholder="Lima"
                                  {...profileRegister("address.state")}
                                />
                                <Input
                                  label="Ciudad"
                                  placeholder="Lima"
                                  {...profileRegister("address.city")}
                                />
                                <Input
                                  label="Distrito"
                                  placeholder="Miraflores"
                                  {...profileRegister("address.district")}
                                />
                                <Input
                                  label="Calle"
                                  placeholder="Av. Principal"
                                  {...profileRegister("address.street")}
                                />
                                <Input
                                  label="Número"
                                  placeholder="123"
                                  {...profileRegister("address.number")}
                                />
                                <Input
                                  label="Código postal"
                                  placeholder="15074"
                                  {...profileRegister("address.zip")}
                                />
                              </div>
                            </div>

                            <div className={flexJustifyEndGap3}>
                              <LoadingButton
                                type="submit"
                                isLoading={state.buttons.profile}
                                loadingText="Guardando..."
                                normalText="Guardar cambios"
                                disabled={!isProfileValid || state.buttons.profile}
                                className={buttonStyles.blue}
                              />
                            </div>
                          </form>
                        )}
                      </div>
                    )
                  },
                  {
                    id: "preferences",
                    label: "Preferencias",
                    content: (
                      <div className={flexColGap3}>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">Preferencias</h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Configura tus preferencias de cuenta
                          </p>
                        </div>

                        {state.apis.preferences === "loading" && (
                          <div className="flex justify-center py-8">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}

                        {state.apis.preferences === "ok" && state.preferences && (
                          <div className={flexColGap3}>
                            <div className="border border-gray-200 rounded-lg p-6">
                              <h3 className="text-base font-semibold text-gray-900 mb-4">Notificaciones por email</h3>
                              <div className="space-y-4">
                                <label className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Promociones</p>
                                    <p className="text-xs text-gray-600">Recibe ofertas y promociones especiales</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={state.preferences.notifications?.promotions || false}
                                    onChange={(e) => handlePreferencesChange('notifications.promotions', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Actualizaciones</p>
                                    <p className="text-xs text-gray-600">Notificaciones sobre nuevas características</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={state.preferences.notifications?.updates || false}
                                    onChange={(e) => handlePreferencesChange('notifications.updates', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                </label>
                                <label className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Pagos</p>
                                    <p className="text-xs text-gray-600">Notificaciones de transacciones y pagos</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={state.preferences.notifications?.payments ?? true}
                                    onChange={(e) => handlePreferencesChange('notifications.payments', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-6">
                              <h3 className="text-base font-semibold text-gray-900 mb-4">Apariencia</h3>
                              <div className="space-y-4">
                                <label className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Modo oscuro</p>
                                    <p className="text-xs text-gray-600">Activa el tema oscuro de la interfaz</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={state.preferences.darkMode || false}
                                    onChange={(e) => handlePreferencesChange('darkMode', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg p-6">
                              <h3 className="text-base font-semibold text-gray-900 mb-4">Suscripción</h3>
                              <div className="space-y-4">
                                <label className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">Renovación automática</p>
                                    <p className="text-xs text-gray-600">Renueva automáticamente tu suscripción</p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={state.preferences.autoRenew || false}
                                    onChange={(e) => handlePreferencesChange('autoRenew', e.target.checked)}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                  />
                                </label>
                              </div>
                            </div>

                            <div className={flexJustifyEndGap3}>
                              <LoadingButton
                                type="button"
                                onClick={onPreferencesUpdate}
                                isLoading={state.buttons.preferences}
                                loadingText="Guardando..."
                                normalText="Guardar cambios"
                                disabled={state.buttons.preferences}
                                className={buttonStyles.blue}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ),
                  }
                ]}
                orientation="horizontal"
              />
            ),
          },
          {
            id: "security",
            label: "Contraseña y autenticación",
            content: (
              <div className={flexColGap3}>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestiona tu contraseña y email de acceso
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar contraseña</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    La nueva contraseña debe tener al menos 8 caracteres
                  </p>
                  <form onSubmit={handlePasswordSubmit(onPasswordUpdate)} className={flexColGap3}>
                    <Input
                      label="Contraseña actual *"
                      type="password"
                      placeholder="••••••••"
                      error={passwordErrors.currentPassword?.message}
                      {...passwordRegister("currentPassword")}
                    />
                    <Input
                      label="Nueva contraseña *"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      error={passwordErrors.newPassword?.message}
                      {...passwordRegister("newPassword")}
                    />
                    <Input
                      label="Confirmar nueva contraseña *"
                      type="password"
                      placeholder="Repite la nueva contraseña"
                      error={passwordErrors.confirmPassword?.message}
                      {...passwordRegister("confirmPassword")}
                    />
                    <div className={flexJustifyEndGap3}>
                      <LoadingButton
                        type="submit"
                        isLoading={state.buttons.password}
                        loadingText="Actualizando..."
                        normalText="Actualizar contraseña"
                        disabled={!isPasswordValid || state.buttons.password}
                        className={buttonStyles.blue}
                      />
                    </div>
                  </form>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Email de cuenta</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Email actual: <span className="font-medium">{state.profile?.email}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Para cambiar tu email, contacta con soporte técnico
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: "billing",
            label: "Facturación y licencias",
            content: (
              <div className={flexColGap3}>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Facturación y uso</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administra tu suscripción, pagos y facturación
                  </p>
                </div>

                <Tabs
                  activeId={activeBillingTab}
                  onTabChange={(tabId) => {
                    setActiveBillingTab(tabId);
                    if (tabId === "summary" && state.apis.billingSummary === "idle") {
                      loadBillingSummary();
                    } else if (tabId === "plan" && state.apis.billingPlan === "idle") {
                      loadBillingPlan();
                    } else if (tabId === "payment" && state.apis.billingPayment === "idle") {
                      loadBillingPayment();
                    }
                  }}
                  items={[
                    {
                      id: "summary",
                      label: "Resumen",
                      content: (
                        <div className={flexColGap3}>
                          {state.apis.billingSummary === "loading" && (
                            <div className="flex justify-center py-8">
                              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}

                          {state.apis.billingSummary === "ok" && state.billingSummary && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-lg p-6">
                                  <h3 className="text-sm font-medium text-gray-500 mb-1">Plan activo</h3>
                                  {state.billingSummary.plan ? (
                                    <>
                                      <p className="text-2xl font-bold text-gray-900">{state.billingSummary.plan.name}</p>
                                      <p className="text-sm text-gray-600 mt-2">
                                        {state.billingSummary.plan.currency} ${state.billingSummary.plan.amount.toFixed(2)}/{state.billingSummary.plan.billing === "monthly" ? "mes" : "año"}
                                      </p>
                                      {state.billingSummary.plan.isInTrial && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                                          Prueba - {state.billingSummary.plan.trialDaysLeft} días restantes
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-lg text-gray-500">Sin plan activo</p>
                                  )}
                                </div>
                                <div className="border border-gray-200 rounded-lg p-6">
                                  <h3 className="text-sm font-medium text-gray-500 mb-1">Próximo pago</h3>
                                  {state.billingSummary.nextPayment ? (
                                    <>
                                      <p className="text-2xl font-bold text-gray-900">
                                        {new Date(state.billingSummary.nextPayment.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-2">
                                        {state.billingSummary.nextPayment.currency} ${state.billingSummary.nextPayment.amount.toFixed(2)}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-lg text-gray-500">Sin pagos pendientes</p>
                                  )}
                                </div>
                              </div>

                              {state.billingSummary.usage.length > 0 && (
                                <div className="border border-gray-200 rounded-lg p-6">
                                  <h3 className="text-base font-semibold text-gray-900 mb-4">Uso del mes actual</h3>
                                  <div className="space-y-3">
                                    {state.billingSummary.usage.map((item, idx) => (
                                      <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-600 capitalize">{item.code.replace('_', ' ')}</span>
                                          <span className="font-medium text-gray-900">{item.quantity}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      ),
                    },
                    {
                      id: "plan",
                      label: "Mi plan",
                      content: (
                        <div className={flexColGap3}>
                          {state.apis.billingPlan === "loading" && (
                            <div className="flex justify-center py-8">
                              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}

                          {state.apis.billingPlan === "ok" && state.billingPlan && state.billingPlan.plan && (
                            <>
                              <div className="border border-blue-200 bg-blue-50 rounded-lg p-6">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{state.billingPlan.plan.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">Facturación {state.billingPlan.plan.billing === "monthly" ? "mensual" : "anual"}</p>
                                  </div>
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {state.billingPlan.plan.status === "active" ? "Activo" : "Inactivo"}
                                  </span>
                                </div>
                                {state.billingPlan.plan.isInTrial && (
                                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                      <strong>Período de prueba:</strong> {state.billingPlan.plan.trialDaysLeft} días restantes
                                    </p>
                                  </div>
                                )}
                                <div className="mt-4">
                                  <p className="text-3xl font-bold text-gray-900">
                                    {state.billingPlan.plan.amounts.currency} ${state.billingPlan.plan.amounts.current.toFixed(2)}
                                    <span className="text-base font-normal text-gray-600">/{state.billingPlan.plan.billing === "monthly" ? "mes" : "año"}</span>
                                  </p>
                                </div>
                                <ul className="mt-4 space-y-2">
                                  {state.billingPlan.plan.limits.map((limit, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-700">
                                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      {limit.code === "products" && `Hasta ${limit.quantity} productos`}
                                      {limit.code === "users" && `Hasta ${limit.quantity} usuarios`}
                                      {limit.code === "support" && `Soporte ${limit.quantity}`}
                                      {limit.code === "reports" && `Reportes ${limit.quantity}`}
                                    </li>
                                  ))}
                                </ul>
                                {state.billingPlan.plan.usage.length > 0 && (
                                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uso actual</h4>
                                    {state.billingPlan.plan.usage.map((item, idx) => (
                                      <div key={idx} className="text-sm text-gray-600">
                                        {item.code}: {item.quantity}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="mt-6 pt-6 border-t border-blue-200">
                                  {!state.billingPlan.canChangePlan && state.billingPlan.changeReason && (
                                    <p className="text-sm text-gray-600 mb-3">
                                      {state.billingPlan.changeReason}
                                    </p>
                                  )}
                                  <div className="flex gap-3">
                                    <button 
                                      type="button" 
                                      className={buttonStyles.white}
                                      disabled={!state.billingPlan.canChangePlan}
                                    >
                                      Cambiar plan
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ),
                    },
                    {
                      id: "payment",
                      label: "Método de pago",
                      content: (
                        <div className={flexColGap3}>
                          {state.apis.billingPayment === "loading" && (
                            <div className="flex justify-center py-8">
                              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}

                          {state.apis.billingPayment === "ok" && (
                            <>
                              <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">Métodos de pago guardados</h3>
                                <p className="text-sm text-gray-600">Administra tus tarjetas y métodos de pago</p>
                              </div>

                              {state.billingPayment ? (
                                <div className="space-y-3">
                                  <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M0 4a2 2 0 012-2h20a2 2 0 012 2v2H0V4zm0 4h24v10a2 2 0 01-2 2H2a2 2 0 01-2-2V8zm6 6a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1z"/>
                                        </svg>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {state.billingPayment.cardBrand} •••• {state.billingPayment.cardLastFour}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Expira {state.billingPayment.expiryMonth}/{state.billingPayment.expiryYear}
                                        </p>
                                        <p className="text-xs text-gray-500">{state.billingPayment.cardholderName}</p>
                                      </div>
                                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                        Principal
                                      </span>
                                    </div>
                                    <LoadingButton
                                      type="button"
                                      onClick={onDeletePaymentMethod}
                                      isLoading={state.buttons.billingPayment}
                                      loadingText="Eliminando..."
                                      normalText="Eliminar"
                                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                  </svg>
                                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay métodos de pago</h3>
                                  <p className="mt-1 text-sm text-gray-500">Agrega una tarjeta para realizar pagos automáticos</p>
                                  <button
                                    type="button"
                                    onClick={() => setModalState(setState, "deletePaymentMethod", true)}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    + Agregar método de pago
                                  </button>
                                </div>
                              )}

                              {state.billingPayment && (
                                <button
                                  type="button"
                                  onClick={() => setModalState(setState, "deletePaymentMethod", true)}
                                  className={buttonStyles.white}
                                >
                                  + Actualizar método de pago
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ),
                    },
                    {
                      id: "history",
                      label: "Historial de pagos",
                      content: (
                        <div className={flexColGap3}>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 mb-1">Historial de pagos</h3>
                            <p className="text-sm text-gray-600">Revisa tus facturas y pagos anteriores</p>
                          </div>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fecha
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descripción
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Monto
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Estado
                                  </th>
                                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Factura
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    15 Ene 2026
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    Plan Profesional - Enero 2026
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    $49.99
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Pagado
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button type="button" className="text-blue-600 hover:text-blue-800">
                                      Descargar
                                    </button>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    15 Dic 2025
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    Plan Profesional - Diciembre 2025
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    $49.99
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Pagado
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button type="button" className="text-blue-600 hover:text-blue-800">
                                      Descargar
                                    </button>
                                  </td>
                                </tr>
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    15 Nov 2025
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    Plan Profesional - Noviembre 2025
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    $49.99
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Pagado
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button type="button" className="text-blue-600 hover:text-blue-800">
                                      Descargar
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ),
                    },
                  ]}
                  orientation="horizontal"
                />
              </div>
            ),
          },
          {
            id: "delete",
            label: "Eliminar cuenta",
            content: (
              <div className={flexColGap3}>
                <div>
                  <h2 className="text-xl font-semibold text-red-600">Zona peligrosa</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Acciones irreversibles en tu cuenta
                  </p>
                </div>

                <div className="border border-red-200 bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-red-900 mb-2">Eliminar cuenta</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán todos tus datos y no podrás recuperar tu cuenta.
                  </p>
                  <button
                    type="button"
                    onClick={() => setModalState(setState, "deleteConfirm", true)}
                    className={buttonStyles.red}
                  >
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            ),
          },
        ]}
        orientation="vertical"
      />

      <Modal
        open={state.modals.deleteConfirm}
        onClose={() => {
          setModalState(setState, "deleteConfirm", false);
          resetDelete();
        }}
      >
        <div className={modalStyle}>
          <div>
            <h2 className="text-xl font-semibold text-red-600">Confirmar eliminación</h2>
            <p className="text-sm text-gray-600 mt-2">
              Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.
            </p>
          </div>

          <form onSubmit={handleDeleteSubmit(onDeleteAccount)} className={flexColGap3}>
            <Input
              label="Contraseña *"
              type="password"
              placeholder="••••••••"
              {...deleteRegister("password")}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escribe "ELIMINAR" para confirmar *
              </label>
              <input
                type="text"
                placeholder="ELIMINAR"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                {...deleteRegister("confirmation")}
              />
            </div>

            <div className={flexJustifyEndGap3}>
              <button
                type="button"
                onClick={() => {
                  setModalState(setState, "deleteConfirm", false);
                  resetDelete();
                }}
                className={buttonStyles.white}
              >
                Cancelar
              </button>
              <LoadingButton
                type="submit"
                isLoading={state.buttons.delete}
                loadingText="Eliminando..."
                normalText="Eliminar cuenta"
                disabled={!isDeleteValid || state.buttons.delete}
                className={buttonStyles.red}
              />
            </div>
          </form>
        </div>
      </Modal>

      <Modal
        open={state.modals.deletePaymentMethod}
        onClose={() => {
          setModalState(setState, "deletePaymentMethod", false);
          resetPayment();
        }}
      >
        <div className={`${modalStyle}  max-w-[720px] mx-auto`}>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Agregar método de pago</h2>
            <p className="text-sm text-gray-600 mt-2">
              Ingresa los datos de tu tarjeta de crédito o débito
            </p>
          </div>

          <form onSubmit={handlePaymentSubmit(onAddPaymentMethod)} className={flexColGap3}>
            <Input
              label="Número de tarjeta *"
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              {...paymentRegister("cardNumber")}
              error={paymentErrors.cardNumber?.message}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes de expiración *
                </label>
                <input
                  type="text"
                  placeholder="MM"
                  maxLength={2}
                  className={`w-full rounded-lg border ${paymentErrors.expiryMonth ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  {...paymentRegister("expiryMonth")}
                />
                {paymentErrors.expiryMonth && (
                  <p className="mt-1 text-xs text-red-600">{paymentErrors.expiryMonth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año de expiración *
                </label>
                <input
                  type="text"
                  placeholder="AAAA"
                  maxLength={4}
                  className={`w-full rounded-lg border ${paymentErrors.expiryYear ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  {...paymentRegister("expiryYear")}
                />
                {paymentErrors.expiryYear && (
                  <p className="mt-1 text-xs text-red-600">{paymentErrors.expiryYear.message}</p>
                )}
              </div>
            </div>

            <Input
              label="CVV *"
              type="text"
              placeholder="123"
              maxLength={3}
              {...paymentRegister("cvv")}
              error={paymentErrors.cvv?.message}
            />

            <Input
              label="Nombre del titular *"
              type="text"
              placeholder="JUAN PEREZ"
              {...paymentRegister("cardholderName")}
              error={paymentErrors.cardholderName?.message}
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Nota de seguridad:</strong> Esta información se encripta antes de almacenarse. En producción, se recomienda usar un procesador de pagos como Stripe.
              </p>
            </div>

            <div className={flexJustifyEndGap3}>
              <button
                type="button"
                onClick={() => {
                  setModalState(setState, "deletePaymentMethod", false);
                  resetPayment();
                }}
                className={buttonStyles.white}
              >
                Cancelar
              </button>
              <LoadingButton
                type="submit"
                isLoading={state.buttons.billingPayment}
                loadingText="Guardando..."
                normalText="Guardar método de pago"
                disabled={!isPaymentValid || state.buttons.billingPayment}
                className={buttonStyles.blue}
              />
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
