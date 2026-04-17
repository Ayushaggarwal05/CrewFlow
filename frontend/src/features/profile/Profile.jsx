import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Award, 
  CheckCircle2, 
  ListTodo, 
  Layout, 
  TrendingUp,
  Save,
  X,
  Lock,
  Loader2
} from "lucide-react";
import { updateUserProfile } from "../auth/authSlice";
import { changePassword, getUserStats } from "../auth/authAPI";
import { getInitials, getAvatarColor, formatDate } from "../../utils/helpers";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import toast from "react-hot-toast";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { organizations } = useSelector((state) => state.org);
  
  const [personalForm, setPersonalForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
  });
  
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getUserStats();
        setStats(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (personalForm.full_name === user?.full_name) return;
    
    setUpdatingProfile(true);
    try {
      const result = await dispatch(updateUserProfile({ full_name: personalForm.full_name }));
      if (updateUserProfile.fulfilled.match(result)) {
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(result.payload?.detail || "Update failed");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return toast.error("Passwords do not match");
    }
    
    setUpdatingPassword(true);
    try {
      await changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      toast.success("Password updated successfully!");
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to update password";
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const isProfileChanged = personalForm.full_name !== user?.full_name;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* ─── Profile Header ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-dark-800 border border-dark-700 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-purple-600/10" />
        <div className="relative px-8 py-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-glow ${getAvatarColor(user?.full_name)}`}>
              {getInitials(user?.full_name)}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-brand-500 p-2 rounded-xl shadow-lg border-4 border-dark-800">
              <ShieldCheck size={20} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-3">
            <h1 className="text-4xl font-black text-white tracking-tight">{user?.full_name || "User Name"}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-dark-400 font-medium">
              <span className="flex items-center gap-2"><Mail size={16} className="text-brand-500" /> {user?.email}</span>
              <span className="flex items-center gap-2"><Calendar size={16} className="text-purple-500" /> Joined {formatDate(user?.date_joined)}</span>
              <Badge variant="ADMIN" label="Active Account" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ─── Personal Information ───────────────────────────────────────── */}
          <section className="glass-panel p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/10 rounded-lg">
                <User className="text-brand-500" size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Personal Information</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Full Name" 
                  icon={User}
                  value={personalForm.full_name}
                  onChange={(e) => setPersonalForm({...personalForm, full_name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                />
                <Input 
                  label="Email Address" 
                  icon={Mail}
                  value={personalForm.email}
                  disabled
                  helperText="Contact admin to change email"
                />
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={!isProfileChanged || updatingProfile}
                  loading={updatingProfile}
                  icon={Save}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </section>

          {/* ─── Security Settings ─────────────────────────────────────────── */}
          <section className="glass-panel p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Lock className="text-red-500" size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Security & Password</h2>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-5">
              <Input 
                label="Current Password" 
                type="password"
                placeholder="••••••••"
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="New Password" 
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                  required
                />
                <Input 
                  label="Confirm New Password" 
                  type="password"
                  placeholder="••••••••"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  variant="secondary" 
                  disabled={!passwordForm.new_password || updatingPassword}
                  loading={updatingPassword}
                  icon={ShieldCheck}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </section>
        </div>

        <div className="space-y-8">
          {/* ─── Activity Stats ──────────────────────────────────────────── */}
          <section className="glass-panel p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-400" />
              Activity Summary
            </h3>
            
            <div className="space-y-3">
              <StatItem 
                icon={ListTodo} 
                label="Tasks Assigned" 
                value={stats?.tasks_assigned} 
                loading={loadingStats}
                color="blue"
              />
              <StatItem 
                icon={CheckCircle2} 
                label="Tasks Completed" 
                value={stats?.tasks_completed} 
                loading={loadingStats}
                color="green"
              />
              <StatItem 
                icon={Layout} 
                label="Involved Projects" 
                value={stats?.projects_involved} 
                loading={loadingStats}
                color="brand"
              />
              <div className="pt-4 border-t border-dark-700">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-dark-500 uppercase tracking-widest">Completion Rate</span>
                  <span className="text-xl font-black text-white">{stats?.completion_rate || 0}%</span>
                </div>
                <div className="h-2 bg-dark-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-1000 shadow-glow" 
                    style={{ width: `${stats?.completion_rate || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ─── Organizations ────────────────────────────────────────────── */}
          <section className="glass-panel p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 size={18} className="text-purple-400" />
              Your Workspaces
            </h3>
            
            <div className="space-y-4">
              {organizations.length === 0 ? (
                <p className="text-sm text-dark-500 italic">No organizations yet.</p>
              ) : (
                organizations.map(org => (
                  <div key={org.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-800 border border-dark-700">
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate text-sm">{org.name}</p>
                      <p className="text-[10px] uppercase font-bold text-brand-500 tracking-widest">{org.user_role || "MEMBER"}</p>
                    </div>
                    <Award size={16} className={org.user_role === 'OWNER' ? 'text-brand-500' : 'text-dark-600'} />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value, loading, color }) => {
  const colors = {
    brand: "text-brand-400 bg-brand-400/10",
    green: "text-green-400 bg-green-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10",
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color] || colors.brand}`}>
          <Icon size={16} />
        </div>
        <span className="text-sm font-medium text-dark-300">{label}</span>
      </div>
      {loading ? (
        <Loader2 size={16} className="text-dark-600 animate-spin" />
      ) : (
        <span className="text-lg font-bold text-white">{value ?? 0}</span>
      )}
    </div>
  );
};

export default Profile;
