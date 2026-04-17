import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedOrg,
  fetchOrgDetails,
  fetchOrgStats,
} from "../features/organizations/orgSlice";

/**
 * Resolves the active organization from the URL (when `routeOrgId` is passed)
 * or from Redux `selectedOrgId`, and keeps org details + membership stats warm.
 */
export function useCurrentOrg(routeOrgId) {
  const dispatch = useDispatch();
  const selectedOrgId = useSelector((s) => s.org.selectedOrgId);
  const organizations = useSelector((s) => s.org.organizations);
  const orgDetailsById = useSelector((s) => s.org.orgDetailsById);

  const effectiveId =
    routeOrgId != null && Number.isFinite(Number(routeOrgId))
      ? Number(routeOrgId)
      : selectedOrgId;

  const org =
    effectiveId != null
      ? orgDetailsById[effectiveId] ||
        organizations.find((o) => o.id === effectiveId) ||
        null
      : null;

  useEffect(() => {
    if (routeOrgId != null && Number.isFinite(Number(routeOrgId))) {
      dispatch(setSelectedOrg(Number(routeOrgId)));
    }
  }, [routeOrgId, dispatch]);

  useEffect(() => {
    if (effectiveId != null && Number.isFinite(effectiveId)) {
      dispatch(fetchOrgDetails(effectiveId));
      dispatch(fetchOrgStats(effectiveId));
    }
  }, [effectiveId, dispatch]);

  return {
    org,
    orgId: effectiveId,
    selectedOrgId,
    organizations,
  };
}

export default useCurrentOrg;
