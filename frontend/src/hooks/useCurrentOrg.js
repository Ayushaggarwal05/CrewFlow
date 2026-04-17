import { useSelector, useDispatch } from "react-redux";
import { 
  setSelectedOrg as setSelectedOrgAction, 
  fetchOrganizations, 
  fetchOrgStats,
  fetchOrgDetails,
  fetchOrgActivity
} from "../features/organizations/orgSlice";

const useCurrentOrg = () => {
  const dispatch = useDispatch();
  const { 
    organizations, 
    selectedOrgId, 
    selectedOrgDetails, 
    stats, 
    activityFeed,
    loading, 
    error 
  } = useSelector((state) => state.org);

  const org = organizations.find((o) => Number(o.id) === Number(selectedOrgId)) || null;

  const setSelectedOrg = (orgId) => {
    dispatch(setSelectedOrgAction(orgId));
  };

  const refreshOrgs = () => {
    dispatch(fetchOrganizations());
  };

  const refreshStats = (orgId) => {
    dispatch(fetchOrgStats(orgId || selectedOrgId));
  };

  const refreshDetails = (orgId) => {
      dispatch(fetchOrgDetails(orgId || selectedOrgId));
  };

  const refreshActivity = (orgId) => {
      dispatch(fetchOrgActivity(orgId || selectedOrgId));
  };

  return {
    org,
    orgId: selectedOrgId,
    organizations,
    selectedOrgDetails,
    stats,
    activityFeed,
    loading,
    error,
    setSelectedOrg,
    refreshOrgs,
    refreshStats,
    refreshDetails,
    refreshActivity
  };
};

export default useCurrentOrg;
