import { z } from "zod";

export const healthStatusSchema = z.enum(["CRITICAL", "WARNING", "HEALTHY"]);

export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  clientName: z.string(),
  currentHealthStatus: healthStatusSchema,
  budgetHours: z.string(),
  clientInvoiceAmount: z.string(),
  consumedHours: z.string(),
  consumptionPercent: z.string(),
  progressPercent: z.string(),
  actualCost: z.string(),
  updatedAt: z.string(),
});

export const projectDetailSchema = projectSchema.extend({
  clientInvoiceAmount: z.string(),
  targetMargin: z.string(),
  actualCost: z.string(),
  earnedValue: z.string(),
  jiraProjectKey: z.string(),
  clockifyProjectId: z.string(),
  phases: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      estimatedHours: z.string(),
      actualHours: z.string(),
      sortOrder: z.number(),
      status: z.enum(["completed", "in_progress", "pending"]),
      progressPercent: z.string(),
      invoiceAmount: z.string().nullable(),
      invoiceDate: z.string().nullable(),
      isPaid: z.boolean(),
    })
  ),
  roleRates: z.array(
    z.object({
      id: z.number(),
      billingRole: z.number(),
      billingRoleName: z.string(),
      hourlyRate: z.string(),
    })
  ),
  latestSnapshot: z
    .object({
      id: z.number(),
      timestamp: z.string(),
      consumptionPercent: z.string(),
      progressPercent: z.string(),
      budgetConsumed: z.string(),
      earnedValue: z.string(),
      healthStatus: healthStatusSchema,
      healthScore: z.number(),
    })
    .nullable(),
  createdAt: z.string(),
});

export const burndownPointSchema = z.object({
  date: z.string(),
  budgetLine: z.string(),
  actualCostCumulative: z.string(),
  earnedValueCumulative: z.string(),
});

export const phaseComparisonSchema = z.object({
  phaseName: z.string(),
  estimatedHours: z.string(),
  actualHours: z.string(),
});

export const healthSnapshotSchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  consumptionPercent: z.string(),
  progressPercent: z.string(),
  budgetConsumed: z.string(),
  earnedValue: z.string(),
  healthStatus: healthStatusSchema,
  healthScore: z.number(),
});

export const alertSchema = z.object({
  id: z.number(),
  project: z.number(),
  projectName: z.string(),
  projectCode: z.string(),
  alertType: z.enum(["CRITICAL", "WARNING"]),
  message: z.string(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export const billingRoleSchema = z.object({
  id: z.number(),
  roleName: z.string(),
  defaultHourlyRate: z.string(),
});

export const portfolioProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  clientName: z.string(),
  currentHealthStatus: healthStatusSchema,
  budgetHours: z.string(),
  consumedHours: z.string(),
  consumptionPercent: z.string(),
  progressPercent: z.string(),
  deviation: z.string(),
});

export const userPermissionsSchema = z.object({
  canSeePortfolio: z.boolean(),
  canSeeProjects: z.boolean(),
  canSeePersonal: z.boolean(),
  canManageBillingRoles: z.boolean(),
  canSeeFinancials: z.boolean(),
});

export const meResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["PM", "DIRECTOR", "ADMIN", "CLIENT"]),
  orgId: z.number().nullable(),
  orgName: z.string(),
  orgType: z.enum(["INTERNAL", "EXTERNAL"]),
  permissions: userPermissionsSchema,
});

// --- Sprint & related schemas ---

export const sprintTaskSchema = z.object({
  id: z.number(),
  jiraKey: z.string(),
  title: z.string(),
  assignedTo: z.string(),
  hours: z.string(),
  date: z.string(),
});

export const sprintTimeEntrySchema = z.object({
  id: z.number(),
  date: z.string(),
  durationHours: z.string(),
  cost: z.string(),
  userName: z.string(),
  description: z.string(),
});

export const advanceSchema = z.object({
  id: z.number(),
  sprint: z.number(),
  taskJiraKey: z.string(),
  description: z.string(),
  status: z.enum(["pending", "accepted"]),
  presentedBy: z.string(),
  observations: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const simpleChangeRequestSchema = z.object({
  id: z.number(),
  sprint: z.number(),
  advance: z.number().nullable(),
  taskJiraKey: z.string(),
  description: z.string(),
  status: z.enum(["in_process", "pending_review", "accepted", "rejected"]),
  reviewComments: z.string(),
  draggedFromSprint: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const changeRequestSchema = z.object({
  id: z.number(),
  sprint: z.number(),
  description: z.string(),
  detail: z.string(),
  status: z.enum(["in_review", "accepted", "to_start", "in_process", "pending_acceptance", "completed"]),
  dependencies: z.string(),
  impact: z.string(),
  estimatedHours: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const sprintDetailSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["planned", "in_progress", "completed"]),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  sortOrder: z.number(),
  tasks: z.array(sprintTaskSchema),
  timeEntries: z.array(sprintTimeEntrySchema),
  advances: z.array(advanceSchema),
  simpleChanges: z.array(simpleChangeRequestSchema),
  changeRequests: z.array(changeRequestSchema),
  createdAt: z.string(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });
