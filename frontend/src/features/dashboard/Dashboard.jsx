import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  FolderKanban,
  CheckSquare,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { fetchCurrentUser } from "../auth/authSlice";
import { getOrganizations } from "../organizations/organizationAPI";
import { CardSkeleton } from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { formatDate } from "../../utils/helpers";

const StatCard = ({ icon: Icon, label, value, color = "brand" }) => {
  const colorMap = {
    brand: "bg-brand-600/20 text-brand-400",
    green: "bg-green-600/20 text-green-400",
    blue: "bg-blue-600/20 text-blue-400",
    purple: "bg-purple-600/20 text-purple-400",
  };

  return (
    <div className="card p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color]}`}
      >
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-dark-50">{value}</p>
        <p className="text-sm text-dark-400">{label}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user if not available
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  // Fetch organizations
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        // if (mounted) setOrgs(data || []);
        const response = await getOrganizations();
        // Handle DRF pagination & custom renderer ({ success: true, data: { results: [] } })
        const payload =
          response.data?.data?.results ||
          response.data?.data ||
          response.data ||
          [];
        if (mounted) setOrgs(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.log("Failed to fetch orgs:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Role (safe fallback)
  const role = user?.org_role ?? user?.role ?? null;

  // Optional: redirect if not authenticated (extra safety)
  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-header">
          Welcome back, {user?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-dark-400 mt-1">
          Here's what's happening across your workspace.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Building2}
            label="Organizations"
            value={orgs.length}
          />
          <StatCard icon={Users} label="Teams" value="—" color="purple" />
          <StatCard
            icon={FolderKanban}
            label="Projects"
            value="—"
            color="blue"
          />
          <StatCard
            icon={CheckSquare}
            label="Open Tasks"
            value="—"
            color="green"
          />
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organizations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-dark-100">Your Organizations</h2>
            <button
              onClick={() => navigate("/app/organizations")}
              className="text-sm text-brand-400 hover:text-brand-300"
            >
              View all
            </button>
          </div>

          {loading ? (
            <CardSkeleton count={3} />
          ) : orgs.length === 0 ? (
            <div className="card p-8 text-center">
              <Building2 size={36} className="mx-auto text-dark-600 mb-3" />
              <p className="text-dark-400 font-medium">No organizations yet</p>
              <p className="text-dark-500 text-sm mt-1">
                Create your first organization to get started
              </p>
              <button
                onClick={() => navigate("/app/organizations")}
                className="btn-primary mt-4 mx-auto"
              >
                Create Organization
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orgs.slice(0, 5).map((org) => (
                <div
                  key={org.id}
                  className="card-hover p-4 cursor-pointer"
                  onClick={() => navigate(`/app/organizations/${org.id}/teams`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-600/20 rounded-xl flex items-center justify-center">
                        <Building2 size={18} className="text-brand-400" />
                      </div>
                      <div>
                        <p className="font-medium text-dark-100">{org.name}</p>
                        <p className="text-xs text-dark-500">
                          Created {formatDate(org.created_at)}
                        </p>
                      </div>
                    </div>
                    <TrendingUp size={16} className="text-dark-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          <h2 className="font-semibold text-dark-100">Your Role</h2>

          <div className="card p-5 space-y-4">
            {role ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center">
                    <Users size={18} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Your role</p>
                    <Badge variant={role} label={role} />
                  </div>
                </div>

                <div className="text-sm text-dark-400 space-y-2 border-t border-dark-700 pt-3">
                  {role === "ADMIN" && (
                    <p>Full access to organizations, teams, and members.</p>
                  )}
                  {role === "MANAGER" && <p>Manage teams and projects.</p>}
                  {role === "DEVELOPER" && <p>Work on assigned tasks.</p>}
                </div>
              </>
            ) : (
              <div className="text-center py-4 text-dark-500 text-sm">
                <Clock size={24} className="mx-auto mb-2 text-dark-600" />
                Join an organization to see your role
              </div>
            )}
          </div>

          {/* Quick Links */}
          <h2 className="font-semibold text-dark-100">Quick Access</h2>
          <div className="card divide-y divide-dark-700">
            {[
              {
                label: "Go to Projects",
                icon: FolderKanban,
                path: "/app/projects",
              },
              {
                label: "Organizations",
                icon: Building2,
                path: "/app/organizations",
              },
            ].map(({ label, icon: Icon, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700"
              >
                <Icon size={16} className="text-dark-500" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
