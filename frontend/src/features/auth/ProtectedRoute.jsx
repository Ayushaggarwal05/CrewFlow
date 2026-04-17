import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (token && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-dark-400">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated && !user && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (token && !user && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
