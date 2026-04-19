import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Users,
  FolderKanban,
  CheckCircle2,
  TrendingUp,
  Clock,
  Activity,
  Plus,
  Calendar,
  ArrowRight,
  UserPlus,
  Rocket,
  LayoutDashboard,
} from "lucide-react";

import useAuth from "../../hooks/useAuth";
import useCurrentOrg from "../../hooks/useCurrentOrg";
import useRole from "../../hooks/useRole";
import { getMyTeam } from "../organizations/organizationAPI";

import { getTeams } from "../teams/teamAPI";
import { getProjects } from "../projects/projectAPI";
import { fetchOrgStats } from "../organizations/orgSlice";
import { fetchMyTasks, toggleTaskDone } from "../tasks/taskSlice";
import { fetchOrgActivity } from "../activity/activitySlice";
import ActivityFeed from "../activity/ActivityFeed";

import Spinner, { CardSkeleton } from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { formatDate, getInitials } from "../../utils/helpers";
import toast from "react-hot-toast";

// --- Visual Components ---

const GlassCard = ({ children, className = "" }) => (
  <div className={`glass-panel p-5 relative overflow-hidden group transition-all duration-300 hover:shadow-brand-500/10 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ icon, label, value, subtext, color = "brand", loading = false }) => {
  const Icon = icon;
  const colorMap = {
    brand: "bg-brand-600/20 text-brand-400 border-brand-500/20",
    green: "bg-green-600/20 text-green-400 border-green-500/20",
    blue: "bg-blue-600/20 text-blue-400 border-blue-500/20",
    purple: "bg-purple-600/20 text-purple-400 border-purple-500/20",
  };

  if (loading) return <div className="skeleton h-32 rounded-2xl" />;

  return (
    <GlassCard className="border border-dark-700/50">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        {subtext && (
          <span className="text-xs font-medium text-dark-500 bg-dark-800 px-2 py-1 rounded-full border border-dark-700">
            {subtext}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-dark-50 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-dark-400 mt-1">{label}</p>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
    </GlassCard>
  );
};

const SectionHeader = ({ title, icon: Icon, children }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-lg font-bold text-dark-50 flex items-center gap-2.5">
      {Icon && <Icon size={20} className="text-brand-500" />}
      {title}
    </h2>
    {children}
  </div>
);

const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center glass-panel border-dashed border-2 border-dark-700/50">
    <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mb-4 text-dark-500">
      <Icon size={32} />
    </div>
    <h3 className="text-lg font-semibold text-dark-100">{title}</h3>
    <p className="text-dark-400 text-sm mt-2 max-w-xs">{description}</p>
    {actionText && (
      <Button onClick={onAction} className="mt-6" variant="secondary" size="sm">
        {actionText}
      </Button>
    )}
  </div>
);

// --- Main Dashboard ---

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    orgId, 
    organizations, 
    stats: orgStats, 
    loading: orgLoading,
    setSelectedOrg,
    refreshOrgs,
  } = useCurrentOrg();
  const { myTasks, loading: tasksLoading } = useSelector((state) => state.task);
  const { activities, loading: activityLoading } = useSelector((state) => state.activity);
  const { role } = useRole();

  // Local State for non-centralized data (Teams/Projects)
  const [recentProjects, setRecentProjects] = useState([]);
  const [subordinates, setSubordinates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Computed
  const firstName = useMemo(() => user?.full_name?.split(" ")?.[0] || "there", [user?.full_name]);
  const currentOrg = useMemo(() => organizations.find(o => Number(o.id) === Number(orgId)), [organizations, orgId]);

  // Initial Data
  useEffect(() => {
    if (organizations.length === 0) {
      refreshOrgs();
    }
  }, []);

  // Sync Global Data when Org Changes
  useEffect(() => {
    if (orgId) {
      dispatch(fetchOrgStats(orgId));
      dispatch(fetchOrgActivity(orgId));
      dispatch(fetchMyTasks(orgId));
    }
  }, [orgId, dispatch]);

  // Scoped Data Fetching (Keep local for now as per requirement granularity)
  const loadDashboardData = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const teamsRes = await getTeams(orgId);
      const teams = Array.isArray(teamsRes.data) ? teamsRes.data : [];
      if (teams.length > 0) {
        const projectRes = await Promise.all(
          teams.slice(0, 3).map(t => getProjects(t.id).catch(() => ({ data: [] })))
        );
        const allProj = projectRes.flatMap(r => Array.isArray(r.data) ? r.data : []);
        setRecentProjects(allProj.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5));
      }

      if (role === "MANAGER" || role === "LEAD" || role === "ADMIN") {
        const teamRes = await getMyTeam(orgId);
        setSubordinates(teamRes.data || []);
      }
    } catch (err) {
      console.error("Dashboard subsidiary load failed", err);
    } finally {
      setLoading(false);
    }
  }, [orgId, role]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Actions
  const handleMarkDone = async (task) => {
    try {
      await dispatch(toggleTaskDone({ 
        projectId: task.project, 
        taskId: task.id, 
        currentStatus: task.status 
      })).unwrap();
      toast.success("Task status updated! 🎉");
      dispatch(fetchOrgStats(orgId));
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  // --- Render Sections ---

  const renderStats = () => {
    if (!orgStats && loading) return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Active Projects"
          value={orgStats?.active_projects_count || 0}
          subtext={`of ${orgStats?.projects_count || 0}`}
          color="brand"
        />
        <StatCard
          icon={CheckCircle2}
          label="Total Tasks"
          value={orgStats?.total_tasks || 0}
          subtext="Org Volume"
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion"
          value={`${orgStats?.completion_percentage || 0}%`}
          subtext={`${orgStats?.completed_tasks || 0} done`}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Team Size"
          value={orgStats?.members_count || 0}
          subtext="Active Members"
          color="purple"
        />
      </div>
    );
  };

  const renderMyTasks = () => (
    <div className="space-y-4">
      <SectionHeader title="Your Focus" icon={LayoutDashboard} />
      {myTasks.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="All caught up!"
          description="No tasks assigned to you right now. Take a break or check other projects."
        />
      ) : (
        <div className="space-y-3">
          {myTasks.slice(0, 5).map(task => (
            <GlassCard key={task.id} className="p-4 border border-dark-700/30 flex items-center justify-between hover:border-brand-500/30">
              <div className="flex items-start gap-3 min-w-0">
                <button 
                  onClick={() => handleMarkDone(task)}
                  className="mt-1 w-5 h-5 rounded-full border-2 border-dark-600 flex items-center justify-center hover:border-brand-500 hover:text-brand-500 transition-colors"
                  disabled={tasksLoading}
                >
                  <CheckCircle2 size={12} className="opacity-0 hover:opacity-100" />
                </button>
                <div className="min-w-0">
                  <p className="font-semibold text-dark-50 truncate hover:text-brand-400 transition-colors cursor-pointer" onClick={() => navigate(`/app/projects/${task.project}/tasks`)}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Badge variant={task.status} size="sm" />
                    <span className="flex items-center gap-1.5 text-xs text-dark-500 font-medium">
                      <Calendar size={12} />
                      {task.due_date ? formatDate(task.due_date) : "No date"}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/app/projects/${task.project}/tasks`)}
                className="p-2 text-dark-500 hover:text-dark-100 transition-colors"
              >
                <ArrowRight size={18} />
              </button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  const renderActivityFeed = () => (
    <div className="space-y-4">
      <SectionHeader title="Recent Activity" icon={Activity} />
      <ActivityFeed activities={activities} loading={activityLoading} />
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 animate-fade-in pb-10">
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white tracking-tight">Bonjour, {firstName}</h1>
            <Rocket className="text-brand-500 animate-bounce" size={24} />
          </div>
          <p className="text-dark-400 font-medium">
            Project status: <span className="text-brand-400">{orgStats?.completion_percentage || 0}% Complete</span> in {currentOrg?.name || "Workspace"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Org Selector Swish */}
          {organizations.length > 0 && (
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-dark-500">
                <Building2 size={16} />
              </div>
              <select
                className="pl-10 pr-10 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm font-bold text-dark-100 outline-none hover:border-brand-500 transition-all appearance-none cursor-pointer"
                value={orgId || ""}
                onChange={(e) => setSelectedOrg(Number(e.target.value))}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          )}
          
          <Button variant="primary" icon={Plus} size="sm" onClick={() => navigate("/app/organizations")}>
            Manage Workspaces
          </Button>
        </div>
      </div>

      {renderStats()}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Areas */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* My Team (For Admins/Managers) */}
          {(role !== "MEMBER") && (
            <div className="space-y-4">
              <SectionHeader title="Team Members" icon={Users}>
                <button onClick={() => navigate("/app/organizations")} className="text-xs font-bold text-brand-500 uppercase tracking-widest hover:text-brand-400">Invite More</button>
              </SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subordinates.length === 0 ? (
                  <div className="md:col-span-3">
                    <EmptyState 
                      icon={UserPlus}
                      title="Lone Wolf?"
                      description="You don't have any direct subordinates in this workspace."
                    />
                  </div>
                ) : (
                  subordinates.slice(0, 6).map(sub => (
                    <GlassCard key={sub.id} className="p-4 flex items-center gap-3 border border-dark-700/40">
                      <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-brand-400 font-black border border-dark-600">
                        {getInitials(sub.user_full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-dark-50 truncate text-sm">{sub.user_full_name}</p>
                        <p className="text-[10px] font-bold text-dark-500 uppercase tracking-tighter truncate">{sub.role_display || sub.role}</p>
                      </div>
                    </GlassCard>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="space-y-4 font-inter">
            <SectionHeader title="Quick Actions" icon={TrendingUp} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "New Task", icon: Plus, color: "brand", action: () => navigate(recentProjects.length > 0 ? `/app/projects/${recentProjects[0].id}/tasks` : "/app/projects") },
                  { label: "Members", icon: UserPlus, color: "purple", action: () => navigate("/app/organizations") },
                  { label: "Teams", icon: Users, color: "blue", action: () => navigate(`/app/organizations/${orgId}/teams`) },
                  { label: "All Projects", icon: FolderKanban, color: "green", action: () => navigate("/app/projects") },
                ].map((act, i) => (
                  <button 
                    key={i} 
                    onClick={act.action}
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-dark-800/40 border border-dark-700/50 hover:border-brand-500/50 hover:bg-dark-700/50 transition-all group"
                  >
                    <div className={`p-2.5 rounded-xl bg-dark-800 text-${act.color}-400 group-hover:scale-110 transition-transform`}>
                      <act.icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-dark-300">{act.label}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Your Organizations */}
          <div className="space-y-4">
            <SectionHeader title="Your Workspaces" icon={Building2} />
            <div className="grid md:grid-cols-2 gap-4">
              {organizations.map(org => (
                <GlassCard 
                  key={org.id} 
                  className="p-6 cursor-pointer border border-dark-700/60 hover:border-brand-500/50 group transition-all"
                  onClick={() => { setSelectedOrg(org.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-dark-900 border border-dark-700 rounded-2xl flex items-center justify-center text-brand-500 group-hover:scale-110 group-hover:bg-brand-500/10 transition-all">
                      <Building2 size={24} />
                    </div>
                    <Badge variant={org.user_role === 'OWNER' ? 'ADMIN' : org.user_role} label={org.user_role} size="sm" />
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-brand-400 transition-colors uppercase tracking-tight">{org.name}</h3>
                  <div className="flex items-center gap-4 mt-4 text-[11px] font-bold text-dark-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Users size={12} /> {org.members_count || 0} Members</span>
                    <span className="flex items-center gap-1.5 font-inter"><Clock size={12} /> {formatDate(org.created_at)}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets - Activity Feed & My Tasks */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* Dynamic Progress Indicator (Sidebar Top) */}
          <GlassCard className="bg-gradient-to-br from-brand-600/10 to-transparent border-brand-500/20">
            <h4 className="text-xs font-black text-brand-400 uppercase tracking-widest mb-4">Workspace Velocity</h4>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-white">{orgStats?.completion_percentage || 0}%</span>
              <span className="text-sm font-bold text-brand-500 mb-1.5 flex items-center gap-0.5"><TrendingUp size={14}/> +12%</span>
            </div>
            <div className="w-full h-3 bg-dark-900 rounded-full overflow-hidden border border-dark-700/50">
              <div 
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--brand-500-rgb),0.5)]"
                style={{ width: `${orgStats?.completion_percentage || 0}%` }}
              />
            </div>
            <p className="text-[10px] text-dark-500 mt-4 leading-relaxed font-inter">
              Your team has completed <b>{orgStats?.completed_tasks || 0}</b> total milestones this month. Keep pushing toward the 100% mark!
            </p>
          </GlassCard>

          {renderMyTasks()}

          <hr className="border-dark-800" />

          {renderActivityFeed()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
