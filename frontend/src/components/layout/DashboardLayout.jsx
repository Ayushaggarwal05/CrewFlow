import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { fetchCurrentUser } from "../../features/auth/authSlice";
import { setSidebarMobileOpen } from "../../app/uiSlice";
import { PageLoader } from "../ui/Spinner";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const sidebarOpen = useSelector((state) => state.ui.sidebarMobileOpen);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const result = await dispatch(fetchCurrentUser());

      if (fetchCurrentUser.rejected.match(result)) {
        navigate("/login", { replace: true });
      }
    };

    init();
  }, [dispatch, navigate]);

  if (!user) {
    return <PageLoader />;
  }

  return (
    <div className="flex h-screen bg-dark-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => dispatch(setSidebarMobileOpen(false))}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => dispatch(setSidebarMobileOpen(true))} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
