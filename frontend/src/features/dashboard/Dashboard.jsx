import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  FolderKanban,
  CheckSquare,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { fetchCurrentUser } from "../auth/authSlice";
import {
  fetchWorkspaceSnapshot,
  fetchOrgStats,
  selectWorkspaceTeamCount,
} from "../organizations/orgSlice";
import { CardSkeleton } from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { formatDate } from "../../utils/helpers";
import useAuth from "../../hooks/useAuth";
import useRole from "../../hooks/useRole";

const StatCard = ({ icon: Icon, label, value, color = "brand" }) => {
  const colorMap = {
    brand: "bg-brand-600/20 text-brand-400",
    green: "bg-green-600/20 text-green-400",
    blue: "bg-blue-600/20 text-blue-400",
    purple: "bg-purple-600/20 text-purple-400",
  };

  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-dark-50">{value}</p>
        <p className="text-sm text-dark-400">{label}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();
  const organizations = useSelector((state) => state.org.organizations);
  const workspaceLoading = useSelector((state) => state.org.workspaceSnapshotLoading);
  const allProjectsEnriched = useSelector((state) => state.org.allProjectsEnriched);
  const selectedOrgId = useSelector((state) => state.org.selectedOrgId);
  const teamCount = useSelector(selectWorkspaceTeamCount);

  const loading = authLoading || workspaceLoading;

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    dispatch(fetchWorkspaceSnapshot());
  }, [dispatch]);

  const orgIdForRole = selectedOrgId ?? organizations[0]?.id ?? null;

  useEffect(() => {
    if (orgIdForRole != null) {
      dispatch(fetchOrgStats(orgIdForRole));
    }
  }, [dispatch, orgIdForRole]);

  const { role, rawRole } = useRole(orgIdForRole);

  const recentProjects = useMemo(
    () =>
      [...allProjectsEnriched]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5),
    [allProjectsEnriched],
  );

  const projectsCount = allProjectsEnriched.length;

  const firstName = useMemo(
    () => user?.full_name?.split(" ")?.[0] || "there",
    [user?.full_name],
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-header">Welcome back, {firstName}</h1>
        <p className="text-dark-400 mt-1">
          Here&apos;s what&apos;s happening across your workspace.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Building2}
            label="Organizations"
            value={organizations.length}
          />
          <StatCard icon={Users} label="Teams" value={teamCount || "0"} color="purple" />
          <StatCard
            icon={FolderKanban}
            label="Projects"
            value={projectsCount || "0"}
            color="blue"
          />
          <StatCard
            icon={CheckSquare}
            label="Open Tasks"
            value="—"
            color="green"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-dark-100">Your Organizations</h2>
            <button
              type="button"
              onClick={() => navigate("/app/organizations")}
              className="text-sm text-brand-400 hover:text-brand-300"
            >
              View all
            </button>
          </div>

          {loading ? (
            <CardSkeleton count={3} />
          ) : organizations.length === 0 ? (
            <div className="card p-8 text-center">
              <Building2 size={36} className="mx-auto text-dark-600 mb-3" />
              <p className="text-dark-400 font-medium">No organizations yet</p>
              <p className="text-dark-500 text-sm mt-1">
                Create your first organization to get started
              </p>
              <button
                type="button"
                onClick={() => navigate("/app/organizations")}
                className="btn-primary mt-4 mx-auto"
              >
                Create Organization
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {organizations.slice(0, 5).map((org) => (
                <div
                  key={org.id}
                  className="card-hover p-4 cursor-pointer"
                  onClick={() => navigate(`/app/organizations/${org.id}/teams`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/app/organizations/${org.id}/teams`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-600/20 rounded-xl flex items-center justify-center">
                        <Building2 size={18} className="text-brand-400" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-100">{org.name}</p>
                        <p className="text-xs text-dark-500">
                          Created {formatDate(org.created_at)}
                        </p>
                      </div>
                    </div>
                    <TrendingUp size={16} className="text-dark-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-dark-100">Your Role</h2>

          <div className="card p-5 space-y-4">
            {role ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center">
                    <Users size={18} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Your role</p>
                    <Badge variant={rawRole || role} label={role} />
                  </div>
                </div>

                <div className="text-sm text-dark-400 space-y-2 border-t border-dark-700 pt-3">
                  {(rawRole === "ADMIN" || role === "ADMIN") && (
                    <p>Full access to organizations, teams, and members.</p>
                  )}
                  {rawRole === "MANAGER" && <p>Manage teams and projects.</p>}
                  {(rawRole === "DEVELOPER" || role === "MEMBER") && (
                    <p>Work on assigned tasks.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-dark-500 text-sm">
                <Clock size={24} className="mx-auto mb-2 text-dark-600" />
                Join an organization to see your role
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-100">Recent Projects</h2>
            <button
              type="button"
              onClick={() => navigate("/app/projects")}
              className="text-sm text-brand-400 hover:text-brand-300"
            >
              View all
            </button>
          </div>

          {loading ? (
            <div className="card p-5">
              <div className="skeleton h-4 w-2/3 rounded mb-3" />
              <div className="skeleton h-4 w-1/2 rounded mb-3" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="card p-5 text-sm text-dark-500">
              No projects yet. Create one from a team page.
            </div>
          ) : (
            <div className="card divide-y divide-dark-700">
              {recentProjects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    localStorage.setItem("last_project_id", String(p.id));
                    navigate(`/app/projects/${p.id}/tasks`);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-dark-700/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-dark-100 font-medium truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-dark-500">
                        Created {formatDate(p.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={p.status} />
                      <Activity size={14} className="text-dark-600" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <h2 className="font-semibold text-dark-100">Quick Access</h2>
          <div className="card divide-y divide-dark-700">
            {[
              {
                label: "Go to Projects",
                icon: FolderKanban,
                path: "/app/projects",
              },
              {
                label: "Organizations",
                icon: Building2,
                path: "/app/organizations",
              },
            ].map(({ label, icon: Icon, path }) => (
              <button
                key={path}
                type="button"
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700"
              >
                <Icon size={16} className="text-dark-500" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
