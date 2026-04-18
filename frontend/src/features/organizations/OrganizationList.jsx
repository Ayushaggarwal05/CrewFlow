import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Plus, Users, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { fetchOrganizations, addOrganization, removeOrganization } from "./orgSlice";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const OrganizationList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { organizations: orgs, loading } = useSelector((state) => state.org);
  
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null); // orgId to delete
  const [deleting, setDeleting] = useState(false);

  // Load organizations
  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  // Create organization
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setCreating(true);
    try {
      const result = await dispatch(addOrganization({ name: name.trim() }));
      if (addOrganization.fulfilled.match(result)) {
        toast.success("Organization created!");
        setShowCreate(false);
        setName("");
      } else {
        throw new Error(result.payload?.detail || "Failed to create organization");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Delete organization
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      const result = await dispatch(removeOrganization(deleteConfirm));
      if (removeOrganization.fulfilled.match(result)) {
        toast.success("Organization deleted");
        setDeleteConfirm(null);
      } else {
        throw new Error(result.payload?.detail || "Failed to delete organization");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Organizations</h1>
          <p className="text-dark-400 mt-1 text-sm">
            Manage all your organizations
          </p>
        </div>

        <Button icon={Plus} onClick={() => setShowCreate(true)}>
          New Organization
        </Button>
      </div>

      {/* List */}
      {loading && orgs.length === 0 ? (
        <CardSkeleton count={4} />
      ) : orgs.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 size={48} className="mx-auto text-dark-600 mb-4" />
          <p className="text-dark-300 font-medium text-lg">
            No organizations yet
          </p>
          <p className="text-dark-500 text-sm mt-2 mb-6">
            Create your first organization to start managing teams and projects.
          </p>
          <Button icon={Plus} onClick={() => setShowCreate(true)}>
            Create Organization
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="card-hover p-5 group cursor-pointer"
              onClick={() => navigate(`/app/organizations/${org.id}/teams`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-brand-400" />
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/app/organizations/${org.id}/teams`);
                    }}
                    className="p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </button>

                  {(org.user_role === "OWNER" || org.user_role === "ADMIN") && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(org.id);
                      }}
                      className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-dark-50 mb-1">{org.name}</h3>
              <p className="text-xs text-dark-500">
                Created {formatDate(org.created_at)}
              </p>

              <div className="flex items-center gap-1 mt-3 text-xs text-dark-500">
                <Users size={12} />
                <span>View teams →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Organization"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <Input
            label="Organization Name"
            placeholder="Acme Corporation"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-700 -mx-6 px-6">
            <Button variant="ghost" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={creating} icon={Plus}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Organization"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl text-red-500">
            <AlertTriangle size={24} />
            <div>
              <p className="font-bold text-sm">Warning: Critical Action</p>
              <p className="text-xs opacity-80">Deleting an organization will permanently remove all associated teams, projects, and tasks. This cannot be undone.</p>
            </div>
          </div>
          
          <p className="text-dark-300 text-sm">
            Are you absolutely sure you want to delete this organization?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-700 -mx-6 px-6">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} type="button">
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete} 
              loading={deleting} 
              icon={Trash2}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrganizationList;

