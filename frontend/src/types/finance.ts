export type HealthStatus = "CRITICAL" | "WARNING" | "HEALTHY";

export interface Project {
  id: number;
  name: string;
  code: string;
  clientName: string;
  currentHealthStatus: HealthStatus;
  budgetHours: string;
  consumedHours: string;
  consumptionPercent: string;
  progressPercent: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  clientInvoiceAmount: string;
  targetMargin: string;
  actualCost: string;
  earnedValue: string;
  jiraProjectKey: string;
  clockifyProjectId: string;
  phases: Phase[];
  roleRates: ProjectRoleRate[];
  latestSnapshot: HealthSnapshot | null;
  createdAt: string;
}

export interface Phase {
  id: number;
  name: string;
  estimatedHours: string;
  sortOrder: number;
}

export interface BillingRole {
  id: number;
  roleName: string;
  defaultHourlyRate: string;
}

export interface ProjectRoleRate {
  id: number;
  billingRole: number;
  billingRoleName: string;
  hourlyRate: string;
}

export interface HealthSnapshot {
  id: number;
  timestamp: string;
  consumptionPercent: string;
  progressPercent: string;
  budgetConsumed: string;
  earnedValue: string;
  healthStatus: HealthStatus;
  healthScore: number;
}

export interface ProjectHealthAlert {
  id: number;
  project: number;
  projectName: string;
  projectCode: string;
  alertType: "CRITICAL" | "WARNING";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface BurndownPoint {
  date: string;
  budgetLine: string;
  actualCostCumulative: string;
  earnedValueCumulative: string;
}

export interface PhaseComparison {
  phaseName: string;
  estimatedHours: string;
  actualHours: string;
}

export interface PortfolioProject {
  id: number;
  name: string;
  code: string;
  clientName: string;
  currentHealthStatus: HealthStatus;
  budgetHours: string;
  consumedHours: string;
  consumptionPercent: string;
  progressPercent: string;
  deviation: string;
}
