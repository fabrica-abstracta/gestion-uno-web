import { z } from "zod";

export const bugFiltersSchema = z.object({
  code: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const bugUpsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Título es requerido"),
  description: z.string().optional(),
  status: z.enum(["open", "in-progress", "resolved", "closed"]),
  comment: z.string().optional(),
  module: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  environment: z.string().optional(),
  category: z.string().optional(),
  reportedBy: z.string().optional(),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type BugFiltersInput = z.infer<typeof bugFiltersSchema>;
export type BugUpsertInput = z.infer<typeof bugUpsertSchema>;

export const bugFiltersDefaultValues: BugFiltersInput = {
  code: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export const bugUpsertDefaultValues: BugUpsertInput = {
  title: "",
  description: "",
  status: "open",
  comment: "",
  module: "",
  stepsToReproduce: "",
  expectedBehavior: "",
  actualBehavior: "",
  environment: "",
  category: "",
  reportedBy: "",
  assignedTo: "",
  tags: [],
};
