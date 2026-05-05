import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Plus, X, Send, Users, FolderKanban, CheckCircle2, TrendingUp, Calendar, Trash2, MessageSquare } from "lucide-react";

import { getProject, getProjectMemberships, updateProjectMembership } from "./projectAPI";
import { getTasks, createTask, updateTask, deleteTask } from "../tasks/taskAPI";
import { getComments, createComment } from "../comments/commentAPI";
import { getTeamUsers } from "../teams/teamAPI";
import useRole from "../../hooks/useRole";
import { getInitials, getAvatarColor } from "../../utils/helpers";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";
import JoinCodeCard from "../invites/JoinCodeCard";
import Badge from "../../components/ui/Badge";

const ProjectDetails = () => {
  const { teamId, projectId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useRole();
  const { user } = useSelector((state) => state.auth);

  // for data handling
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const myProjectRole = projectMembers.find((m) => m.user === user?.id)?.role;

  // holding states between
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  // comments states
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  // task states
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    due_date: "",
    assigned_to: "",
  });

  const loadData = useCallback(async () => {
    if (!teamId || !projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        getProject(teamId, projectId),
        getTasks(projectId),
        getTeamUsers(teamId),
      ]);

      setProject(projRes.data?.data || projRes.data);
      setTasks(tasksRes.data?.results || tasksRes.data?.data || tasksRes.data || []);
      setTeamUsers(usersRes.data?.results || usersRes.data?.data || usersRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }

    // Fetch project members separately (non-blocking)
    setLoadingMembers(true);
    try {
      const membersRes = await getProjectMemberships(projectId);
      setProjectMembers(membersRes.data?.results || membersRes.data || []);
    } catch (err) {
      console.error("Members fetch failed", err);
    } finally {
      setLoadingMembers(false);
    }
  }, [teamId, projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadComments = async (taskId) => {
    setLoadingComments(true);
    try {
      const res = await getComments(taskId);
      setComments(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    loadComments(task.id);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreatingTask(true);

    try {
      // (...taskform ) used to the previous data store in it and new data
      const payload = { ...taskForm, project: projectId };

      if (!payload.assigned_to) delete payload.assigned_to;
      if (!payload.due_date) delete payload.due_date;

      const res = await createTask(projectId, payload);
      const newTask = res.data?.data || res.data;

      setTasks((prev) => [...prev, newTask]);
      toast.success("Task created!");

      setShowCreateTask(false);
      setTaskForm({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        due_date: "",
        assigned_to: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (task, status) => {
    try {
      const res = await updateTask(projectId, task.id, { status });
      console.log("Update Task Response:", res);

      setTasks((prev) =>
        prev.map((t) => (String(t.id) === String(task.id) ? { ...t, status } : t))
      );
      if (selectedTask?.id === task.id) {
        setSelectedTask((prev) => ({ ...prev, status }));
      }
      toast.success("Task updated!");
    } catch (err) {
      console.error("Task update failed:", err.response?.data || err.message);
      const errorData = err.response?.data;
      const errorMsg = typeof errorData?.message === 'object'
        ? JSON.stringify(errorData.message)
        : (errorData?.message || errorData?.detail || "Failed to update task");

      toast.error(errorMsg);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this task?")) return;

    try {
      await deleteTask(projectId, taskId);

      setTasks((prev) => prev.filter((t) => t.id !== taskId));

      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }

      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateRole = async (membershipId, newRole) => {
    try {
      await updateProjectMembership(projectId, membershipId, { role: newRole });
      setProjectMembers((prev) =>
        prev.map((m) =>
          m.id === membershipId ? { ...m, role: newRole, role_display: newRole } : m
        )
      );
      toast.success("Role updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();

    if (!selectedTask || !newComment.trim()) return;

    try {
      const res = await createComment(selectedTask.id, {
        content: newComment.trim(),
      });
      const newC = res.data?.data || res.data;

      setComments((prev) => [...prev, newC]);
      setNewComment("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to post comment");
    }
  };

  const tcChange = (k) => (e) =>
    setTaskForm((prev) => ({ ...prev, [k]: e.target.value }));

  const tasksByStatus = (status) => tasks.filter((t) => t.status === status);

  if (loading) return <CardSkeleton count={3} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-dark-800 border border-dark-700 text-dark-400 hover:text-white transition-all hover:bg-dark-700"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest bg-brand-500/10 px-2 py-0.5 rounded-md">Project Dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{project?.name}</h1>
          </div>
        </div>

        {project?.deadline && (
          <div className="flex items-center gap-3 px-4 py-2 bg-dark-800/40 rounded-2xl border border-dark-700/50">
            <div className="p-2 bg-brand-600/20 text-brand-400 rounded-lg">
              <Calendar size={16} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-dark-500 uppercase tracking-tighter">Deadline</p>
              <p className="text-sm font-bold text-dark-100">{formatDate(project.deadline)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Quick View (Safe - uses existing data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: tasks.length, icon: FolderKanban, color: "brand" },
          { label: "Done", value: tasks.filter(t => t.status === "DONE").length, icon: CheckCircle2, color: "green" },
          { label: "Team Size", value: projectMembers.length, icon: Users, color: "blue" },
          { label: "Efficiency", value: `${tasks.length ? Math.round((tasks.filter(t => t.status === "DONE").length / tasks.length) * 100) : 0}%`, icon: TrendingUp, color: "purple" }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-4 flex items-center gap-3.5 border-dark-700/30">
            <div className={`p-2 rounded-xl bg-dark-900 text-${stat.color}-400 border border-dark-700/50`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none">{stat.value}</p>
              <p className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {project && (isAdmin || myProjectRole === "MANAGER") && (
        <div className="mb-4">
          <JoinCodeCard
            entityType="projects"
            entityId={projectId}
            parentEntityId={teamId}
            initialCode={project.join_code}
          />
        </div>
      )}

      {/* Task Toolbar */}
      <div className="flex justify-between items-center bg-dark-800/40 p-3 rounded-2xl border border-dark-700/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 pl-2">
          <FolderKanban size={18} className="text-brand-500" />
          <h2 className="text-sm font-bold text-dark-100 uppercase tracking-widest">Kanban Board</h2>
        </div>
        {(isAdmin || myProjectRole === "MANAGER" || myProjectRole === "LEAD") && (
          <Button onClick={() => setShowCreateTask(true)} icon={Plus} size="sm">
            Add Task
          </Button>
        )}
      </div>

      {/* Kanban */}
      <div className="grid md:grid-cols-3 gap-6">
        {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
          <div key={status} className="bg-dark-900/40 p-4 rounded-2xl border border-dark-800/50 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xs font-black text-dark-400 uppercase tracking-[0.2em]">{status.replace("_", " ")}</h3>
              <span className="text-[10px] font-bold bg-dark-800 text-dark-500 px-2 py-0.5 rounded-full border border-dark-700">
                {tasksByStatus(status).length}
              </span>
            </div>

            <div className="space-y-3 flex-1">
              {tasksByStatus(status).length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-dark-800 rounded-xl opacity-20 py-10">
                  <FolderKanban size={24} />
                </div>
              ) : tasksByStatus(status).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className="glass-panel p-4 hover:border-brand-500/40 transition-all group cursor-pointer border-dark-700/30 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-bold text-dark-100 group-hover:text-brand-400 transition-colors text-sm">
                      {task.title}
                    </p>
                    {task.assigned_to && (
                      <div className="w-6 h-6 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-[10px] font-bold text-dark-400 shrink-0">
                        {projectMembers.find(m => m.user === task.assigned_to)?.user_full_name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>

                  {/* Status controls */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dark-800/50">
                    {["TODO", "IN_PROGRESS", "DONE"].map((s) => (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateTaskStatus(task, s);
                        }}
                        className={`text-[9px] font-black px-2 py-1 rounded-md transition-all ${task.status === s
                          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                          : "bg-dark-800 text-dark-500 hover:text-dark-200 hover:bg-dark-700"
                          }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}

                    {(isAdmin || myProjectRole === "MANAGER" || myProjectRole === "LEAD") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="ml-auto p-1.5 text-dark-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail View */}
      {selectedTask && (
        <div className="glass-panel p-6 border-brand-500/20 bg-brand-500/5 animate-slide-up">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={selectedTask.status} size="xs" />
                <Badge variant={selectedTask.priority} size="xs" />
              </div>
              <h2 className="text-xl font-black text-white">{selectedTask.title}</h2>
            </div>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-2 rounded-lg bg-dark-800 text-dark-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Description Block */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Description</h3>
              <div className="p-4 rounded-xl bg-dark-900/50 border border-dark-700/30 text-sm text-dark-200 leading-relaxed min-h-[60px]">
                {selectedTask.description || <span className="text-dark-500 italic">No description provided.</span>}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-dark-900/30 border border-dark-800/50">
                <p className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-1">Assigned To</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-brand-600/20 flex items-center justify-center text-[10px] font-bold text-brand-400">
                    {projectMembers.find(m => m.user === selectedTask.assigned_to)?.user_full_name?.charAt(0) || "U"}
                  </div>
                  <p className="text-xs font-bold text-dark-100">
                    {projectMembers.find(m => m.user === selectedTask.assigned_to)?.user_full_name || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-dark-900/30 border border-dark-800/50">
                <p className="text-[9px] font-black text-dark-500 uppercase tracking-widest mb-1">Due Date</p>
                <div className="flex items-center gap-2">
                  <Calendar size={12} className="text-dark-500" />
                  <p className="text-xs font-bold text-dark-100">
                    {selectedTask.due_date ? formatDate(selectedTask.due_date) : "No deadline"}
                  </p>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-dark-800/50 my-6" />

            {/* Comments Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} className="text-brand-500" />
                <h3 className="text-[10px] font-black text-dark-100 uppercase tracking-widest">Discussion</h3>
              </div>

              {loadingComments ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-12 bg-dark-800 animate-pulse rounded-lg" />)}
                </div>
              ) : comments.length === 0 ? (
                <div className="p-4 text-center bg-dark-900/20 rounded-xl border border-dashed border-dark-800">
                  <p className="text-xs text-dark-500 font-medium">No discussion yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${getAvatarColor(c.user?.full_name)}`}>
                        {getInitials(c.user?.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-dark-100">{c.user?.full_name}</span>
                          <span className="text-[9px] text-dark-500 font-bold uppercase tracking-tighter">
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-dark-800/50 border border-dark-700/30 text-xs text-dark-300 leading-relaxed">
                          {c.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handlePostComment} className="flex gap-2 mt-2">
                <input
                  className="input-base flex-1"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write comment..."
                />
                <button type="submit">
                  <Send size={14} />
                </button>
              </form>
            </div> {/* End space-y-4 */}
          </div> {/* End space-y-6 */}
        </div>
      )}

      {/* ── Project Members (read-only) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-brand-400" />
          <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">Project Members</h2>
          <span className="text-xs text-dark-500 ml-auto">{projectMembers.length} member{projectMembers.length !== 1 ? "s" : ""}</span>
        </div>

        {loadingMembers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-dark-700" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-dark-700 rounded w-1/2" />
                    <div className="h-2 bg-dark-800 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : projectMembers.length === 0 ? (
          <p className="text-sm text-dark-500 italic">No members have joined this project yet</p>
        ) : (
          <div className="space-y-6">
            {["MANAGER", "LEAD", "MEMBER"].map((roleGroup) => {
              const groupMembers = projectMembers.filter((m) => m.role === roleGroup);
              if (groupMembers.length === 0) return null;

              return (
                <div key={roleGroup} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-[1px] flex-1 bg-dark-800" />
                    <h3 className="text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">
                      {roleGroup === "MANAGER" ? "Manager" : roleGroup === "LEAD" ? "Team Leads" : "Collaborators"}
                    </h3>
                    <div className="h-[1px] flex-1 bg-dark-800" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupMembers.map((m) => (
                      <div key={m.id} className="glass-panel p-4 flex items-center gap-4 border-dark-700/30 hover:border-dark-700 transition-all group">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0 ${getAvatarColor(m.user_full_name || m.user_email || "")
                              }`}
                          >
                            {getInitials(m.user_full_name || "U")}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-dark-50 text-sm truncate">
                              {m.user_full_name || "Unknown User"}
                            </p>
                            {m.user_email && (
                              <p className="text-xs text-dark-400 truncate">{m.user_email}</p>
                            )}
                          </div>

                          {/* Role badge / dropdown */}
                          {(isAdmin || myProjectRole === "MANAGER") && m.role !== "MANAGER" ? (
                            <select
                              value={m.role}
                              onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                              className="cursor-pointer text-xs px-2 py-1 rounded-lg border border-dark-600 bg-dark-800 text-dark-200 focus:outline-none focus:border-brand-500 transition-colors hover:border-brand-400"
                            >
                              <option value="LEAD">LEAD</option>
                              <option value="MEMBER">MEMBER</option>
                            </select>
                          ) : (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${m.role === "MANAGER"
                              ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                              : m.role === "LEAD"
                                ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                : "bg-dark-700 text-dark-300 border border-dark-600"
                              }`}>
                              {m.role_display || m.role}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        title="Create Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-3">
          <Input
            label="Title"
            value={taskForm.title}
            onChange={tcChange("title")}
            required
          />

          <div className="space-y-1">
            <label className="text-xs font-bold text-dark-400 uppercase tracking-widest ml-1">Description</label>
            <textarea
              className="input-base min-h-[100px] py-3 resize-none"
              placeholder="Provide more details about this task..."
              value={taskForm.description}
              onChange={tcChange("description")}
            />
          </div>

          {/* Task Assignment */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-dark-400 uppercase tracking-widest ml-1">Assignee</label>
            {(isAdmin || myProjectRole === "MANAGER" || myProjectRole === "LEAD") ? (
              <select
                className="input-base"
                value={taskForm.assigned_to}
                onChange={tcChange("assigned_to")}
              >
                <option value="">Unassigned</option>
                {projectMembers
                  .filter((m) => {
                    if (isAdmin || myProjectRole === "MANAGER") {
                      return m.role === "LEAD" || m.role === "MEMBER";
                    }
                    if (myProjectRole === "LEAD") {
                      return m.role === "MEMBER";
                    }
                    return false;
                  })
                  .map((m) => (
                    <option key={m.user} value={m.user}>
                      {m.user_full_name || m.user_email} ({m.role})
                    </option>
                  ))}
              </select>
            ) : (
              <p className="text-xs text-dark-500 italic ml-1">Only Managers or Leads can assign tasks.</p>
            )}
          </div>

          <Button type="submit" loading={creatingTask}>
            Create
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
