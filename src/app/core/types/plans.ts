export interface PlanFeatures {
  maxProducts: number | string;
  maxUsers: number;
  maxOrders: number | string;
  maxStorage: string;
  support: string;
  reports: boolean;
  multiLocation: boolean;
  apiAccess: boolean;
  customBranding: boolean;
  advancedPermissions?: boolean;
  auditLog?: boolean;
}

export interface PlanLimits {
  products: number;
  users: number;
  orders: number;
  storageBytes: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  trialDays: number;
  features: PlanFeatures;
  limits: PlanLimits;
  priceLabel: string;
  periodLabel: string;
  monthlyEquivalent?: string;
  savings?: string;
  discount?: string;
  savingLabel?: string;
  cta: string;
}

export interface PlansResponse {
  monthly: Plan[];
  annual: Plan[];
}

export interface PlansPageState {
  modal: "idle" | "loading" | "ok" | "error";
  apis: {
    plans: "idle" | "loading" | "ok" | "error";
  };
  modals: {
    signup: boolean;
  };
  buttons: Record<string, boolean>;
  plans: PlansResponse;
  interval: "monthly" | "annual";
  selectedPlan: Plan | null;
}
