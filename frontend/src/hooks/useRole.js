import { useSelector } from "react-redux";

const useRole = () => {
  const { userRole } = useSelector((state) => state.org);
  const { user } = useSelector((state) => state.auth);

  // Fallback to global user role if no org-specific role is found
  const role = userRole || user?.role || "MEMBER";

  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";
  const isLead = role === "LEAD";
  const isMember = role === "MEMBER";

  const hasRole = (...roles) => roles.includes(role);

  return {
    role,
    isAdmin,
    isManager,
    isMember,
    isLead,
    hasRole,
  };
};

export default useRole;
