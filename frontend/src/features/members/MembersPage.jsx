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
  Calendar
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
        m.user_full_name.toLowerCase().includes(search.toLowerCase()) || 
        m.user_email.toLowerCase().includes(search.toLowerCase());
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

  if (loading && members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-brand-500 mb-4" size={48} />
        <p className="text-dark-400 font-medium font-inter uppercase tracking-widest text-xs">Accessing Neural Archive...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header Container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-blue-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative glass-panel p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-dark-700/50">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight uppercase">Workspace Roster</h1>
              <div className="px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 rounded-md text-[10px] font-black text-brand-400 uppercase tracking-widest">
                {members.length} Entities
              </div>
            </div>
            <p className="text-dark-400 mt-1 font-medium font-inter">
              Manage permissions and organization hierarchy.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
             {/* Search */}
             <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-brand-500 transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm font-bold text-white outline-none focus:border-brand-500 transition-all placeholder:text-dark-600"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             {/* Filter */}
             <div className="relative w-full sm:w-48 group">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                <select 
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm font-bold text-white outline-none focus:border-brand-500 transition-all appearance-none cursor-pointer"
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
        </div>
      </div>

      {/* Members Grid */}
      <div className="glass-panel border border-dark-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-dark-800/50 border-b border-dark-700/50">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Member</th>
                <th className="px-6 py-4 text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Authority</th>
                <th className="px-6 py-4 text-[10px] font-black text-dark-500 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-6 py-4 text-[10px] font-black text-dark-500 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="group hover:bg-dark-800/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg ${getAvatarColor(member.user_full_name)}`}>
                        {getInitials(member.user_full_name)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-brand-400 transition-colors">{member.user_full_name}</p>
                        <p className="text-[10px] font-bold text-dark-500 leading-none mt-0.5">ID: {member.user}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-dark-400">
                      <Mail size={14} className="text-dark-500" />
                      <span className="text-xs font-bold font-inter">{member.user_email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {/* Role Control */}
                    <div className="flex items-center gap-3">
                      <select 
                        className={`bg-transparent outline-none cursor-pointer font-black text-[10px] tracking-widest uppercase py-1 px-2 rounded border border-transparent transition-all
                          ${member.role === 'ADMIN' ? 'text-red-500 hover:border-red-500/30' : ''}
                          ${member.role === 'MANAGER' ? 'text-blue-500 hover:border-blue-500/30' : ''}
                          ${member.role === 'LEAD' ? 'text-purple-500 hover:border-purple-500/30' : ''}
                          ${member.role === 'MEMBER' ? 'text-dark-400 hover:border-dark-600' : ''}
                        `}
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={myRole !== 'ADMIN' && myRole !== 'MANAGER'}
                      >
                        <option value="ADMIN" disabled={myRole !== 'ADMIN'}>Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="LEAD">Lead</option>
                        <option value="MEMBER">Member</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-dark-500">
                      <Calendar size={12} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Joined {formatDate(member.joined_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {myRole === 'ADMIN' && (
                      <button 
                        onClick={() => setShowDeleteModal(member)}
                        className="p-2 text-dark-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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
            <div className="p-12 text-center">
               <Users size={48} className="mx-auto text-dark-700 mb-4" />
               <p className="text-dark-400 font-bold uppercase tracking-widest text-xs">No matching entities found in this sector</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Info */}
      <div className="flex items-center justify-center gap-8 py-10 opacity-50">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-brand-500" />
            <span className="text-[9px] font-black text-dark-500 uppercase tracking-[0.2em]">Audit Trail Active</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck size={14} className="text-brand-500" />
            <span className="text-[9px] font-black text-dark-500 uppercase tracking-[0.2em]">Verified Identities</span>
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
            <p className="text-dark-400 text-sm leading-relaxed font-inter">
              You are about to remove <span className="text-white font-black uppercase">{showDeleteModal.user_full_name}</span> from the organization. 
              This will immediately revoke their access to all teams, projects, and tasks in this workspace.
            </p>
            <div className="flex gap-4">
               <Button className="flex-1 border-dark-700" variant="secondary" onClick={() => setShowDeleteModal(null)}>Cancel</Button>
               <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleDelete}>Remove Access</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MembersPage;
