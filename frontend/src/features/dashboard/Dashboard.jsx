import { useEffect, useMemo, useState } from "react";
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
import { getOrganizations, getOrgStats, getMyTeam } from "../organizations/organizationAPI";
import { CardSkeleton } from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { formatDate } from "../../utils/helpers";
import { getTeams } from "../teams/teamAPI";
import { getProjects } from "../projects/projectAPI";

const StatCard = ({ icon, label, value, color = "brand" }) => {
  const Icon = icon;
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

  const { user } = useSelector((state) => state.auth);

  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user if not available
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  const [selectedOrgId, setSelectedOrgId] = useState(() => {
    const saved = localStorage.getItem("dashboard_org_id");
    return saved && saved !== "null" ? Number(saved) : null;
  });
  const [teamsCount, setTeamsCount] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [membersCount, setMembersCount] = useState(0);
  const [recentProjects, setRecentProjects] = useState([]);
  const [subordinates, setSubordinates] = useState([]);

  // 1. Fetch organizations
  useEffect(() => {
    const loadOrgs = async () => {
      try {
        const response = await getOrganizations();
        const payload = response.data?.data?.results || response.data?.data || response.data || [];
        const validOrgs = Array.isArray(payload) ? payload : [];
        setOrgs(validOrgs);
        
        if (validOrgs.length > 0 && !selectedOrgId) {
          setSelectedOrgId(validOrgs[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch organizations", err);
      }
    };
    loadOrgs();
  }, [user, selectedOrgId]);

  // 2. Fetch scoped stats & data when selectedOrgId changes
  useEffect(() => {
    if (!selectedOrgId) return;
    localStorage.setItem("dashboard_org_id", selectedOrgId);
    
    let mounted = true;
    const loadScopedData = async () => {
      setLoading(true);
      try {
        // Fetch stats
        const statsRes = await getOrgStats(selectedOrgId);
        if (!mounted) return;
        setTeamsCount(statsRes.data.teams_count);
        setProjectsCount(statsRes.data.projects_count);
        setMembersCount(statsRes.data.members_count);

        // Fetch My Team for this org
        const userRole = user?.org_role ?? user?.role;
        if (userRole === "MANAGER" || userRole === "LEAD") {
          const myTeamRes = await getMyTeam(selectedOrgId);
          if (mounted) setSubordinates(myTeamRes.data || []);
        }

        // Fetch recent projects (limited by teams in this org)
        const teamsRes = await getTeams(selectedOrgId);
        const teams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
        if (teams.length > 0) {
          const projectResponses = await Promise.all(
            teams.slice(0, 5).map(team => getProjects(team.id).catch(() => ({ data: [] })))
          );
          const allProjects = projectResponses.flatMap(res => Array.isArray(res.data) ? res.data : []);
          if (mounted) {
            setRecentProjects(
              allProjects
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5)
            );
          }
        } else {
          if (mounted) setRecentProjects([]);
        }

      } catch (err) {
        console.error("Failed to load scoped dashboard data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadScopedData();
    return () => { mounted = false; };
  }, [selectedOrgId, user]);


  // Role (safe fallback)
  const role = user?.org_role ?? user?.role ?? null;
  const firstName = useMemo(
    () => user?.full_name?.split(" ")?.[0] || "there",
    [user?.full_name],
  );

  // Optional: redirect if not authenticated (extra safety)
  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Find the selected organization object to get its join_code and user_role
  const selectedOrg = orgs.find(o => Number(o.id) === Number(selectedOrgId));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="page-header">Welcome back, {firstName}</h1>
          <p className="text-dark-400 mt-1">
            Here's what's happening in your workspace.
          </p>
        </div>

        {/* Org Selector */}
        {orgs.length > 0 && (
          <div className="flex items-center gap-3 bg-dark-800 p-2 rounded-xl border border-dark-700">
            <Building2 size={18} className="text-dark-400" />
            <select
              className="bg-transparent text-sm font-medium text-dark-100 outline-none cursor-pointer pr-4"
              value={selectedOrgId || ""}
              onChange={(e) => setSelectedOrgId(Number(e.target.value))}
            >
              {orgs.map((org) => (
                <option key={org.id} value={org.id} className="bg-dark-800">
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Current Org"
            value={orgs.find(o => Number(o.id) === Number(selectedOrgId))?.name?.split(' ')[0] || "..."}
            icon={Building2}
            color="brand"
          />
          <StatCard
            icon={Users}
            label="Total Members"
            value={membersCount}
            color="purple"
          />
          <StatCard
            icon={FolderKanban}
            label="Teams"
            value={teamsCount}
            color="blue"
          />
          <StatCard
            icon={CheckSquare}
            label="Projects"
            value={projectsCount}
            color="green"
          />
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organizations & Subordinates */}
        <div className="lg:col-span-2 space-y-8">
          {/* My Team Section for Managers/Leads */}
          {(role === "MANAGER" || role === "LEAD") && subordinates.length > 0 && (
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <h2 className="font-semibold text-dark-100 flex items-center gap-2">
                          <Users size={18} className="text-brand-400" />
                          My Team ({subordinates.length})
                      </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {subordinates.map(sub => (
                          <div key={sub.id} className="card p-4 flex items-center gap-3 bg-dark-800/50">
                              <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-brand-400 font-bold border border-dark-600">
                                  {sub.user_full_name?.charAt(0) || sub.user_email?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                  <p className="font-medium text-dark-100 truncate">{sub.user_full_name}</p>
                                  <p className="text-xs text-dark-500 truncate">{sub.role} • {sub.user_email}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-dark-100">Your Organizations</h2>
              <button
                onClick={() => navigate("/app/organizations")}
                className="text-sm text-brand-400 hover:text-brand-300"
              >
                View all
              </button>
            </div>

            {loading ? (
              <CardSkeleton count={3} />
            ) : orgs.length === 0 ? (
              <div className="card p-8 text-center">
                <Building2 size={36} className="mx-auto text-dark-600 mb-3" />
                <p className="text-dark-400 font-medium">No organizations yet</p>
                <p className="text-dark-500 text-sm mt-1">
                  Create your first organization to get started
                </p>
                <button
                  onClick={() => navigate("/app/organizations")}
                  className="btn-primary mt-4 mx-auto"
                >
                  Create Organization
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {orgs.slice(0, 5).map((org) => (
                  <div
                    key={org.id}
                    className="card-hover p-4 cursor-pointer"
                    onClick={() => navigate(`/app/organizations/${org.id}/teams`)}
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
        </div>

        {/* Right Panel */}
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
                    <p className="text-sm text-dark-400">Your current role</p>
                    <Badge variant={role} label={role} />
                  </div>
                </div>

                <div className="text-sm text-dark-400 space-y-2 border-t border-dark-700 pt-3">
                  {role === "ADMIN" && (
                    <p>Full access to organizations, teams, and members.</p>
                  )}
                  {(role === "MANAGER" || role === "LEAD") && (
                      <p>Manage your assigned team and projects.</p>
                  )}
                  {role === "MEMBER" && <p>Work on tasks assigned to you.</p>}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-dark-500 text-sm">
                <Clock size={24} className="mx-auto mb-2 text-dark-600" />
                Join an organization to see your role
              </div>
            )}
          </div>


          {/* Recent Projects */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-100">Recent Projects</h2>
            <button
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

          {/* Quick Links */}
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
            ].map(({ label, icon, path }) => {
              const QuickIcon = icon;
              return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700"
              >
                <QuickIcon size={16} className="text-dark-500" />
                {label}
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
