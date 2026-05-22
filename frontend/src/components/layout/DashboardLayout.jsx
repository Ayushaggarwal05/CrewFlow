import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { fetchCurrentUser } from "../../features/auth/authSlice";
import { PageLoader } from "../ui/Spinner";

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initializing, setInitializing] = useState(!user);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      if (!user) {
        const result = await dispatch(fetchCurrentUser());

        if (fetchCurrentUser.rejected.match(result)) {
          navigate("/login", { replace: true });
          return;
        }
      }

      setInitializing(false);
    };

    init();
  }, [user, dispatch, navigate]);

  if (initializing) {
    return <PageLoader />;
  }

  return (
    <div 
      className="flex h-screen overflow-hidden relative"
      style={{
        background: "radial-gradient(circle at 90% 10%, rgba(99, 102, 241, 0.07) 0%, rgba(6, 182, 212, 0.02) 20%, rgba(3, 7, 18, 1) 60%)"
      }}
    >
      {/* Premium Top-Right Atmospheric Glow Mesh */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 via-cyan-500/4 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
