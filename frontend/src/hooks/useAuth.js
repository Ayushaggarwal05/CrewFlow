import { useMemo } from "react";
import { useSelector } from "react-redux";

/**
 * Global auth profile (JWT user + persisted cache).
 * For organization-scoped roles use `useRole`.
 */
export function useAuth() {
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const profile = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      full_name: user.full_name,
      name: user.full_name,
      email: user.email,
      ...user,
    };
  }, [user]);

  return {
    user: profile,
    isAuthenticated,
    loading,
    error,
  };
}

export default useAuth;
