import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "./useAuth";

/**
 * Organization-scoped role from membership (+ org owner treated as ADMIN).
 * Maps API `DEVELOPER` to display `MEMBER` for product language parity.
 *
 * @param {number | string | null | undefined} orgId - Explicit org; defaults to `state.org.selectedOrgId`.
 */
export function useRole(orgId) {
  const { user } = useAuth();
  const selectedOrgId = useSelector((s) => s.org.selectedOrgId);

  const targetId =
    orgId != null && Number.isFinite(Number(orgId))
      ? Number(orgId)
      : selectedOrgId;

  const membershipRole = useSelector((s) =>
    targetId != null ? s.org.userRoleByOrgId[targetId] ?? null : null,
  );

  const orgDetails = useSelector((s) =>
    targetId != null ? s.org.orgDetailsById[targetId] : null,
  );

  const ownerRaw = orgDetails?.owner;
  const ownerId =
    ownerRaw != null && typeof ownerRaw === "object" ? ownerRaw.id : ownerRaw;

  const isOwner =
    user?.id != null &&
    ownerId != null &&
    Number(ownerId) === Number(user.id);

  const rawRole = membershipRole ?? (isOwner ? "ADMIN" : null);
  const role = rawRole === "DEVELOPER" ? "MEMBER" : rawRole;

  const canManageJoinCodes =
    isOwner || rawRole === "ADMIN" || rawRole === "MANAGER";

  return useMemo(
    () => ({
      orgId: targetId,
      role,
      rawRole,
      membershipRole,
      isOwner,
      isAdmin: rawRole === "ADMIN" || isOwner,
      isManager: rawRole === "MANAGER",
      isMember: rawRole === "DEVELOPER" || role === "MEMBER",
      canManageJoinCodes,
    }),
    [targetId, role, rawRole, membershipRole, isOwner, canManageJoinCodes],
  );
}

export default useRole;
