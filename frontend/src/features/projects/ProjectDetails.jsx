import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Plus, X, Send, Users } from "lucide-react";

import { getProject, getProjectMemberships } from "./projectAPI";
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

const ProjectDetails = () => {
  const { teamId, projectId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager, role } = useRole();
  const { user } = useSelector((state) => state.auth);
  
  // for data handling
  const [project, setProject] = useState(null);
  const isLead = role === "LEAD" || project?.created_by === user?.id;
  const [tasks, setTasks] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
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
      const { data } = await getComments(taskId);
      setComments(data);
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

      const { data } = await createTask(projectId, payload);

      setTasks((prev) => [...prev, data]);
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
      const { data } = await updateTask(projectId, task.id, { status });

      setTasks((prev) => prev.map((t) => (t.id === task.id ? data : t)));

      if (selectedTask?.id === task.id) {
        setSelectedTask(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update task");
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
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();

    if (!selectedTask || !newComment.trim()) return;

    try {
      const { data } = await createComment(selectedTask.id, {
        content: newComment.trim(),
      });

      setComments((prev) => [...prev, data]);
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
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <div>
          <h1 className="page-header">{project?.name}</h1>
          {project?.deadline && (
            <p className="text-sm text-dark-400">
              Due {formatDate(project.deadline)}
            </p>
          )}
        </div>
      </div>

      {project && isAdmin && (
        <div className="mb-4">
          <JoinCodeCard
            entityType="projects"
            entityId={projectId}
            parentEntityId={teamId}
            initialCode={project.join_code}
          />
        </div>
      )}

      {/* Task Header */}
      <div className="flex justify-between items-center bg-dark-800/50 p-4 rounded-xl border border-dark-700/50">
        <p className="text-dark-400 font-medium">{tasks.length} tasks</p>
        {(isAdmin || isManager || isLead) && (
          <Button onClick={() => setShowCreateTask(true)} icon={Plus}>
            Add Task
          </Button>
        )}
      </div>

      {/* Kanban */}
      <div className="grid md:grid-cols-3 gap-4">
        {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
          <div key={status} className="bg-dark-800 p-3 rounded-xl">
            <h3>{status}</h3>

            <div className="space-y-2 min-h-[80px]">
              {tasksByStatus(status).map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleSelectTask(task)}
                  className="p-3 bg-dark-700 rounded cursor-pointer"
                >
                  {task.title}

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTaskStatus(task, "TODO");
                      }}
                    >
                      Todo
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTaskStatus(task, "IN_PROGRESS");
                      }}
                    >
                      Progress
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateTaskStatus(task, "DONE");
                      }}
                    >
                      Done
                    </button>
                    {(isAdmin || isManager || isLead) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id);
                        }}
                        className="p-1 text-dark-500 hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail + Comments */}
      {selectedTask && (
        <div className="card p-4">
          <h3>{selectedTask.title}</h3>

          {/* LoadingComments used */}
          {loadingComments ? (
            <p className="text-sm text-dark-400">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-dark-500">No comments yet</p>
          ) : (
            comments.map((c) => (
              <div key={c.id}>
                <b>{c.user?.full_name}</b>
                <p>{c.content}</p>
              </div>
            ))
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectMembers.map((m) => (
              <div key={m.id} className="card p-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg flex-shrink-0 ${
                      getAvatarColor(m.user_full_name || m.user_email || "")
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

                  {/* Role badge — read-only */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                    m.role === "MANAGER"
                      ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                      : m.role === "LEAD"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-dark-700 text-dark-300 border border-dark-600"
                  }`}>
                    {m.role_display || m.role}
                  </span>
                </div>
              </div>
            ))}
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

          {/*  teamUsers used */}
          <select
            className="input-base"
            value={taskForm.assigned_to}
            onChange={tcChange("assigned_to")}
          >
            <option value="">Unassigned</option>
            {teamUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>

          <Button type="submit" loading={creatingTask}>
            Create
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
