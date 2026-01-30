import { useEffect, useState } from "react";
import { notifyError } from "../../core/helpers/shared";
import { containerStyle } from "../../core/helpers/styles";
import { useModal } from "../../core/contexts/modal";

interface PlanLimit {
  code: string;
  label: string;
  description?: string;
  value: number;
  unit: string;
  period: "fixed" | "monthly" | "annual" | "daily";
}

interface Plan {
  id: string;
  name: string;
  description: string;
  highlight: boolean;
  trialDays: number;
  limits: PlanLimit[];
  features: string[];
  pricing: {
    amount: number;
    currency: string;
    cycle: "monthly" | "annual";
  };
  priceLabel: string;
  periodLabel: string;
  cta: string;
}

interface PlansState {
  loading: boolean;
  error: string | null;
  plans: {
    monthly: Plan[];
    annual: Plan[];
  };
  interval: "monthly" | "annual";
}

export default function Plans() {
  const { openModal } = useModal();
  
  const [state, setState] = useState<PlansState>({
    loading: true,
    error: null,
    plans: {
      monthly: [],
      annual: []
    },
    interval: "monthly"
  });

  const loadPlans = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`${import.meta.env.VITE_FABRICA_API_BASE_URL}/plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-product-code': import.meta.env.VITE_APPLICATION_NAME
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar planes');
      }

      const data = await response.json();
      
      const monthly: Plan[] = [];
      const annual: Plan[] = [];

      data.forEach((plan: Plan) => {
        if (plan.pricing.cycle === 'monthly') {
          monthly.push(plan);
        } else {
          annual.push(plan);
        }
      });

      setState(prev => ({
        ...prev,
        loading: false,
        plans: { monthly, annual }
      }));
    } catch (error: any) {
      const errorMessage = error?.message || "Error al cargar planes";
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      notifyError(errorMessage);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    const planCode = `${plan.id}-${state.interval}`;
    const billingLabel = state.interval === "annual" ? "Anual" : "Mensual";
    openModal("signUp", { 
      planCode, 
      planName: `${plan.name} (${billingLabel})`,
      planPrice: plan.priceLabel
    });
  };

  const toggleInterval = () => {
    setState(prev => ({
      ...prev,
      interval: prev.interval === "monthly" ? "annual" : "monthly"
    }));
  };

  const currentPlans = state.interval === "monthly" ? state.plans.monthly : state.plans.annual;

  const formatLimit = (limit: PlanLimit): string => {
    const value = limit.value === -1 ? "Ilimitado" : limit.value;
    const unit = limit.unit ? ` ${limit.unit}` : "";
    if (limit.period === "monthly") {
      return `${value}${unit} al mes`;
    }
    if (limit.period === "annual") {
      return `${value}${unit} al año`;
    }
    if (limit.period === "daily") {
      return `${value}${unit} al día`;
    }
    return `${value}${unit}`;
  };

  return (
    <div className={containerStyle}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Elige el plan perfecto para ti
        </h1>
        <p className="text-lg text-gray-600">
          Todas las opciones incluyen período de prueba gratuito
        </p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-12">
        <span className={`text-lg font-medium ${state.interval === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
          Mensual
        </span>
        <button
          type="button"
          onClick={toggleInterval}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
            state.interval === "annual" ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              state.interval === "annual" ? "translate-x-9" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-lg font-medium ${state.interval === "annual" ? "text-gray-900" : "text-gray-500"}`}>
          Anual
        </span>
        {state.interval === "annual" && (
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
            Ahorra hasta 25%
          </span>
        )}
      </div>

      {state.loading && (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!state.loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {currentPlans.map((plan, index) => {
            const isPopular = index === 1;

  return (
              <div
                key={plan.id}
                className={`relative border-2 rounded-2xl p-8 transition-all hover:shadow-xl ${
                  isPopular
                    ? "border-blue-600 shadow-lg scale-105"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Más popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.priceLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{plan.periodLabel}</p>
                  {plan.trialDays > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      {plan.trialDays} días de prueba gratis
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-lg font-medium transition mb-6 ${
                    isPopular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-3">
                  {plan.limits.map(limit => (
                    <div key={limit.code} className="flex items-start gap-3">
                      <div className="mt-1">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {limit.label}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatLimit(limit)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {feature}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
