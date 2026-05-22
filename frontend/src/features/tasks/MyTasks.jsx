import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Calendar,
  Plus,
  Sparkles,
  User,
  ArrowRight
} from "lucide-react";
import { fetchTasks } from "./taskSlice";
import { getTeams } from "../teams/teamAPI";
import { getProjects, getProjectMemberships } from "../projects/projectAPI";
import { getTasks } from "./taskAPI";
import useCurrentOrg from "../../hooks/useCurrentOrg";
import Badge from "../../components/ui/Badge";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const MyTasks = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks, loading: tasksLoading } = useSelector((state) => state.task);
  const { organizations, refreshOrgs } = useCurrentOrg();

  const [loading, setLoading] = useState(true);
  const [teamsWithProjects, setTeamsWithProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const loadContext = useCallback(async () => {
    if (organizations.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      // 1. Fetch all teams for all organizations
      const teamsResponses = await Promise.all(
        organizations.map((org) =>
          getTeams(org.id)
            .then((res) => res.data?.results || res.data || [])
            .catch(() => [])
        )
      );
      const allTeams = teamsResponses.flat();

      // 2. Fetch all projects for all teams, along with their tasks and memberships
      const teamProjectsPromises = allTeams.map(async (team) => {
        try {
          const res = await getProjects(team.id);
          const projects = res.data?.results || res.data || [];

          // Fetch tasks and memberships in parallel for each project
          const enrichedProjects = await Promise.all(
            projects.map(async (project) => {
              try {
                const [tasksRes, membersRes] = await Promise.all([
                  getTasks(project.id).catch(() => ({ data: [] })),
                  getProjectMemberships(project.id).catch(() => ({ data: [] }))
                ]);

                const projectTasks = tasksRes.data?.results || tasksRes.data?.data?.results || tasksRes.data?.data || tasksRes.data || [];
                const projectMembers = membersRes.data?.results || membersRes.data?.data?.results || membersRes.data?.data || membersRes.data || [];

                return {
                  ...project,
                  tasks: projectTasks,
                  members: projectMembers
                };
              } catch (err) {
                return {
                  ...project,
                  tasks: [],
                  members: []
                };
              }
            })
          );

          return { ...team, projects: enrichedProjects };
        } catch (err) {
          return { ...team, projects: [] };
        }
      });

      const results = await Promise.all(teamProjectsPromises);
      // Filter out teams with no projects for a cleaner view
      setTeamsWithProjects(results.filter(t => t.projects.length > 0));
    } catch (err) {
      console.error("Context load failed", err);
      toast.error("Failed to load your workspace context");
    } finally {
      setLoading(false);
    }
  }, [organizations]);

  useEffect(() => {
    if (organizations.length === 0) {
      refreshOrgs();
    }
  }, []);

  useEffect(() => {
    if (organizations.length > 0) {
      loadContext();
    }
  }, [organizations, loadContext]);

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    dispatch(fetchTasks(projectId));
  };

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  const myTasks = tasks.filter((t) => t.assigned_to === user?.id);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in p-6 lg:p-8">
        <div className="page-header-container">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 text-transparent bg-clip-text tracking-tight mb-2">My Workspace</h1>
          <p className="text-dark-400">Loading your teams and projects...</p>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div
      className="space-y-10 pb-20 animate-fade-in p-6 lg:p-8 min-h-screen text-dark-100 relative overflow-hidden bg-transparent"
    >
      {/* Subtle top right atmospheric glowing highlight */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/8 via-cyan-500/3 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Header */}
      <div className="page-header-container border-b border-dark-800/60 pb-6">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600/10 to-cyan-500/10 border border-blue-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/5">
            <CheckCircle2 size={24} className="text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 text-transparent bg-clip-text tracking-tight mb-0">
            My Work
          </h1>
        </div>
        <p className="text-dark-300 font-light text-base leading-relaxed max-w-2xl">
          Manage your projects and tasks in one consolidated workspace. Powered by CrewFlow's predictive engine.
        </p>
      </div>

      {/* Teams and Projects Grid */}
      <div className="space-y-12">
        {teamsWithProjects.length === 0 ? (
          <div className="relative bg-[#0f172a]/45 backdrop-blur-[20px] border-dashed border-2 border-dark-700/60 rounded-[24px] p-16 text-center">
            <FolderKanban size={48} className="mx-auto text-dark-500 mb-4 animate-pulse" />
            <p className="text-dark-200 font-bold text-lg">No active projects found</p>
            <p className="text-dark-400 text-sm mt-1 max-w-sm mx-auto font-light leading-relaxed">
              Join teams and organizations to initialize and collaborate on active workspace streams.
            </p>
          </div>
        ) : (
          teamsWithProjects.map((team) => (
            <div key={team.id} className="space-y-5">

              {/* Group Title: Team Beta / Alpha with Spaced design and line */}
              <div className="flex items-center gap-2.5 px-1 border-b border-dark-800/40 pb-2">
                <Users size={14} className="text-cyan-400" />
                <h2 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.2em]">TEAM {team.name}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.projects.map((project) => {
                  const totalTasks = project.tasks?.length || 0;
                  const completedTasks = project.tasks?.filter(t => t.status === "DONE").length || 0;
                  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                  const activeColors = [
                    "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5",
                    "bg-cyan-600/10 text-cyan-400 border-cyan-500/20 shadow-cyan-500/5",
                    "bg-purple-600/10 text-purple-400 border-purple-500/20 shadow-purple-500/5"
                  ];
                  const colorTheme = activeColors[project.id % activeColors.length];

                  return (
                    <div
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      onMouseMove={handleCardMouseMove}
                      className={`relative bg-[#0f172a]/45 backdrop-blur-[20px] border border-white/[0.04] rounded-[24px] overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[5px] hover:scale-[1.015] hover:border-indigo-500/25 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),0_0_30px_rgba(99,102,241,0.12)] p-6 cursor-pointer group flex flex-col justify-between h-[230px] ${selectedProjectId === project.id
                        ? "border-brand-500/50 bg-brand-600/5 ring-1 ring-brand-500/30"
                        : "border-dark-700/50 hover:border-brand-500/20"
                        }`}
                    >
                      {/* Spotlight overlay - ::before equivalent */}
                      <div
                        className="absolute inset-0 rounded-[inherit] pointer-events-none z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out"
                        style={{
                          background: "radial-gradient(450px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.05) 30%, transparent 60%)"
                        }}
                      />
                      {/* Border spotlight overlay - ::after equivalent */}
                      <div
                        className="absolute -inset-[1px] rounded-[inherit] pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out"
                        style={{
                          background: "radial-gradient(300px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.35), rgba(6, 182, 212, 0.35) 30%, transparent 60%)"
                        }}
                      />

                      <div className="relative z-10 w-full flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div className={`p-2.5 rounded-xl border transition-all ${selectedProjectId === project.id
                            ? "bg-brand-600/20 text-brand-400 border-brand-500/30"
                            : `bg-dark-800 text-dark-400 group-hover:scale-105 ${colorTheme}`
                            }`}>
                            <FolderKanban size={18} />
                          </div>

                          {/* Real Sci-fi Status Badge */}
                          <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${project.status === 'COMPLETED'
                            ? "bg-brand-500/10 border-brand-500/20 text-brand-400 shadow-[0_0_12px_rgba(99,102,241,0.05)]"
                            : project.status === 'ARCHIVED'
                              ? "bg-dark-700/10 border-dark-700/20 text-dark-400"
                              : "bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.05)]"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'COMPLETED' ? "bg-brand-400" : project.status === 'ARCHIVED' ? "bg-dark-400" : "bg-green-400 animate-pulse"
                              }`} />
                            <span>{project.status || "ACTIVE"}</span>
                          </div>
                        </div>

                        <div>
                          <h3 className={`text-xl font-bold tracking-tight transition-all duration-300 ${selectedProjectId === project.id
                            ? "text-brand-400"
                            : "text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400"
                            }`}>
                            {project.name}
                          </h3>
                          <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest mt-1">
                            TEAM {team.name}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar & Footer */}
                      <div className="relative z-10 w-full mt-4 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] uppercase font-bold text-dark-400 tracking-wider">
                            <span>Progress</span>
                            <span className="font-mono text-white text-[11px] font-bold">{progress}%</span>
                          </div>
                          <div className="w-full bg-dark-900/60 rounded-full h-1.5 overflow-hidden border border-white/5 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-1.5 border-t border-white/[0.03]">
                          {/* Real Avatars of project members */}
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {project.members && project.members.length > 0 ? (
                              project.members.slice(0, 4).map((member, idx) => (
                                <div
                                  key={member.id || idx}
                                  className="inline-block h-5 w-5 rounded-full ring-1 ring-dark-900 bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 text-[8px] font-bold text-white flex items-center justify-center uppercase"
                                  title={member.user_full_name}
                                >
                                  {member.user_full_name ? member.user_full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                                </div>
                              ))
                            ) : (
                              <div className="inline-block h-5 w-5 rounded-full ring-1 ring-dark-900 bg-dark-800 border border-white/10 text-[8px] font-bold text-dark-500 flex items-center justify-center">
                                -
                              </div>
                            )}
                          </div>

                          <span className="text-[10px] text-dark-500 font-mono">
                            {project.deadline ? `Due ${formatDate(project.deadline)}` : "No deadline"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Initialize New Project placeholder card */}
                <div
                  onClick={() => toast.success("Initialization setup coming soon!")}
                  className="relative bg-[#0f172a]/45 backdrop-blur-[20px] border-dashed border-2 border-dark-700/60 hover:border-brand-500/40 rounded-[24px] overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[5px] hover:scale-[1.015] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),0_0_30px_rgba(99,102,241,0.12)] p-6 flex flex-col items-center justify-center h-[230px] text-center cursor-pointer group hover:bg-brand-600/5"
                >
                  <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center border border-dark-700 group-hover:border-brand-500/30 group-hover:scale-110 transition-transform">
                    <Plus size={18} className="text-dark-400 group-hover:text-brand-400" />
                  </div>
                  <span className="text-xs font-bold text-dark-400 uppercase tracking-widest mt-4 group-hover:text-brand-400">Initialize New Project</span>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Project Tasks */}
      {selectedProjectId && (
        <div className="space-y-6 pt-10 border-t border-dark-850 animate-slide-in">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Sparkles size={20} className="text-brand-400" />
              <span>Assigned Tasks</span>
              <span className="text-xs font-bold bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full border border-brand-500/25">
                {myTasks.length} {myTasks.length === 1 ? "task" : "tasks"}
              </span>
            </h2>
          </div>

          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : myTasks.length === 0 ? (
            <div className="relative bg-[#0f172a]/45 backdrop-blur-[20px] border border-white/[0.04] rounded-[24px] p-12 text-center flex flex-col items-center justify-center">
              <AlertCircle size={32} className="text-dark-500 mb-3" />
              <p className="text-dark-300 font-bold">No tasks assigned to you in this project</p>
              <p className="text-dark-500 text-xs mt-1 font-light">Check the project board for unassigned tasks.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myTasks.map((task) => {
                const statusColors = {
                  DONE: "bg-green-500 shadow-green-500/50",
                  IN_PROGRESS: "bg-blue-500 shadow-blue-500/50",
                  TODO: "bg-dark-500 shadow-dark-500/50"
                };

                return (
                  <div
                    key={task.id}
                    onMouseMove={handleCardMouseMove}
                    className="relative bg-[#0f172a]/30 backdrop-blur-[15px] border border-white/[0.03] rounded-[16px] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[2px] hover:border-indigo-500/15 hover:bg-[#0f172a]/50 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.4)] p-5 flex items-center justify-between group cursor-pointer"
                  >
                    {/* Spotlight overlay - ::before equivalent */}
                    <div
                      className="absolute inset-0 rounded-[inherit] pointer-events-none z-[1] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
                      style={{
                        background: "radial-gradient(350px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.06), transparent 60%)"
                      }}
                    />

                    <div className="flex items-center gap-4 min-w-0 relative z-10">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${statusColors[task.status] || "bg-dark-500"
                        }`} />
                      <div className="min-w-0">
                        <p className="font-bold text-dark-100 truncate text-base group-hover:text-brand-400 transition-colors">
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <Badge variant={task.status} size="xs" />
                          <span className="flex items-center gap-1.5 text-[10px] text-dark-500 font-bold uppercase tracking-widest">
                            <Calendar size={11} className="text-dark-500" />
                            {task.due_date ? formatDate(task.due_date) : "No deadline"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                      <Badge variant={task.priority} size="xs" />
                      <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center border border-dark-700 group-hover:border-brand-500/30 transition-all">
                        <ChevronRight size={16} className="text-dark-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
