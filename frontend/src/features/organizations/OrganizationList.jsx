import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Plus,
  Users,
  Trash2,
  AlertTriangle,
  Rocket,
  Search,
  X,
  Shield,
  Layers,
  Calendar,
  ArrowRight
} from "lucide-react";
import { fetchOrganizations, addOrganization, removeOrganization } from "./orgSlice";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";
import JoinCodeModal from "../invites/JoinCodeModal";

const OrganizationList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { organizations: orgs, loading } = useSelector((state) => state.org);

  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState(null); // orgId to delete
  const [deleting, setDeleting] = useState(false);

  // New Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL"); // ALL, ADMIN, MEMBER

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

  // Unique colorful gradient avatars for organization
  const getGradient = (name) => {
    const code = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
    const gradients = [
      "from-indigo-500 via-purple-500 to-pink-500 shadow-purple-500/20",
      "from-cyan-500 via-teal-500 to-emerald-500 shadow-teal-500/20",
      "from-amber-500 via-orange-500 to-rose-500 shadow-orange-500/20",
      "from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-600/20",
      "from-pink-500 via-rose-500 to-red-500 shadow-rose-500/20",
    ];
    return gradients[code % gradients.length];
  };

  // Short initials representation of an organization name
  const getOrgInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Local Search & Filter logic
  const filteredOrgs = orgs.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === "ALL" ||
      (roleFilter === "ADMIN" && org.user_role === "ADMIN") ||
      (roleFilter === "MEMBER" && org.user_role !== "ADMIN");
    return matchesSearch && matchesRole;
  });

  return (
    <div className="relative min-h-screen -mt-5 space-y-6 mx-4 animate-fade-in pb-12 overflow-hidden">
      {/* Ambient background glows for immersive glass feel */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] animate-blob pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] animate-blob animation-delay-2000 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-dark-800">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="text-gradient">Teams & Workspaces</span>
          </h1>
          <p className="text-dark-400 mt-2 text-sm max-w-xl">
            Access all your organizational teams, collaboration workspaces, and project catalogs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={Rocket}
            onClick={() => setShowJoin(true)}
            className="hover:scale-[1.02] active:scale-95 transition-transform duration-250 font-semibold"
          >
            Join Workspace
          </Button>
          <Button
            icon={Plus}
            onClick={() => setShowCreate(true)}
            className="shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-transform duration-250 font-semibold"
          >
            New Organization
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-dark-800/30 backdrop-blur-md p-4 rounded-2xl border border-dark-700/40">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-900/50 hover:bg-dark-900 border border-dark-700/60 hover:border-dark-600 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-dark-100 placeholder-dark-500 rounded-xl pl-10 pr-10 py-2.5 text-sm transition-all focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-dark-900/60 p-1 rounded-xl border border-dark-800 w-full sm:w-auto overflow-x-auto">
          {[
            { value: "ALL", label: "All Workspaces", icon: Layers },
            { value: "ADMIN", label: "Managed by Me", icon: Shield },
            { value: "MEMBER", label: "Joined", icon: Users },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = roleFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-300 ${isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-500/10"
                  : "text-dark-400 hover:text-dark-200 hover:bg-dark-850"
                  }`}
              >
                <TabIcon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List */}
      <div className="relative z-10">
        {loading && orgs.length === 0 ? (
          /* High Fidelity Animated Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-panel p-6 h-[210px] flex flex-col justify-between animate-pulse">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-dark-700 rounded-2xl" />
                    <div className="w-16 h-5 bg-dark-700 rounded-full" />
                  </div>
                  <div className="w-3/4 h-5 bg-dark-700 rounded mb-2" />
                  <div className="w-1/2 h-3.5 bg-dark-700 rounded" />
                </div>
                <div className="pt-4 border-t border-dark-800/80 flex justify-between items-center">
                  <div className="w-24 h-4 bg-dark-700 rounded" />
                  <div className="w-8 h-3.5 bg-dark-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrgs.length === 0 ? (
          /* Upgraded Empty State Card */
          <div className="glass-panel p-12 text-center max-w-xl mx-auto mt-8 border border-dark-700/40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent pointer-events-none" />
            <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-brand-500/20">
              <Building2 size={32} className="text-brand-400 animate-pulse-slow" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              No workspaces found
            </h3>
            <p className="text-dark-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              {searchQuery || roleFilter !== "ALL"
                ? "We couldn't find any organization matching your search terms or filters. Try adjusting them."
                : "Create your first organization or join an existing one using an invite code to begin collaboration."}
            </p>
            <div className="flex items-center justify-center gap-4">
              {searchQuery || roleFilter !== "ALL" ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("ALL");
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <>
                  <Button icon={Plus} onClick={() => setShowCreate(true)} className="shadow-lg shadow-brand-500/20">
                    Create Organization
                  </Button>
                  <Button variant="secondary" icon={Rocket} onClick={() => setShowJoin(true)}>
                    Join
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          /* High Fidelity Glassmorphic Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrgs.map((org) => (
              <div
                key={org.id}
                className="glass-panel group relative flex flex-col justify-between overflow-hidden p-6 cursor-pointer hover:-translate-y-1.5 hover:scale-[1.01] hover:border-brand-500/40 transition-all duration-300"
                onClick={() => navigate(`/app/organizations/${org.id}/teams`)}
              >
                {/* Subtle top decoration card line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Avatar and Role */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getGradient(org.name)} flex items-center justify-center font-bold text-white text-base shadow-lg`}>
                      {getOrgInitials(org.name)}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Role badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${org.user_role === "ADMIN"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)]"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.1)]"
                        }`}>
                        {org.user_role === "ADMIN" ? (
                          <>
                            <Shield size={10} />
                            Admin
                          </>
                        ) : (
                          <>
                            <Users size={10} />
                            Member
                          </>
                        )}
                      </span>

                      {/* Action buttons (only visible if admin or hover) */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {org.user_role === "ADMIN" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(org.id);
                            }}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Organization"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Org Meta */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition-colors duration-200 truncate">
                    {org.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-dark-400 mb-6 font-medium">
                    <Calendar size={13} className="text-dark-500" />
                    <span>Created {formatDate(org.created_at)}</span>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="flex items-center justify-between pt-4 border-t border-dark-800/80 mt-auto">
                  <span className="text-xs font-bold text-brand-400 group-hover:text-brand-300 transition-colors flex items-center gap-1">
                    Enter Workspace
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[10px] text-dark-500 font-mono tracking-wider">CF-{org.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-800/60 -mx-6 px-6">
            <Button variant="ghost" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={creating} icon={Plus} className="shadow-lg shadow-brand-500/25">
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
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <AlertTriangle size={24} className="flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Warning: Critical Action</p>
              <p className="text-xs opacity-80 leading-relaxed mt-0.5">Deleting an organization will permanently remove all associated teams, projects, and tasks. This cannot be undone.</p>
            </div>
          </div>

          <p className="text-dark-300 text-sm leading-relaxed">
            Are you absolutely sure you want to delete this organization?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-800/60 -mx-6 px-6">
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

      <JoinCodeModal
        open={showJoin}
        onClose={() => setShowJoin(false)}
        onSuccess={() => dispatch(fetchOrganizations())}
      />
    </div>
  );
};

export default OrganizationList;

