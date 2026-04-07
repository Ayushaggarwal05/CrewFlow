import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  CheckSquare,
  Activity,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
} from "lucide-react";
import { logout } from "../../features/auth/authSlice";
import { getInitials, getAvatarColor } from "../../utils/helpers";
import Badge from "../ui/Badge";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/app/dashboard" },
  { label: "Organizations", icon: Building2, to: "/app/organizations" },
  { label: "Projects", icon: FolderKanban, to: "/app/projects" },
  { label: "Activity", icon: Activity, to: "/app/activity" },
];

const Sidebar = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logout());

      if (logout.fulfilled.match(result)) {
        toast.success("Logged out successfully");
        navigate("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      toast.error("Something went wrong during logout");
    }
  };

  const role = user?.org_role || user?.role || null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-dark-900 border-r border-dark-800 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-bold text-dark-50 text-base">CrewFlow</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-dark-400 hover:text-dark-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="section-title px-3 mb-3">Navigation</p>
          {navItems.map(({ label, icon: Icon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/app/dashboard"}
              onClick={() => onClose?.()}
              className={({ isActive }) =>
                isActive ? "sidebar-link-active" : "sidebar-link"
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Profile section */}
        <div className="px-3 py-4 border-t border-dark-800">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-800 transition-colors"
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${getAvatarColor(user?.full_name)}`}
              >
                {getInitials(user?.full_name)}
              </div>
              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-dark-100 truncate">
                  {user?.full_name || "User"}
                </p>
                <p className="text-xs text-dark-500 truncate">{user?.email}</p>
              </div>
              <ChevronDown
                size={14}
                className={`text-dark-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl overflow-hidden animate-slide-in">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-dark-700">
                  <p className="text-sm font-semibold text-dark-100">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-dark-500">{user?.email}</p>
                  {role && (
                    <div className="mt-2">
                      <Badge variant={role} label={role} />
                    </div>
                  )}
                </div>
                {/* Actions */}
                <div className="py-1">
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-colors">
                    <User size={14} />
                    View Profile
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-colors">
                    <Settings size={14} />
                    Settings
                  </button>
                  <div className="border-t border-dark-700 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
