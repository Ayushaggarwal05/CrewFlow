import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Calendar
} from "lucide-react";
import { fetchTasks } from "./taskSlice";
import { getTeams } from "../teams/teamAPI";
import { getProjects } from "../projects/projectAPI";
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

      // 2. Fetch all projects for all teams
      const teamProjectsPromises = allTeams.map(async (team) => {
        try {
          const res = await getProjects(team.id);
          const projects = res.data?.results || res.data || [];
          return { ...team, projects };
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
    loadContext();
  }, [loadContext]);

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    dispatch(fetchTasks(projectId));
  };

  const myTasks = tasks.filter((t) => t.assigned_to === user?.id);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="page-header-container">
          <h1 className="page-header">My Workspace</h1>
          <p className="text-dark-400">Loading your teams and projects...</p>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-fade-in">
      {/* Header */}
      <div className="page-header-container">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-600/10 rounded-xl flex items-center justify-center border border-brand-500/20">
            <CheckCircle2 size={24} className="text-brand-400" />
          </div>
          <h1 className="page-header mb-0">My Work</h1>
        </div>
        <p className="text-dark-400">Manage your projects and tasks in one consolidated workspace.</p>
      </div>

      {/* Teams and Projects Grid */}
      <div className="space-y-8">
        {teamsWithProjects.length === 0 ? (
          <div className="glass-panel p-12 text-center border-dashed border-2">
            <FolderKanban size={48} className="mx-auto text-dark-600 mb-4" />
            <p className="text-dark-300 font-medium text-lg">No active projects found</p>
            <p className="text-dark-500 text-sm mt-2">You haven't joined any projects yet.</p>
          </div>
        ) : (
          teamsWithProjects.map((team) => (
            <div key={team.id} className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Users size={16} className="text-brand-500" />
                <h2 className="text-sm font-bold text-dark-300 uppercase tracking-widest">{team.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id)}
                    className={`glass-panel p-5 cursor-pointer transition-all duration-300 group ${
                      selectedProjectId === project.id 
                        ? "border-brand-500 bg-brand-600/5 ring-1 ring-brand-500/50" 
                        : "border-dark-700/50 hover:border-brand-500/30 hover:bg-dark-800/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        selectedProjectId === project.id ? "bg-brand-600/20 text-brand-400" : "bg-dark-700 text-dark-400 group-hover:bg-brand-600/10 group-hover:text-brand-400"
                      }`}>
                        <FolderKanban size={18} />
                      </div>
                      <Badge variant={project.status} size="xs" />
                    </div>
                    
                    <h3 className={`font-bold transition-colors ${
                      selectedProjectId === project.id ? "text-brand-400" : "text-dark-50 group-hover:text-brand-400"
                    }`}>{project.name}</h3>
                    
                    <div className="flex items-center gap-2 mt-3 text-[11px] font-medium text-dark-500 uppercase tracking-wider">
                      <span>{team.name}</span>
                      {project.deadline && (
                        <>
                          <span className="w-1 h-1 bg-dark-600 rounded-full" />
                          <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(project.deadline)}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Selected Project Tasks */}
      {selectedProjectId && (
        <div className="space-y-6 pt-6 border-t border-dark-800 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-dark-50 flex items-center gap-2">
              Assigned Tasks 
              <span className="text-xs font-medium bg-dark-800 text-dark-400 px-2 py-0.5 rounded-full border border-dark-700">
                {myTasks.length}
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
            <div className="glass-panel p-10 text-center flex flex-col items-center justify-center">
              <AlertCircle size={32} className="text-dark-600 mb-3" />
              <p className="text-dark-400 font-medium">No tasks assigned to you in this project</p>
              <p className="text-dark-600 text-xs mt-1">Check the project board for unassigned work.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {myTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="glass-panel p-4 flex items-center justify-between hover:bg-dark-800/40 transition-all border-dark-700/30"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-2 h-2 rounded-full ${
                      task.status === "DONE" ? "bg-green-500" : task.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-dark-500"
                    }`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-dark-100 truncate">{task.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={task.status} size="xs" />
                        <span className="flex items-center gap-1 text-[10px] text-dark-500 font-bold uppercase tracking-tighter">
                          <Calendar size={10} />
                          {task.due_date ? formatDate(task.due_date) : "No deadline"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={task.priority} size="xs" />
                    <ChevronRight size={18} className="text-dark-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
