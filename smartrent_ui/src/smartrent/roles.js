export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  TENANT_ADMIN: "TENANT_ADMIN",
  TENANT_MANAGER: "TENANT_MANAGER",
  TENANT_STAFF: "TENANT_STAFF",
  TENANT: "TENANT",
};

/**
 * @param {string | undefined} role
 * @param {string[] | undefined} allowed
 */
export function hasAnyRole(role, allowed) {
  if (!allowed || allowed.length === 0) return true; // no restriction
  if (!role) return false;
  return allowed.includes(role);
}

