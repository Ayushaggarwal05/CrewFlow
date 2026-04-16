import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Users, Plus, ArrowLeft, Trash2 } from "lucide-react";
import { getTeams, createTeam, deleteTeam } from "./teamAPI";
import { getOrganization } from "../organizations/organizationAPI";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";
import JoinCodeCard from "../invites/JoinCodeCard";

const TeamList = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [orgRes, teamsRes] = await Promise.all([
        getOrganization(orgId),
        getTeams(orgId),
      ]);
      setOrg(orgRes.data);
      setTeams(teamsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await createTeam(orgId, {
        name: name.trim(),
        organization: orgId,
      });
      toast.success("Team created!");
      setShowCreate(false);
      setName("");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, teamId) => {
    e.stopPropagation();
    if (!confirm("Delete this team?")) return;

    try {
      await deleteTeam(orgId, teamId);

      // functional update (safe)
      setTeams((prev) => prev.filter((t) => t.id !== teamId));

      toast.success("Team deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete team");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate("/app/organizations")}
          className="mt-1 p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="section-title">{org?.name || "Organization"}</p>
              <h1 className="page-header mt-0.5">Teams</h1>
            </div>

            <Button icon={Plus} onClick={() => setShowCreate(true)}>
              New Team
            </Button>
          </div>
        </div>
      </div>

      {org && org.join_code && (
        <div className="mb-4">
          <JoinCodeCard
            entityType="organizations"
            entityId={orgId}
            initialCode={org.join_code}
          />
        </div>
      )}


      {loading ? (
        <CardSkeleton count={3} />
      ) : teams.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={48} className="mx-auto text-dark-600 mb-4" />
          <p className="text-dark-300 font-medium text-lg">No teams yet</p>
          <p className="text-dark-500 text-sm mt-2 mb-6">
            Create a team to start organizing projects.
          </p>
          <Button icon={Plus} onClick={() => setShowCreate(true)}>
            Create Team
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className="card-hover p-5 group"
              onClick={() =>
                navigate(`/app/organizations/${orgId}/teams/${team.id}`)
              }
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-purple-400" />
                </div>

                <button
                  onClick={(e) => handleDelete(e, team.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <h3 className="font-semibold text-dark-50 mb-1">{team.name}</h3>

              <p className="text-xs text-dark-500">
                Created {formatDate(team.created_at)}
              </p>

              <p className="text-xs text-dark-500 mt-2">
                View projects & members →
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Team"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button loading={creating} onClick={handleCreate} icon={Plus}>
              Create
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <Input
            label="Team Name"
            placeholder="Engineering, Design..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </form>
      </Modal>
    </div>
  );
};

export default TeamList;
