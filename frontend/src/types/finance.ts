export type HealthStatus = "CRITICAL" | "WARNING" | "HEALTHY";

export interface Project {
  id: number;
  name: string;
  code: string;
  clientName: string;
  currentHealthStatus: HealthStatus;
  budgetHours: string;
  clientInvoiceAmount: string;
  consumedHours: string;
  consumptionPercent: string;
  progressPercent: string;
  actualCost: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  clientInvoiceAmount: string;
  targetMargin: string;
  actualCost: string;
  earnedValue: string;
  jiraProjectKey: string;
  clockifyProjectId: string;
  anticipoAmount: string | null;
  anticipoDate: string | null;
  anticipoFileUrl: string | null;
  phases: Phase[];
  roleRates: ProjectRoleRate[];
  latestSnapshot: HealthSnapshot | null;
  createdAt: string;
}

export type PhaseStatus = "completed" | "in_progress" | "pending";

export interface CrPhaseImpactItem {
  crId: number;
  description: string;
  status: "in_review" | "accepted" | "to_start" | "in_process" | "pending_acceptance" | "completed";
  estimatedHours: string;
  isCharged: boolean;
  chargedAmount: string;
}

export interface CrImpact {
  items: CrPhaseImpactItem[];
  totalHours: string;
  totalCharged: string;
  totalAbsorbed: string;
  count: number;
}

export interface Phase {
  id: number;
  name: string;
  estimatedHours: string;
  actualHours: string;
  sortOrder: number;
  status: PhaseStatus;
  progressPercent: string;
  invoiceAmount: string | null;
  invoiceDate: string | null;
  isPaid: boolean;
  invoiceFileUrl: string | null;
  crImpact: CrImpact;
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

export interface SprintTask {
  id: number;
  jiraKey: string;
  title: string;
  assignedTo: string;
  hours: string;
  date: string;
}

export interface SprintTimeEntry {
  id: number;
  date: string;
  durationHours: string;
  cost: string;
  userName: string;
  description: string;
}

export interface Advance {
  id: number;
  sprint: number;
  taskJiraKey: string;
  description: string;
  status: "pending" | "accepted";
  presentedBy: string;
  observations: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimpleChangeRequest {
  id: number;
  sprint: number;
  advance: number | null;
  taskJiraKey: string;
  description: string;
  status: "in_process" | "pending_review" | "accepted" | "rejected";
  reviewComments: string;
  draggedFromSprint: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeRequestPhaseImpact {
  id: number;
  phase: number;
  phaseName: string;
  phaseSortOrder: number;
  estimatedHours: string;
}

export interface ChangeRequest {
  id: number;
  sprint: number;
  description: string;
  detail: string;
  status: "in_review" | "accepted" | "to_start" | "in_process" | "pending_acceptance" | "completed";
  dependencies: string;
  impact: string;
  estimatedHours: string | null;
  isCharged: boolean;
  chargedAmount: string | null;
  phaseImpacts: ChangeRequestPhaseImpact[];
  createdAt: string;
  updatedAt: string;
}

export type SprintStatus = "planned" | "in_progress" | "completed";

export interface SprintDetail {
  id: number;
  name: string;
  description: string;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
  sortOrder: number;
  tasks: SprintTask[];
  timeEntries: SprintTimeEntry[];
  advances: Advance[];
  simpleChanges: SimpleChangeRequest[];
  changeRequests: ChangeRequest[];
  createdAt: string;
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
