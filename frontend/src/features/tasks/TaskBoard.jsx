import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, X, GripVertical } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createTask, updateTask, deleteTask } from "./taskAPI";
import {
  fetchProjectTasks,
  patchProjectTaskStatus,
  addProjectTask,
  removeProjectTask,
} from "../organizations/orgSlice";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const COLUMNS = [
  {
    id: "TODO",
    label: "Todo",
    color: "text-dark-400",
    dot: "bg-dark-500",
    border: "border-dark-700",
  },
  {
    id: "IN_PROGRESS",
    label: "In Progress",
    color: "text-blue-400",
    dot: "bg-blue-500",
    border: "border-blue-800/40",
  },
  {
    id: "DONE",
    label: "Done",
    color: "text-green-400",
    dot: "bg-green-500",
    border: "border-green-800/40",
  },
];

const TaskCard = ({ task, onDelete, isDragging }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-dark-800 rounded-lg p-3 border border-dark-700 hover:border-brand-500/40 transition group"
    >
      <div className="flex justify-between gap-2">
        <div className="flex items-center gap-1 flex-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={14} />
          </button>
          <p className="text-sm text-dark-100">{task.title}</p>
        </div>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100"
        >
          <X size={12} />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-dark-500 mt-1">{task.description}</p>
      )}

      <div className="flex gap-2 mt-2">
        <Badge variant={task.priority} />
        {task.due_date && (
          <span className="text-xs text-dark-500">
            {formatDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
};

const TaskBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const pid = projectId ? Number(projectId) : null;
  const tasks = useSelector((s) =>
    pid != null ? s.org.tasksByProjectId[pid]?.items ?? [] : [],
  );
  const bucket = useSelector((s) =>
    pid != null ? s.org.tasksByProjectId[pid] : null,
  );
  const loading = useSelector((s) =>
    pid != null ? s.org.tasksLoadingByProjectId[pid] ?? false : false,
  );

  const [activeTask, setActiveTask] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [initStatus, setInitStatus] = useState("TODO");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    due_date: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    if (!projectId || pid == null) return;
    dispatch(fetchProjectTasks({ projectId: pid }));
  }, [projectId, pid, dispatch]);

  const tasksByColumn = (colId) => tasks.filter((t) => t.status === colId);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || pid == null) return;

    const draggedTask = tasks.find((t) => t.id === active.id);
    if (!draggedTask) return;

    let targetStatus = COLUMNS.find((c) => c.id === over.id)?.id;

    if (!targetStatus) {
      const overTask = tasks.find((t) => t.id === over.id);
      targetStatus = overTask?.status;
    }

    if (!targetStatus || draggedTask.status === targetStatus) return;

    const prevStatus = draggedTask.status;

    dispatch(
      patchProjectTaskStatus({
        projectId: pid,
        taskId: draggedTask.id,
        status: targetStatus,
      }),
    );

    try {
      await updateTask(projectId, draggedTask.id, { status: targetStatus });
      toast.success(`Moved to ${targetStatus}`);
    } catch (err) {
      console.error(err);
      dispatch(
        patchProjectTaskStatus({
          projectId: pid,
          taskId: draggedTask.id,
          status: prevStatus,
        }),
      );
      toast.error("Failed to update task");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const payload = { ...form, status: initStatus, project: projectId };
      if (!payload.due_date) delete payload.due_date;

      const { data } = await createTask(projectId, payload);

      dispatch(addProjectTask({ projectId: pid, task: data }));

      toast.success("Task created!");
      setShowCreate(false);
      setForm({ title: "", description: "", priority: "MEDIUM", due_date: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Delete this task?")) return;
    if (pid == null) return;

    try {
      await deleteTask(projectId, taskId);
      dispatch(removeProjectTask({ projectId: pid, taskId }));
      toast.success("Task deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  const fc = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  if (loading && !bucket) return <CardSkeleton count={3} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <button type="button" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </button>
        <Button
          onClick={() => {
            setInitStatus("TODO");
            setShowCreate(true);
          }}
          icon={Plus}
        >
          Add Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasksByColumn(col.id);

            return (
              <SortableContext
                key={col.id}
                items={colTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="bg-dark-800 p-3 rounded-xl">
                  <h3>{col.label}</h3>

                  <div className="space-y-2 min-h-[80px]">
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={handleDelete}
                        isDragging={activeTask?.id === task.id}
                      />
                    ))}
                  </div>
                </div>
              </SortableContext>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="p-3 bg-dark-800 border border-brand-500 rounded">
              {activeTask.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Task"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={fc("title")}
            required
          />
          <Button type="submit" loading={creating}>
            Create
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default TaskBoard;
