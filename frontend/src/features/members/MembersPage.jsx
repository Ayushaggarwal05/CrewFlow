import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  ShieldCheck,
  UserCheck,
  Shield,
  Loader2,
  Mail,
  Calendar,
  Lock
} from "lucide-react";
import { fetchMembers, updateMemberRole, removeMember } from "./membersSlice";
import useCurrentOrg from "../../hooks/useCurrentOrg";
import useRole from "../../hooks/useRole";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { getInitials, getAvatarColor, formatDate } from "../../utils/helpers";
import toast from "react-hot-toast";

const MembersPage = () => {
  const dispatch = useDispatch();
  const { orgId } = useCurrentOrg();
  const { role: myRole } = useRole();
  const { members, loading, error } = useSelector((state) => state.members);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  useEffect(() => {
    if (orgId) {
      dispatch(fetchMembers(orgId));
    }
  }, [orgId, dispatch]);

  // Filtering Logic
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch =
        (m.user_full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (m.user_email || "").toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [members, search, roleFilter]);

  const handleRoleChange = async (membershipId, newRole) => {
    try {
      await dispatch(updateMemberRole({ orgId, membershipId, role: newRole })).unwrap();
      toast.success("Member authority updated");
    } catch (err) {
      toast.error(typeof err === 'string' ? err : "Failed to update role");
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await dispatch(removeMember({ orgId, membershipId: showDeleteModal.id })).unwrap();
      toast.success("Member removed from workspace");
      setShowDeleteModal(null);
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  if (myRole !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 animate-fade-in bg-[#0F172A] min-h-screen">
        <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center text-red-500 mb-6 border border-white/5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#dae2fd] mb-2 tracking-tight">Unauthorized Access</h2>
        <p className="text-[#c5c6cd] text-sm max-w-md text-center">
          You do not have permission to view this page. This area is restricted to Organization Administrators.
        </p>
      </div>
    );
  }

  if (loading && members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#0F172A] min-h-screen">
        <Loader2 className="animate-spin text-[#8B5CF6] mb-4" size={48} />
        <p className="text-[#c5c6cd] font-mono uppercase tracking-widest text-xs">Accessing Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-8 py-8 font-sans bg-[#0F172A] min-h-screen">
      {/* Header Container */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-bold text-[#dae2fd] tracking-tight">Organization Members</h1>
          <p className="text-[#c5c6cd] font-medium mt-1 text-sm">
            Manage member roles and visibility across the workspace.
          </p>
        </div>
        <div className="px-3 py-1 bg-[#1E293B] border border-white/10 rounded-lg text-xs font-mono text-[#8B5CF6] uppercase tracking-widest flex items-center gap-2">
          <Users size={14} /> {members.length} Members Total
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c6cd] group-focus-within:text-[#8B5CF6] transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search members by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B] border border-white/5 rounded-lg text-sm text-[#dae2fd] outline-none focus:border-[#8B5CF6]/50 transition-all placeholder:text-[#c5c6cd]/50 shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Filter */}
        <div className="relative w-full sm:w-48 group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5c6cd]" size={16} />
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B] border border-white/5 rounded-lg text-sm text-[#dae2fd] outline-none focus:border-[#8B5CF6]/50 transition-all appearance-none cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.02)]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admins</option>
            <option value="MANAGER">Managers</option>
            <option value="LEAD">Leads</option>
            <option value="MEMBER">Members</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      <div className="bg-[#1E293B] border border-white/5 border-t-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal">Member</th>
                <th className="px-6 py-4 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal">Contact</th>
                <th className="px-6 py-4 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal">Authority</th>
                <th className="px-6 py-4 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal">Timeline</th>
                <th className="px-6 py-4 text-[10px] font-mono text-[#c5c6cd] uppercase tracking-widest font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded bg-[#0F172A] border border-white/5 flex items-center justify-center text-[#8B5CF6] font-bold shadow-md">
                        {getInitials(member.user_full_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#dae2fd]">{member.user_full_name}</p>
                        <p className="text-[10px] font-mono text-[#c5c6cd] mt-0.5">ID: {String(member.user).split('-')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[#c5c6cd]">
                      <Mail size={14} className="text-[#8B5CF6]/70" />
                      <span className="text-sm font-medium">{member.user_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="relative group/select w-fit">
                      <select
                        className={`bg-[#0F172A] outline-none cursor-pointer font-mono text-[10px] tracking-widest uppercase py-1.5 px-3 rounded border border-white/10 transition-all appearance-none pr-8
                          ${member.role === 'ADMIN' ? 'text-[#D8B4FE] border-[#D8B4FE]/30 bg-[#D8B4FE]/5' : ''}
                          ${member.role === 'MANAGER' ? 'text-[#0EA5E9] border-[#0EA5E9]/30 bg-[#0EA5E9]/5' : ''}
                          ${member.role === 'LEAD' ? 'text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/5' : ''}
                          ${member.role === 'MEMBER' ? 'text-[#c5c6cd] hover:border-white/20' : ''}
                        `}
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={myRole !== 'ADMIN'}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        {member.role === 'LEAD' && <option value="LEAD" hidden>Lead</option>}
                        {member.role === 'MEMBER' && <option value="MEMBER" hidden>Member</option>}
                      </select>
                      {/* Custom caret */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/select:opacity-100 transition-opacity">
                        <MoreVertical size={12} className="text-current rotate-90" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-[#c5c6cd]">
                      <Calendar size={14} className="text-[#8B5CF6]/70" />
                      <span className="text-[11px] font-mono uppercase tracking-wider">Joined {formatDate(member.joined_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {myRole === 'ADMIN' && (
                      <button
                        onClick={() => setShowDeleteModal(member)}
                        className="p-2 text-[#c5c6cd] hover:text-red-400 hover:bg-red-500/10 rounded transition-all border border-transparent hover:border-red-500/20"
                        title="Remove Access"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-[#0F172A] rounded-lg flex items-center justify-center mb-4 text-[#c5c6cd] border border-white/5">
                <Users size={24} />
              </div>
              <p className="text-[#dae2fd] font-semibold text-sm mb-1">No members found</p>
              <p className="text-[#c5c6cd] text-sm">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          open={true}
          onClose={() => setShowDeleteModal(null)}
          title="Revoke Workspace Access?"
        >
          <div className="space-y-6">
            <p className="text-[#c5c6cd] text-sm leading-relaxed">
              You are about to remove <span className="text-[#dae2fd] font-bold">{showDeleteModal.user_full_name}</span> from the organization.
              This will immediately revoke their access to all teams, projects, and tasks in this workspace.
            </p>
            <div className="flex gap-4">
              <button className="flex-1 py-2 bg-[#0F172A] text-[#dae2fd] border border-white/10 rounded hover:bg-white/5 transition-colors text-sm font-medium" onClick={() => setShowDeleteModal(null)}>Cancel</button>
              <button className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors text-sm font-medium shadow-[0_0_15px_rgba(220,38,38,0.3)]" onClick={handleDelete}>Remove Access</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MembersPage;
