import { useSelector } from "react-redux";

const useRole = () => {
  const { userRole } = useSelector((state) => state.org);
  const { user } = useSelector((state) => state.auth);

  // Fallback to global user role if no org-specific role is found
  const role = userRole || user?.role || "MEMBER";

  const isAdmin = role === "ADMIN" || role === "OWNER";
  const isManager = role === "MANAGER" || role === "LEAD";
  const isMember = role === "MEMBER";

  const hasRole = (...roles) => roles.includes(role);

  return {
    role,
    isAdmin,
    isManager,
    isMember,
    hasRole,
  };
};

export default useRole;
