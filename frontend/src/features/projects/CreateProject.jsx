import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { createProject } from "./projectAPI";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { ArrowLeft, Plus } from "lucide-react";
import toast from "react-hot-toast";

const CreateProject = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    deadline: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(false);

  // stores new data set while preserve old one
  const fc = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!form.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || "",
        status: form.status || "ACTIVE",
      };
      if (form.deadline) payload.deadline = form.deadline;

      await createProject(teamId, payload);

      toast.success("Project created!");
      navigate(-1);
    } catch (err) {
      const detail =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : null);
      toast.error(detail || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="page-header">Create Project</h1>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="Q1 Roadmap"
            value={form.name}
            onChange={fc("name")}
            required
            autoFocus
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-dark-300">
              Description
            </label>
            <textarea
              className="input-base resize-none h-24"
              placeholder="What is this project about?"
              value={form.description}
              onChange={fc("description")}
            />
          </div>

          <Input
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={fc("deadline")}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-dark-300">Status</label>
            <select
              className="input-base"
              value={form.status}
              onChange={fc("status")}
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>

            <Button
              loading={loading}
              disabled={!form.name.trim()}
              icon={Plus}
              type="submit"
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
