import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  FolderKanban,
  Plus,
  ArrowLeft,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  getTeam,
  getTeamMemberships,
  createTeamMembership,
  deleteTeamMembership,
} from "./teamAPI";
import {
  getProjects,
  createProject,
  deleteProject,
} from "../projects/projectAPI";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate, getInitials, getAvatarColor } from "../../utils/helpers";
import toast from "react-hot-toast";

const TeamDetails = () => {
  const { orgId, teamId } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [projects, setProjects] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    deadline: "",
    status: "ACTIVE",
  });
  const [creating, setCreating] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    user: "",
    role: "MEMBER",
  });
  const [addingMember, setAddingMember] = useState(false);

  const [activeTab, setActiveTab] = useState("projects");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teamRes, projectsRes, membersRes] = await Promise.all([
          getTeam(orgId, teamId),
          getProjects(teamId),
          getTeamMemberships(teamId),
        ]);
        setTeam(teamRes.data);
        setProjects(projectsRes.data);
        setMemberships(membersRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load team data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, orgId]);

  //  Controlled input helper
  const pfChange = (k) => (e) =>
    setProjectForm((prev) => ({ ...prev, [k]: e.target.value }));

  // Create project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        name: projectForm.name?.trim(),
        description: projectForm.description?.trim() || "",
        status: projectForm.status || "ACTIVE",
      };

      if (!payload.name) {
        toast.error("Project name is required");
        return;
      }

      if (projectForm.deadline) payload.deadline = projectForm.deadline;

      await createProject(teamId, payload);
      toast.success("Project created!");
      setShowCreateProject(false);
      setProjectForm({
        name: "",
        description: "",
        deadline: "",
        status: "ACTIVE",
      });
      // reload fresh data
      const { data } = await getProjects(teamId);
      setProjects(data);
    } catch (err) {
      console.error(err);
      const detail =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : null);
      toast.error(detail || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  //  Delete project (safe state update)
  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!confirm("Delete this project?")) return;

    try {
      await deleteProject(teamId, projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted");
    } catch (err) {
      console.error(err);
      const detail =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : null);
      toast.error(detail || "Failed to delete project");
    }
  };

  // ✅ Add member
  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      await createTeamMembership(teamId, memberForm);
      toast.success("Member added!");
      setShowAddMember(false);
      setMemberForm({ user: "", role: "MEMBER" });

      const { data } = await getTeamMemberships(teamId);
      setMemberships(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  // ✅ Remove member (safe state update)
  const handleRemoveMember = async (membershipId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await deleteTeamMembership(teamId, membershipId);
      setMemberships((prev) => prev.filter((m) => m.id !== membershipId));
      toast.success("Member removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(`/app/organizations/${orgId}/teams`)}
          className="mt-1 p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="section-title">Team</p>
          <h1 className="page-header mt-0.5">{team?.name || "..."}</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-800">
        {["projects", "members"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-b-2 ${
              activeTab === tab
                ? "border-brand-500 text-brand-400"
                : "text-dark-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : activeTab === "projects" ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p>{projects.length} projects</p>
            <Button onClick={() => setShowCreateProject(true)} icon={Plus}>
              New Project
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() =>
                  navigate(`/app/teams/${teamId}/projects/${proj.id}`)
                }
                className="card-hover p-4"
              >
                <h3>{proj.name}</h3>
                <Badge variant={proj.status} />
                {proj.deadline && <p>Due {formatDate(proj.deadline)}</p>}

                <button onClick={(e) => handleDeleteProject(e, proj.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p>{memberships.length} members</p>
            <Button onClick={() => setShowAddMember(true)} icon={UserPlus}>
              Add Member
            </Button>
          </div>

          {memberships.map((m) => (
            <div key={m.id} className="card p-4 flex justify-between">
              <div className="flex gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                    m.user?.full_name,
                  )}`}
                >
                  {getInitials(m.user?.full_name || "U")}
                </div>
                <div>
                  <p>{m.user?.full_name}</p>
                  <p>{m.user?.email}</p>
                </div>
              </div>

              <button onClick={() => handleRemoveMember(m.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        open={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        title="Create Project"
      >
        <form onSubmit={handleCreateProject}>
          <Input
            label="Name"
            value={projectForm.name}
            onChange={pfChange("name")}
          />
          <Button type="submit" loading={creating}>
            Create
          </Button>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        title="Add Member"
      >
        <form onSubmit={handleAddMember}>
          <Input
            label="User ID"
            value={memberForm.user}
            onChange={(e) =>
              setMemberForm((prev) => ({
                ...prev,
                user: e.target.value,
              }))
            }
          />
          <Button type="submit" loading={addingMember}>
            Add
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default TeamDetails;
