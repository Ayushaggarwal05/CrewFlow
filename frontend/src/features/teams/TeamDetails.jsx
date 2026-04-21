import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  FolderKanban,
  Plus,
  ArrowLeft,
  Trash2,
  UserPlus,
  Clock,
} from "lucide-react";

import useRole from "../../hooks/useRole";
import useCurrentOrg from "../../hooks/useCurrentOrg";

import {
  getTeam,
  getTeamMemberships,
  createTeamMembership,
  deleteTeamMembership,
  updateTeamMembership,
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
import JoinCodeCard from "../invites/JoinCodeCard";
import JoinCodeModal from "../invites/JoinCodeModal";
import { Rocket } from "lucide-react";

const ROLE_ORDER = { MANAGER: 0, LEAD: 1, MEMBER: 2 };

// Derive whether current user is the explicit manager of THIS team.
// Computed as a derived value inside the component using team state.

const TeamDetails = () => {
  const { orgId, teamId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager } = useRole();
  const { orgId: currentOrgId } = useCurrentOrg();
  const { user } = useSelector((state) => state.auth);

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
  const [showJoin, setShowJoin] = useState(false);

  const [activeTab, setActiveTab] = useState("projects");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teamRes, projectsRes, membersRes] = await Promise.all([
          getTeam(orgId || currentOrgId, teamId),
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
  }, [teamId, orgId, currentOrgId]);

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

  // Role update — Admin can assign MANAGER/LEAD/MEMBER; Team manager can assign LEAD/MEMBER
  const handleUpdateRole = async (membershipId, targetUserId, newRole) => {
    try {
      await updateTeamMembership(teamId, membershipId, { role: newRole });

      // Update memberships list optimistically
      setMemberships((prev) =>
        prev.map((m) => {
          if (m.id === membershipId) return { ...m, role: newRole, role_display: newRole };
          // If promoting someone to MANAGER, demote the old manager in local state too
          if (newRole === "MANAGER" && m.user === team?.manager) return { ...m, role: "LEAD", role_display: "LEAD" };
          return m;
        })
      );

      // Sync team.manager in local state
      if (newRole === "MANAGER") {
        setTeam((prev) => ({ ...prev, manager: targetUserId }));
      } else if (newRole !== "MANAGER" && targetUserId === team?.manager) {
        setTeam((prev) => ({ ...prev, manager: null }));
      }

      toast.success("Role updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update role");
    }
  };

  // Sort memberships: LEAD first, then MEMBER
  const sortedMemberships = [...memberships].sort(
    (a, b) => (ROLE_ORDER[a.role] ?? 99) - (ROLE_ORDER[b.role] ?? 99)
  );

  // isTeamManager: true only if this user is the explicit manager of THIS team.
  // Separate from org-level isManager so multiple managers can coexist.
  const isTeamManager = team?.manager === user?.id;

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

      {team && isAdmin && (
        <div className="mb-4">
          <JoinCodeCard
            entityType="teams"
            entityId={teamId}
            parentEntityId={orgId || currentOrgId}
            initialCode={team.join_code}
          />
        </div>
      )}


      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-800">
        {["projects", "members"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-b-2 ${activeTab === tab
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
          <div className="flex justify-between items-center">
            <p className="text-dark-400 font-medium">{projects.length} projects</p>
            <div className="flex gap-3">
              <Button variant="secondary" icon={Rocket} onClick={() => setShowJoin(true)}>
                Join
              </Button>
              {(isAdmin || isManager) && (
                <Button onClick={() => setShowCreateProject(true)} icon={Plus}>
                  New Project
                </Button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/app/teams/${teamId}/projects/${proj.id}`)}
                className="card-hover p-4"
              >
                <h3>{proj.name}</h3>
                <Badge variant={proj.status} />
                {proj.deadline && <p>Due {formatDate(proj.deadline)}</p>}

                {(isAdmin || isManager) && (
                  <button onClick={(e) => handleDeleteProject(e, proj.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-dark-400 font-medium">{sortedMemberships.length} members</p>
            {/* Members tab: gate on isAdmin OR isTeamManager (team-level ownership) */}
            {(isAdmin || isTeamManager) && (
              <Button onClick={() => setShowAddMember(true)} icon={UserPlus}>
                Add Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedMemberships.map((m) => {
              const isOwnCard = m.user === user?.id;
              const isThisTheTeamManager = m.user === team?.manager;
              return (
                <div key={m.id} className="card-hover p-5 relative group">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg ${getAvatarColor(
                        m.user_full_name || m.user_email
                      )}`}
                    >
                      {getInitials(m.user_full_name || "U")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-dark-50 text-base truncate">
                          {m.user_full_name || "Unknown User"}
                        </p>

                        {/*
                          Role display logic:
                          - Own card: always badge (no one changes their own role)
                          - Admin on any other card: MANAGER / LEAD / MEMBER dropdown
                          - Team manager on non-manager, non-own card: LEAD / MEMBER dropdown
                          - Everyone else: badge only
                        */}
                        {isOwnCard ? (
                          isThisTheTeamManager ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-600/20 text-brand-400 font-semibold border border-brand-500/30">
                              Manager
                            </span>
                          ) : (
                            <Badge variant={m.role} label={m.role_display || m.role} />
                          )
                        ) : isAdmin ? (
                          // Admin can assign MANAGER, LEAD, or MEMBER to anyone else
                          <select
                            value={isThisTheTeamManager ? "MANAGER" : m.role}
                            onChange={(e) => handleUpdateRole(m.id, m.user, e.target.value)}
                            className="cursor-pointer text-xs px-2 py-1 rounded-lg border border-dark-600 bg-dark-800 text-dark-200 focus:outline-none focus:border-brand-500 transition-colors hover:border-brand-400"
                          >
                            <option value="MANAGER">MANAGER</option>
                            <option value="LEAD">LEAD</option>
                            <option value="MEMBER">MEMBER</option>
                          </select>
                        ) : isTeamManager && !isThisTheTeamManager ? (
                          // Team manager can assign LEAD or MEMBER to non-manager members
                          <select
                            value={m.role}
                            onChange={(e) => handleUpdateRole(m.id, m.user, e.target.value)}
                            className="cursor-pointer text-xs px-2 py-1 rounded-lg border border-dark-600 bg-dark-800 text-dark-200 focus:outline-none focus:border-brand-500 transition-colors hover:border-brand-400"
                          >
                            <option value="LEAD">LEAD</option>
                            <option value="MEMBER">MEMBER</option>
                          </select>
                        ) : isThisTheTeamManager ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-600/20 text-brand-400 font-semibold border border-brand-500/30">
                            Manager
                          </span>
                        ) : (
                          <Badge variant={m.role} label={m.role_display || m.role} />
                        )}
                      </div>
                      <p className="text-sm text-dark-400 truncate">{m.user_email}</p>

                      <div className="mt-4 space-y-1.5 border-t border-dark-700/50 pt-3">
                        <div className="flex items-center gap-2 text-xs text-dark-500">
                          <Users size={12} className="text-brand-500" />
                          <span className="font-medium text-dark-400">Manager:</span>
                          <span className="text-dark-300">{m.manager_name || "None (Top Level)"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-dark-500">
                          <Clock size={12} className="text-green-500" />
                          <span className="font-medium text-dark-400">Joined:</span>
                          <span className="text-dark-300">{formatDate(m.joined_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button — only team manager or admin */}
                  {(isAdmin || isTeamManager) && (
                    <button
                      onClick={() => handleRemoveMember(m.id)}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      title="Remove Member"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
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

      <JoinCodeModal
        open={showJoin}
        onClose={() => setShowJoin(false)}
        onSuccess={() => {
          // reload fresh data
          getProjects(teamId).then(({ data }) => setProjects(data));
        }}
      />
    </div>
  );
};

export default TeamDetails;
