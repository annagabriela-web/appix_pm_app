import { z } from "zod";

export const healthStatusSchema = z.enum(["CRITICAL", "WARNING", "HEALTHY"]);

export const projectSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  clientName: z.string(),
  currentHealthStatus: healthStatusSchema,
  budgetHours: z.string(),
  consumedHours: z.string(),
  consumptionPercent: z.string(),
  progressPercent: z.string(),
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
      sortOrder: z.number(),
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

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });
