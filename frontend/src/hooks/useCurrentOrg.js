import { useSelector, useDispatch } from "react-redux";
import { 
  setSelectedOrg as setSelectedOrgAction, 
  fetchOrganizations, 
  fetchOrgStats,
  fetchOrgDetails
} from "../features/organizations/orgSlice";

const useCurrentOrg = () => {
  const dispatch = useDispatch();
  const { 
    organizations, 
    selectedOrgId, 
    selectedOrgDetails, 
    stats, 
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


  return {
    org,
    orgId: selectedOrgId,
    organizations,
    selectedOrgDetails,
    stats,
    loading,
    error,
    setSelectedOrg,
    refreshOrgs,
    refreshStats,
    refreshDetails
  };
};

export default useCurrentOrg;
