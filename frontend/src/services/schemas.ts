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

export const crPhaseImpactItemSchema = z.object({
  crId: z.number(),
  description: z.string(),
  status: z.enum(["in_review", "accepted", "to_start", "in_process", "pending_acceptance", "completed"]),
  estimatedHours: z.string(),
  isCharged: z.boolean(),
  chargedAmount: z.string(),
});

export const crImpactSchema = z.object({
  items: z.array(crPhaseImpactItemSchema),
  totalHours: z.string(),
  totalCharged: z.string(),
  totalAbsorbed: z.string(),
  count: z.number(),
});

export const phaseSchema = z.object({
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
  invoiceFileUrl: z.string().nullable(),
  crImpact: crImpactSchema,
});

export const projectDetailSchema = projectSchema.extend({
  clientInvoiceAmount: z.string(),
  targetMargin: z.string(),
  actualCost: z.string(),
  earnedValue: z.string(),
  jiraProjectKey: z.string(),
  clockifyProjectId: z.string(),
  anticipoAmount: z.string().nullable(),
  anticipoDate: z.string().nullable(),
  anticipoFileUrl: z.string().nullable(),
  phases: z.array(phaseSchema),
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

// --- CEO Dashboard ---

export const ceoDashboardSchema = z.object({
  dateRange: z.object({
    dateFrom: z.string().nullable(),
    dateTo: z.string().nullable(),
  }),
  revenue: z.object({
    totalContracted: z.string(),
    totalInvoiced: z.string(),
    totalCollected: z.string(),
    collectionRate: z.string(),
  }),
  costs: z.object({
    totalActualCost: z.string(),
    totalBudgetHours: z.string(),
    totalConsumedHours: z.string(),
    overallMargin: z.string(),
    targetMarginAvg: z.string(),
    crAbsorbedCost: z.string(),
    crAbsorbedHours: z.string(),
  }),
  health: z.object({
    totalProjects: z.number(),
    critical: z.number(),
    warning: z.number(),
    healthy: z.number(),
    atRiskProjects: z.array(z.object({
      id: z.number(),
      name: z.string(),
      code: z.string(),
      healthStatus: healthStatusSchema,
      consumptionPercent: z.string(),
      progressPercent: z.string(),
      deviation: z.string(),
    })),
  }),
  team: z.object({
    totalMembers: z.number(),
    totalHours: z.string(),
    members: z.array(z.object({
      name: z.string(),
      hours: z.string(),
      cost: z.string(),
      projectCount: z.number(),
    })),
  }),
  teamUtilization: z.array(z.object({
    name: z.string(),
    internalHours: z.string(),
    clientHours: z.string(),
  })),
  teamFlow: z.array(z.object({
    person: z.string(),
    project: z.string(),
    isInternal: z.boolean(),
    hours: z.string(),
  })),
  hourCompliance: z.array(z.object({
    name: z.string(),
    month: z.string(),
    hours: z.string(),
  })),
  topOverbudget: z.array(z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    budgetHours: z.string(),
    consumedHours: z.string(),
    overagePercent: z.string(),
    actualCost: z.string(),
    contractedAmount: z.string(),
  })),
  invoicePipeline: z.array(z.object({
    projectId: z.number(),
    projectName: z.string(),
    phaseName: z.string(),
    sortOrder: z.number(),
    invoiceAmount: z.string(),
    isPaid: z.boolean(),
    invoiceDate: z.string().nullable(),
  })),
  developmentGoals: z.array(z.object({
    category: z.string(),
    categoryLabel: z.string(),
    hours: z.string(),
    hasData: z.boolean(),
    personBreakdown: z.array(z.object({
      name: z.string(),
      hours: z.string(),
    })).optional(),
  })),
  developmentSummary: z.object({
    totalInternalHours: z.string(),
    totalClientHours: z.string(),
  }),
  dataQualityAlerts: z.array(z.object({
    type: z.string(),
    code: z.string(),
    message: z.string(),
    hours: z.string().optional(),
    count: z.number().optional(),
  })).optional().default([]),
  overdueInvoices: z.object({
    count: z.number(),
    totalAmount: z.string(),
  }),
});

// --- Personal Dashboard ---

export const personalDashboardSchema = z.object({
  members: z.array(z.object({
    name: z.string(),
    totalHours: z.string(),
    clientHours: z.string(),
    internalHours: z.string(),
    productiveHours: z.string(),
    nonProductiveHours: z.string(),
    internalBreakdown: z.array(z.object({
      category: z.string(),
      categoryLabel: z.string(),
      hours: z.string(),
    })),
    clientProjects: z.array(z.object({
      id: z.number(),
      name: z.string(),
      code: z.string(),
      hours: z.string(),
      hasJiraKey: z.boolean(),
    })),
    dataQuality: z.object({
      totalEntries: z.number(),
      missingDescription: z.number(),
      clientEntriesWithoutJira: z.number(),
    }),
    suspiciousEntries: z.array(z.object({
      jiraKey: z.string(),
      description: z.string(),
      hours: z.string(),
      projectCode: z.string(),
    })),
  })),
  summary: z.object({
    totalMembers: z.number(),
    avgProductivePercent: z.string(),
    avgClientPercent: z.string(),
  }),
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

export const changeRequestPhaseImpactSchema = z.object({
  id: z.number(),
  phase: z.number(),
  phaseName: z.string(),
  phaseSortOrder: z.number(),
  estimatedHours: z.string(),
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
  isCharged: z.boolean(),
  chargedAmount: z.string().nullable(),
  phaseImpacts: z.array(changeRequestPhaseImpactSchema),
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
