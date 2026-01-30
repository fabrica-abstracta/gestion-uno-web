import type { LoadState } from "../../components/atoms/modal";

export interface BugRow {
  id: string;
  code: string;
  title: string;
  description: string;
  severity: string;
  severityLabel?: {
    key: string;
    label: string;
    color: string;
  };
  status: string;
  statusLabel?: {
    key: string;
    label: string;
    color: string;
  };
  module: string;
  category: string | null;
  reportedBy: string | null;
  assignedTo: string | null;
  stepsToReproduce: string;
  expectedBehavior: string;
  actualBehavior: string;
  environment: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BugsState {
  modal: LoadState;

  apis: {
    detail: LoadState;
    upsert: LoadState;
    delete: LoadState;
    pagination: LoadState;
  };

  modals: {
    upsert: boolean;
    delete: boolean;
    detail: boolean;
  };

  buttons: {
    upsert: boolean;
    delete: boolean;
  };

  selections: {
    bugRow: BugRow | null;
    bugDelete: BugRow | null;
    bugDetail: BugRow | null;
  };

  bugs: {
    data: BugRow[];
    pagination: {
      page: number;
      perPage: number;
      totalItems: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
