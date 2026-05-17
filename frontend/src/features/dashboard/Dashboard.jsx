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
  MoreHorizontal,
  FileText,
  Map,
  Settings
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

const GlassCard = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-[#1E293B] border border-white/5 border-t-white/10 rounded-lg p-5 relative transition-all duration-300 ${onClick ? 'cursor-pointer hover:border-[#8B5CF6]/50 hover:bg-[#1E293B]/80' : ''} ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({
  icon,
  label,
  value,
  subtext,
  color = "brand",
  loading = false,
}) => {
  const Icon = icon;
  
  if (loading)
    return (
      <div className="animate-pulse bg-[#1E293B] h-32 rounded-lg border border-white/5" />
    );

  return (
    <GlassCard className="flex flex-col justify-between group h-32 hover:border-[#8B5CF6]/30">
      <div className="flex items-start justify-between">
        <div className="text-[#8B5CF6]">
          <Icon size={20} strokeWidth={2} />
        </div>
        {subtext && (
          <span className="text-[10px] font-mono tracking-wider text-[#c5c6cd] uppercase">
            {subtext}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-mono tracking-widest text-[#c5c6cd] uppercase mb-1">
          {label}
        </p>
        <p className="text-3xl font-bold text-[#dae2fd] tracking-tight leading-none font-sans">
          {value}
        </p>
      </div>
    </GlassCard>
  );
};

const SectionHeader = ({ title, icon: Icon, children }) => (
  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
    <h2 className="text-lg font-bold text-[#dae2fd] flex items-center gap-2 tracking-tight font-sans">
      {Icon && <Icon size={18} className="text-[#8B5CF6]" />}
      {title}
    </h2>
    {children}
  </div>
);

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-[#1E293B]/50 rounded-lg border border-dashed border-white/10">
    <div className="w-12 h-12 bg-[#0F172A] rounded-lg flex items-center justify-center mb-4 text-[#c5c6cd] border border-white/5">
      <Icon size={24} />
    </div>
    <h3 className="text-md font-semibold text-[#dae2fd]">{title}</h3>
    <p className="text-[#c5c6cd] text-sm mt-1 max-w-xs">{description}</p>
    {actionText && (
      <button onClick={onAction} className="mt-5 px-4 py-2 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-sm font-medium rounded transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
        {actionText}
      </button>
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
  const { activities, loading: activityLoading } = useSelector(
    (state) => state.activity,
  );
  const { role } = useRole();

  // Local State for non-centralized data (Teams/Projects)
  const [recentProjects, setRecentProjects] = useState([]);
  const [subordinates, setSubordinates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Computed
  const firstName = useMemo(
    () => user?.full_name?.split(" ")?.[0] || "there",
    [user?.full_name],
  );
  const currentOrg = useMemo(
    () => organizations.find((o) => Number(o.id) === Number(orgId)),
    [organizations, orgId],
  );

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
          teams
            .slice(0, 3)
            .map((t) => getProjects(t.id).catch(() => ({ data: [] }))),
        );
        const allProj = projectRes.flatMap((r) =>
          Array.isArray(r.data) ? r.data : [],
        );
        setRecentProjects(
          allProj
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5),
        );
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
      await dispatch(
        toggleTaskDone({
          projectId: task.project,
          taskId: task.id,
          currentStatus: task.status,
        }),
      ).unwrap();
      toast.success("Task status updated! 🎉");
      dispatch(fetchOrgStats(orgId));
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  // --- Render Sections ---

  const renderStats = () => {
    if (!orgStats && loading)
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-[#1E293B] h-32 rounded-lg border border-white/5" />
          ))}
        </div>
      );

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FolderKanban}
          label="Active Projects"
          value={`${orgStats?.active_projects_count || 0}/${orgStats?.projects_count || 0}`}
          subtext="+2 this week"
          color="brand"
        />
        <StatCard
          icon={CheckCircle2}
          label="Total Tasks"
          value={orgStats?.total_tasks || 0}
          subtext="Steady"
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate"
          value={`${orgStats?.completion_percentage || 0}%`}
          subtext="+5%"
          color="green"
        />
        <StatCard
          icon={Users}
          label="Team Size"
          value={orgStats?.members_count || 0}
          subtext={`${Math.floor((orgStats?.members_count || 0) / 5) || 1} active teams`}
          color="purple"
        />
      </div>
    );
  };

  const renderMyTasks = () => (
    <div className="space-y-4">
      <SectionHeader title="Your Focus" icon={LayoutDashboard}>
        <button
          onClick={() => navigate("/app/tasks")}
          className="text-[10px] font-mono text-[#8B5CF6] uppercase tracking-widest hover:text-[#D8B4FE] transition-colors flex items-center gap-1"
        >
          View Schedule <ArrowRight size={12} />
        </button>
      </SectionHeader>
      {myTasks.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="All caught up!"
          description="No tasks assigned to you right now. Take a break or check other projects."
        />
      ) : (
        <div className="space-y-3">
          {myTasks.slice(0, 3).map((task) => (
            <GlassCard
              key={task.id}
              className="!p-4 flex items-center justify-between group/task"
              onClick={() => navigate(`/app/projects/${task.project}/tasks`)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded bg-[#0F172A] border border-white/5 flex items-center justify-center text-[#c5c6cd]">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#dae2fd] truncate text-sm">
                    {task.title}
                  </p>
                  <p className="text-[11px] text-[#c5c6cd] mt-0.5 truncate">
                    {task.project_name || "Project"} • {task.status.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded ${task.status === 'DONE' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : task.due_date && new Date(task.due_date) < new Date() ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-[#c5c6cd]'}`}>
                   {task.status === 'DONE' ? 'Completed' : task.due_date ? 'Due soon' : 'Pending'}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  const renderActivityFeed = () => (
    <div className="space-y-4">
      <SectionHeader title="Recent Activity" icon={Activity}>
        <button
          onClick={() => navigate("/app/activity")}
          className="text-[10px] font-mono text-[#8B5CF6] uppercase tracking-widest hover:text-[#D8B4FE] transition-colors"
        >
          View All
        </button>
      </SectionHeader>
      <GlassCard className="!p-4">
        {activities.length === 0 && !activityLoading ? (
          <div className="py-6 text-center text-[#c5c6cd] text-sm font-mono">
            No recent activity detected.
          </div>
        ) : (
          <div className="space-y-4">
             {activities.slice(0, 3).map((act, i) => {
               const userName = act.user?.full_name?.split(" ")[0] || "Someone";
               const fullUserName = act.user?.full_name || "Unknown";
               const actionText = act.action ? act.action.toLowerCase() : "updated something";
               const projectName = act.project?.name;
               const orgName = act.organization?.name;

               // Determine a simple shape/color indicator based on action
               let indicatorColor = "bg-[#8B5CF6]"; // default
               if (actionText.includes("created") || actionText.includes("added")) indicatorColor = "bg-emerald-400";
               if (actionText.includes("deleted") || actionText.includes("removed")) indicatorColor = "bg-red-400";
               if (actionText.includes("joined") || actionText.includes("invited")) indicatorColor = "bg-[#D8B4FE]";

               return (
                <div key={act.id || i} className="flex gap-4 items-start relative pb-4 border-b border-white/5 last:border-0 last:pb-0 group/act">
                   {/* Avatar & Indicator */}
                   <div className="relative shrink-0 mt-0.5">
                     <div className="w-9 h-9 rounded-lg bg-[#0F172A] border border-white/10 flex items-center justify-center text-[11px] text-[#8B5CF6] font-bold shadow-md group-hover/act:border-[#8B5CF6]/30 transition-colors">
                       {getInitials(fullUserName)}
                     </div>
                     <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#1E293B] ${indicatorColor} shadow-[0_0_8px_rgba(139,92,246,0.3)]`}></div>
                   </div>
                   
                   <div className="pt-0.5">
                     <p className="text-sm text-[#c5c6cd]">
                       <strong className="text-[#dae2fd]">{userName}</strong> {actionText} {projectName && <span className="text-[#D8B4FE] font-medium">{projectName}</span>}
                       {!projectName && orgName && <span className="text-[#D8B4FE] font-medium">{orgName}</span>}
                     </p>
                     <p className="text-[10px] font-mono text-[#c5c6cd]/50 mt-1 uppercase tracking-wider">
                       {act.timestamp ? new Date(act.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Just now"}
                     </p>
                   </div>
                </div>
               );
             })}
          </div>
        )}
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans selection:bg-[#8B5CF6]/30">
      <div className="max-w-[1600px] mx-auto space-y-8 pb-20 px-4 md:px-8 pt-8 animate-fade-in">
        {/* Premium Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-bold text-[#dae2fd] tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-[#c5c6cd] font-medium mt-1 text-sm">
              Here is what's happening across <span className="text-[#8B5CF6] font-semibold">{currentOrg?.name || "your workspace"}</span> today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {organizations.length > 0 && (
              <div className="relative group flex items-center bg-[#1E293B] border border-white/10 rounded-lg px-3 py-1.5 hover:border-[#8B5CF6]/50 transition-colors">
                <span className="text-xs font-mono text-[#dae2fd] uppercase tracking-wider select-none pr-3 border-r border-white/10">{currentOrg?.name || "Workspace"}</span>
                <select
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  value={orgId || ""}
                  onChange={(e) => setSelectedOrg(Number(e.target.value))}
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                <div className="ml-3 text-[10px] font-mono text-[#8B5CF6] uppercase tracking-widest cursor-pointer">Switch</div>
              </div>
            )}
            <button
              onClick={() => navigate("/app/organizations")}
              className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white text-xs font-mono uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            >
              Workspace Settings
            </button>
          </div>
        </div>

        {renderStats()}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Areas */}
          <div className="lg:col-span-8 space-y-6">
            {/* Workspace Velocity */}
            <GlassCard className="!p-8 !bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#8B5CF6]/20">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-2xl font-bold text-[#dae2fd] tracking-tight">Workspace Velocity</h2>
                   <p className="text-[#c5c6cd] text-sm mt-1">Quarterly Goal Achievement</p>
                 </div>
                 <div className="text-5xl font-bold text-[#dae2fd] tracking-tighter">
                   {orgStats?.completion_percentage || 0}%
                 </div>
              </div>
              <div className="w-full h-3 bg-[#0F172A] rounded-full overflow-hidden border border-white/5 mb-6">
                <div
                  className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#D8B4FE] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                  style={{ width: `${orgStats?.completion_percentage || 0}%` }}
                />
              </div>
              <div className="flex gap-12 border-t border-white/5 pt-4">
                 <div>
                   <p className="text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest mb-1">Current Output</p>
                   <p className="text-sm font-semibold text-[#dae2fd]">High Performance</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest mb-1">Estimated Completion</p>
                   <p className="text-sm font-semibold text-[#dae2fd]">14 Days Early</p>
                 </div>
              </div>
            </GlassCard>

            {/* Quick Workspace: Recent Projects */}
            <div className="space-y-4">
              <SectionHeader title="Recent Projects" icon={FolderKanban}>
                <button
                  onClick={() => navigate("/app/projects")}
                  className="px-3 py-1 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest border border-white/10 rounded hover:bg-white/5 transition-colors"
                >
                  Export Report
                </button>
              </SectionHeader>

              {recentProjects.length === 0 ? (
                <EmptyState
                  icon={Plus}
                  title="No projects yet"
                  description="Create your first project to start tracking tasks and progress."
                  actionText="Create Project"
                  onAction={() => navigate("/app/projects")}
                />
              ) : (
                <GlassCard className="!p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="py-3 px-5 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal">Project Name</th>
                          <th className="py-3 px-5 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal">Lead</th>
                          <th className="py-3 px-5 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal">Status</th>
                          <th className="py-3 px-5 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal">Progress</th>
                          <th className="py-3 px-5 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {recentProjects.slice(0, 4).map((project) => (
                          <tr key={project.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(`/app/projects/${project.id}/tasks`)}>
                            <td className="py-4 px-5">
                              <p className="text-sm font-semibold text-[#dae2fd]">{project.name}</p>
                              <p className="text-[11px] text-[#c5c6cd] mt-0.5 truncate max-w-[200px]">{project.description || "Infrastructure Upgrade"}</p>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center text-[10px] text-[#8B5CF6] font-bold">
                                  {getInitials(project.lead_name || project.created_by_name || "U")}
                                </div>
                                <span className="text-sm text-[#dae2fd]">{project.lead_name || project.created_by_name || "Unassigned"}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-full ${project.status === 'ACTIVE' ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : project.status === 'COMPLETED' ? 'bg-[#D8B4FE]/20 text-[#D8B4FE]' : 'bg-white/10 text-[#c5c6cd]'}`}>
                                {project.status || "Active"}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-1.5 bg-[#0F172A] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#8B5CF6]" style={{ width: `${Math.floor(Math.random() * 60) + 20}%` }}></div>
                                </div>
                                <span className="text-xs font-mono text-[#dae2fd]">88%</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <button className="p-1 text-[#c5c6cd] hover:text-[#8B5CF6] transition-colors">
                                <MoreHorizontal size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* My Team (For Admins/Managers) */}
            {role !== "MEMBER" && (
              <div className="space-y-4">
                <SectionHeader title="Active Members" icon={Users}>
                  <button
                    onClick={() => navigate("/app/organizations")}
                    className="text-[10px] font-mono text-[#8B5CF6] uppercase tracking-widest hover:text-[#D8B4FE]"
                  >
                    Invite More
                  </button>
                </SectionHeader>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {subordinates.length === 0 ? (
                    <div className="col-span-full">
                      <EmptyState
                        icon={UserPlus}
                        title="No Active Members"
                        description="You don't have any direct subordinates in this workspace."
                      />
                    </div>
                  ) : (
                    subordinates.slice(0, 6).map((sub) => (
                      <GlassCard
                        key={sub.id}
                        className="!p-3 flex items-center gap-3 hover:bg-white/[0.02]"
                      >
                        <div className="w-10 h-10 rounded bg-[#0F172A] flex items-center justify-center text-[#8B5CF6] font-bold border border-white/5">
                          {getInitials(sub.user_full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#dae2fd] truncate text-sm">
                            {sub.user_full_name}
                          </p>
                          <p className="text-[10px] font-mono text-[#c5c6cd] uppercase tracking-wider truncate">
                            {sub.role_display || sub.role}
                          </p>
                        </div>
                      </GlassCard>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Actions Grid */}
            <div className="space-y-4">
              <SectionHeader title="Quick Actions" icon={Map} />
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "New Task",
                    icon: Plus,
                    action: () =>
                      navigate(
                        recentProjects.length > 0
                          ? `/app/projects/${recentProjects[0].id}/tasks`
                          : "/app/projects",
                      ),
                  },
                  {
                    label: "Members",
                    icon: UserPlus,
                    action: () => navigate("/app/organizations"),
                  },
                  {
                    label: "Teams",
                    icon: Users,
                    action: () => navigate(`/app/organizations/${orgId}/teams`),
                  },
                  {
                    label: "Settings",
                    icon: Settings,
                    action: () => navigate("/app/projects"),
                  },
                ].map((act, i) => (
                  <GlassCard
                    key={i}
                    onClick={act.action}
                    className="flex flex-col items-center justify-center gap-2 !p-4 hover:border-[#8B5CF6]/50 group"
                  >
                    <act.icon size={20} className="text-[#c5c6cd] group-hover:text-[#8B5CF6] transition-colors" />
                    <span className="text-[10px] font-mono text-[#c5c6cd] group-hover:text-[#dae2fd] uppercase tracking-widest transition-colors">
                      {act.label}
                    </span>
                  </GlassCard>
                ))}
              </div>
            </div>

            {renderMyTasks()}

            {renderActivityFeed()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
