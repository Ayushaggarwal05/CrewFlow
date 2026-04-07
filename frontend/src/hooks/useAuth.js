import { useSelector } from "react-redux";

const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  const role = user?.role || null;
  const isAdmin = role === "ADMIN";
  const isManager = role === "MANAGER";
  const isDeveloper = role === "DEVELOPER";
  const hasRole = (...roles) => roles.includes(role);

  return {
    user,
    isAuthenticated,
    loading,
    role,
    isAdmin,
    isManager,
    isDeveloper,
    hasRole,
  };
};

export default useAuth;
