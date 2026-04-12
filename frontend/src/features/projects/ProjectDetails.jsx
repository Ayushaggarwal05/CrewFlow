import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, X, Send } from "lucide-react";

import { getProject } from "./projectAPI";
import { getTasks, createTask, updateTask, deleteTask } from "../tasks/taskAPI";
import { getComments, createComment } from "../comments/commentAPI";
import { getTeamUsers } from "../teams/teamAPI";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate } from "../../utils/helpers";

import toast from "react-hot-toast";

const ProjectDetails = () => {
  const { teamId, projectId } = useParams();
  const navigate = useNavigate();
  // for data handling
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
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
    if (!teamId || !projectId) return;

    setLoading(true);
    try {
      const [projRes, tasksRes, usersRes] = await Promise.all([
        getProject(teamId, projectId),
        getTasks(projectId),
        getTeamUsers(teamId),
      ]);

      setProject(projRes.data);
      setTasks(tasksRes.data);
      setTeamUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
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

      {/* Task Header */}
      <div className="flex justify-between">
        <p>{tasks.length} tasks</p>
        <Button onClick={() => setShowCreateTask(true)} icon={Plus}>
          Add Task
        </Button>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                    >
                      <X size={12} />
                    </button>
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
