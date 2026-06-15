export const roles = ["admin", "employee"] as const;

export type Role = (typeof roles)[number];

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  employee: "Employee"
};
