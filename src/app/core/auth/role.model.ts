// Realm roles, carried in the tokens' "role" claim (ADR-005). Authorization is decided by the API; the UI only uses
// them to choose what to show.
export type Role = 'librarian' | 'patron';

export function rolesFrom(claims: unknown): Role[] {
  if (typeof claims !== 'object' || claims === null || !('role' in claims)) return [];
  const role = (claims as { role: unknown }).role;
  const values = Array.isArray(role) ? role : [role];
  return values.filter((r): r is Role => r === 'librarian' || r === 'patron');
}
