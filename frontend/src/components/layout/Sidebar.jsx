import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  Activity,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
  Plus,
  CheckSquare,
  Users,
  UserPlus,
  Rocket,
  Shield
} from "lucide-react";
import { logout } from "../../features/auth/authSlice";
import { getInitials, getAvatarColor } from "../../utils/helpers";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import logo from "../../assets/logo2.png";

//  navItems structure
const navigationGroups = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, to: "/app/dashboard" },
      { label: "My Work", icon: CheckSquare, to: "/app/my-work" },
    ]
  },
  {
    title: "Workspace",
    items: [
      { label: "Projects", icon: FolderKanban, to: "/app/projects" },
      { label: "Organizations", icon: Users, to: "/app/organizations" },
    ]
  },
  {
    title: "Admin",
    items: [
      { label: "Members", icon: Shield, to: "/app/members", roles: ["ADMIN"] },
    ]
  },
  {
    title: "Insights",
    items: [
      { label: "Activity", icon: Activity, to: "/app/activity" },
    ]
  }
];

const Sidebar = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [profileOpen, setProfileOpen] = useState(false);

  //  Navigation handler
  const handleNavClick = (item) => {
    if (item.to) {
      navigate(item.to);
      onClose?.();
      return;
    }

    const lastTeamId = localStorage.getItem("last_team_id");

    // Projects
    if (item.action === "projects") {
      if (lastTeamId) {
        navigate(`/app/teams/${lastTeamId}/projects`);
      } else {
        navigate("/app/organizations");
      }
    }

    // Activity is a normal route now (global feed).

    onClose?.();
  };

  const handleLogout = async () => {
    try {
      const result = await dispatch(logout());

      if (logout.fulfilled.match(result)) {
        toast.success("Logged out successfully");
        navigate("/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch {
      toast.error("Something went wrong during logout");
    }
  };

  const { userRole: role } = useSelector((state) => state.org);

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
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-dark-950/60 backdrop-blur-xl border-r border-dark-850/40 flex flex-col transition-all duration-300 lg:translate-x-0 lg:static lg:z-auto lg:my-3 lg:ml-3 lg:rounded-2xl lg:border lg:border-dark-800/40 lg:shadow-2xl lg:shadow-black/40 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-dark-800/40">
          <div className="flex items-center pl-4 gap-0">
            <img src={logo} alt="CrewFlow Logo" className="w-12 h-12 pr-2 object-contain drop-shadow-md" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-white">Crew</span>
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-sm">Flow</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded text-dark-400 hover:text-dark-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Create - Subtler, more professional */}
        <div className="px-4 py-6">
          <button
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-lg shadow-brand-500/20 transition-all duration-300 text-sm font-bold group active:scale-95"
            onClick={() => toast.success("Quick Create coming soon!")}
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
            <span>Create New</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-8 overflow-y-auto custom-scrollbar">
          {navigationGroups.map((group) => {
            // Filter items based on role
            const visibleItems = group.items.filter(item => {
              if (!item.roles) return true;
              return item.roles.includes(role);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-2">
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-dark-500/70">
                  {group.title}
                </p>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        end={item.to === "/app/dashboard"}
                        onClick={() => onClose?.()}
                        className={({ isActive }) =>
                          `group flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative ${isActive
                            ? "bg-gradient-to-r from-brand-600/15 to-transparent text-brand-400 border border-brand-500/15 shadow-[0_2px_12px_-3px_rgba(99,102,241,0.1)]"
                            : "text-dark-400 hover:text-dark-100 hover:bg-dark-800/30 border border-transparent"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={19} className={`${isActive ? "text-brand-400" : "text-dark-500 group-hover:text-dark-200"} transition-colors duration-300`} />
                            {item.label}
                            {isActive && (
                              <div className="absolute left-[-1px] w-[3px] h-5 bg-brand-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Profile section */}
        <div className="px-3 py-4 border-t border-dark-800/40">
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-800 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${getAvatarColor(
                  user?.full_name,
                )}`}
              >
                {getInitials(user?.full_name)}
              </div>

              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-dark-100 truncate">
                  {user?.full_name || "User"}
                </p>
                <p className="text-xs text-dark-500 truncate">{user?.email}</p>
              </div>

              <ChevronDown
                size={14}
                className={`text-dark-400 transition-transform ${profileOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl overflow-hidden">
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

                <div className="py-1">
                  <button
                    onClick={() => { navigate("/app/profile"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-dark-300 hover:bg-dark-700"
                  >
                    <User size={14} />
                    View Profile
                  </button>

                  <button
                    onClick={() => { navigate("/app/profile"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-dark-300 hover:bg-dark-700"
                  >
                    <Settings size={14} />
                    Settings
                  </button>

                  <div className="border-t border-dark-700 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
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
