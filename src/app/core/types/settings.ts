import type { LoadState } from "../../components/atoms/modal";

export interface UserProfile {
  documentType?: string;
  documentNumber: string;
  paternalSurnames?: string;
  maternalSurnames?: string;
  names: string;
  email: string;
  phone?: string;
  address?: {
    continent?: string;
    country?: string;
    state?: string;
    city?: string;
    district?: string;
    street?: string;
    number?: string;
    zip?: string;
  };
  paymentMethod?: {
    cardLastFour?: string;
    cardBrand?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardholderName?: string;
  };
}

export interface SettingsState {
  modal: LoadState;
  apis: {
    profile: LoadState;
    preferences: LoadState;
    password: LoadState;
    email: LoadState;
    delete: LoadState;
    billingSummary: LoadState;
    billingPlan: LoadState;
    billingPayment: LoadState;
  };
  buttons: {
    profile: boolean;
    preferences: boolean;
    password: boolean;
    email: boolean;
    delete: boolean;
    billingPlan: boolean;
    billingPayment: boolean;
  };
  modals: {
    deleteConfirm: boolean;
    deletePaymentMethod: boolean;
  };
  profile: UserProfile | null;
  preferences: {
    darkMode?: boolean;
    notifications?: {
      promotions?: boolean;
      updates?: boolean;
      payments?: boolean;
    };
    autoRenew?: boolean;
  } | null;
  billingSummary: {
    plan: {
      name: string;
      code: string;
      billing: string;
      status: string;
      isInTrial: boolean;
      trialDaysLeft: number;
      amount: number;
      currency: string;
    } | null;
    nextPayment: {
      date: string;
      amount: number;
      currency: string;
    } | null;
    usage: Array<{ code: string; quantity: number }>;
  } | null;
  billingPlan: {
    plan: {
      name: string;
      code: string;
      billing: string;
      status: string;
      isInTrial: boolean;
      trialDaysLeft: number;
      startedAt: string;
      endsAt: string;
      amounts: {
        monthly: number;
        annual: number;
        current: number;
        currency: string;
      };
      limits: Array<{ code: string; quantity: number }>;
      usage: Array<{ code: string; quantity: number }>;
    } | null;
    canChangePlan: boolean;
    changeReason: string;
  } | null;
  billingPayment: {
    cardLastFour?: string;
    cardBrand?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardholderName?: string;
  } | null;
}
