export type UserRole = "PM" | "DIRECTOR" | "ADMIN" | "CLIENT";
export type OrgType = "INTERNAL" | "EXTERNAL";

export interface UserPermissions {
  canSeePortfolio: boolean;
  canSeeProjects: boolean;
  canSeePersonal: boolean;
  canManageBillingRoles: boolean;
  canSeeFinancials: boolean;
}

export interface CurrentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  orgId: number | null;
  orgName: string;
  orgType: OrgType;
  permissions: UserPermissions;
}
