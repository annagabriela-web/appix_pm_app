import type { PaginatedResponse } from "@types/api";
import type {
  Advance,
  BillingRole,
  BurndownPoint,
  ChangeRequest,
  HealthSnapshot,
  Phase,
  PhaseComparison,
  PortfolioProject,
  Project,
  ProjectDetail,
  ProjectHealthAlert,
  SimpleChangeRequest,
  SprintDetail,
} from "@types/finance";

import apiClient from "./apiClient";
import {
  advanceSchema,
  alertSchema,
  billingRoleSchema,
  burndownPointSchema,
  changeRequestSchema,
  healthSnapshotSchema,
  paginatedResponseSchema,
  phaseSchema,
  phaseComparisonSchema,
  portfolioProjectSchema,
  projectDetailSchema,
  projectSchema,
  simpleChangeRequestSchema,
  sprintDetailSchema,
} from "./schemas";

// --- Projects ---

interface ProjectListParams {
  page?: number;
  currentHealthStatus?: string;
  ordering?: string;
}

export async function fetchProjects(
  params?: ProjectListParams
): Promise<PaginatedResponse<Project>> {
  const { data } = await apiClient.get("/finance/projects/", { params });
  return paginatedResponseSchema(projectSchema).parse(data);
}

export async function fetchProjectDetail(id: number): Promise<ProjectDetail> {
  const { data } = await apiClient.get(`/finance/projects/${id}/`);
  return projectDetailSchema.parse(data);
}

// --- Burndown ---

export async function fetchBurndownData(
  projectId: number
): Promise<BurndownPoint[]> {
  const { data } = await apiClient.get(
    `/finance/projects/${projectId}/burndown/`
  );
  return burndownPointSchema.array().parse(data);
}

// --- Phase Comparison ---

export async function fetchPhaseComparison(
  projectId: number
): Promise<PhaseComparison[]> {
  const { data } = await apiClient.get(
    `/finance/projects/${projectId}/phase-comparison/`
  );
  return phaseComparisonSchema.array().parse(data);
}

// --- Phase Invoice ---

export interface PhaseInvoicePayload {
  invoiceAmount?: string | null;
  invoiceDate?: string | null;
  isPaid?: boolean;
  invoiceFile?: File | null;
  clearInvoiceFile?: boolean;
}

export async function updatePhaseInvoice(
  phaseId: number,
  payload: PhaseInvoicePayload
): Promise<Phase> {
  const hasFile = payload.invoiceFile instanceof File;
  const clearFile = payload.clearInvoiceFile === true;

  if (hasFile || clearFile) {
    // FormData — field names must be snake_case (interceptor skips transform)
    const fd = new FormData();
    if (payload.invoiceAmount != null) {
      fd.append("invoice_amount", payload.invoiceAmount);
    }
    if (payload.invoiceDate != null) {
      fd.append("invoice_date", payload.invoiceDate);
    }
    if (payload.isPaid !== undefined) {
      fd.append("is_paid", String(payload.isPaid));
    }
    if (hasFile && payload.invoiceFile) {
      fd.append("invoice_file", payload.invoiceFile);
    }
    if (clearFile) {
      fd.append("clear_invoice_file", "true");
    }
    const { data } = await apiClient.patch(`/finance/phases/${phaseId}/`, fd);
    return phaseSchema.parse(data);
  }

  // No file — use regular JSON
  const { data } = await apiClient.patch(`/finance/phases/${phaseId}/`, payload);
  return phaseSchema.parse(data);
}

// --- Anticipo ---

export interface AnticipoPayload {
  anticipoAmount: string;
  anticipoDate: string;
  anticipoFile?: File;
}

export async function updateAnticipo(
  projectId: number,
  payload: AnticipoPayload
): Promise<ProjectDetail> {
  const fd = new FormData();
  fd.append("anticipo_amount", payload.anticipoAmount);
  fd.append("anticipo_date", payload.anticipoDate);
  if (payload.anticipoFile) {
    fd.append("anticipo_file", payload.anticipoFile);
  }
  const { data } = await apiClient.patch(
    `/finance/projects/${projectId}/anticipo/`,
    fd
  );
  return projectDetailSchema.parse(data);
}

// --- Health History ---

export async function fetchHealthHistory(
  projectId: number
): Promise<HealthSnapshot[]> {
  const { data } = await apiClient.get(
    `/finance/projects/${projectId}/health-history/`
  );
  return healthSnapshotSchema.array().parse(data);
}

// --- Portfolio ---

export async function fetchPortfolio(): Promise<PortfolioProject[]> {
  const { data } = await apiClient.get("/finance/portfolio/");
  return portfolioProjectSchema.array().parse(data);
}

// --- Alerts ---

export async function fetchAlerts(
  unreadOnly?: boolean
): Promise<PaginatedResponse<ProjectHealthAlert>> {
  const params = unreadOnly ? { isRead: false } : {};
  const { data } = await apiClient.get("/finance/alerts/", { params });
  return paginatedResponseSchema(alertSchema).parse(data);
}

export async function markAlertRead(
  alertId: number
): Promise<ProjectHealthAlert> {
  const { data } = await apiClient.patch(`/finance/alerts/${alertId}/read/`);
  return alertSchema.parse(data);
}

// --- Billing Roles ---

export async function fetchBillingRoles(): Promise<PaginatedResponse<BillingRole>> {
  const { data } = await apiClient.get("/finance/billing-roles/");
  return paginatedResponseSchema(billingRoleSchema).parse(data);
}

export async function createBillingRole(
  roleData: Omit<BillingRole, "id">
): Promise<BillingRole> {
  const { data } = await apiClient.post("/finance/billing-roles/", roleData);
  return billingRoleSchema.parse(data);
}

export async function updateBillingRole(
  id: number,
  roleData: Partial<Omit<BillingRole, "id">>
): Promise<BillingRole> {
  const { data } = await apiClient.patch(
    `/finance/billing-roles/${id}/`,
    roleData
  );
  return billingRoleSchema.parse(data);
}

export async function deleteBillingRole(id: number): Promise<void> {
  await apiClient.delete(`/finance/billing-roles/${id}/`);
}

// --- Sprints ---

export async function fetchSprints(projectId: number): Promise<SprintDetail[]> {
  const { data } = await apiClient.get(`/finance/projects/${projectId}/sprints/`);
  return sprintDetailSchema.array().parse(data);
}

// --- Advances ---

export async function createAdvance(
  projectId: number,
  payload: { sprint: number; taskJiraKey: string; description: string; presentedBy: string }
): Promise<Advance> {
  const { data } = await apiClient.post(`/finance/projects/${projectId}/advances/`, payload);
  return advanceSchema.parse(data);
}

export async function reviewAdvance(
  advanceId: number,
  payload: { status: "pending" | "accepted"; observations?: string }
): Promise<Advance> {
  const { data } = await apiClient.patch(`/finance/advances/${advanceId}/review/`, payload);
  return advanceSchema.parse(data);
}

// --- Simple Changes ---

export async function reviewSimpleChange(
  changeId: number,
  payload: { status: SimpleChangeRequest["status"]; reviewComments?: string }
): Promise<SimpleChangeRequest> {
  const { data } = await apiClient.patch(`/finance/simple-changes/${changeId}/review/`, payload);
  return simpleChangeRequestSchema.parse(data);
}

// --- Change Requests ---

export async function createChangeRequest(
  projectId: number,
  payload: {
    sprint: number;
    description: string;
    detail?: string;
    dependencies?: string;
    impact?: string;
    estimatedHours?: string;
    isCharged?: boolean;
    chargedAmount?: string;
    phaseImpacts?: Array<{ phase: number; estimatedHours: string }>;
  }
): Promise<ChangeRequest> {
  const { data } = await apiClient.post(`/finance/projects/${projectId}/change-requests/`, payload);
  return changeRequestSchema.parse(data);
}

export async function updateChangeRequest(
  crId: number,
  payload: {
    status?: ChangeRequest["status"];
    isCharged?: boolean;
    chargedAmount?: string;
    phaseImpacts?: Array<{ phase: number; estimatedHours: string }>;
  }
): Promise<ChangeRequest> {
  const { data } = await apiClient.patch(`/finance/change-requests/${crId}/`, payload);
  return changeRequestSchema.parse(data);
}

// --- Sync ---

export async function triggerSync(
  syncType: "clockify" | "jira" | "evaluate"
): Promise<void> {
  await apiClient.post("/integrations/sync/trigger/", { syncType });
}

export async function fetchSyncStatus(): Promise<{
  clockify: Record<string, unknown> | null;
  jira: Record<string, unknown> | null;
}> {
  const { data } = await apiClient.get("/integrations/sync/status/");
  return data as {
    clockify: Record<string, unknown> | null;
    jira: Record<string, unknown> | null;
  };
}
