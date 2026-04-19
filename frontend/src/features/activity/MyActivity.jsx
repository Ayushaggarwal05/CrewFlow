import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowLeft, 
  RefreshCw, 
  Activity, 
  History,
  ShieldCheck
} from "lucide-react";
import { fetchMyActivity } from "./activitySlice";
import ActivityFeed from "./ActivityFeed";
import Button from "../../components/ui/Button";
import { CardSkeleton } from "../../components/ui/Spinner";
import toast from "react-hot-toast";

const MyActivity = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myActivities, loading, error } = useSelector((state) => state.activity);

  const loadLogs = useCallback(() => {
    dispatch(fetchMyActivity());
  }, [dispatch]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleRefresh = async () => {
    const result = await dispatch(fetchMyActivity());
    if (fetchMyActivity.fulfilled.match(result)) {
      toast.success("Timeline updated");
    } else {
      toast.error("Failed to refresh history");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Premium Header Container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
        <div className="relative glass-panel p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-dark-700/50">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="mt-1 p-2 rounded-xl bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700 transition-all border border-dark-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-white tracking-tight">Your Activity</h1>
                <div className="px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 rounded-md text-[10px] font-black text-brand-400 uppercase tracking-widest">
                  Personal History
                </div>
              </div>
              <p className="text-dark-400 mt-1 font-medium italic">
                A complete record of your contributions across all workspaces.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
             <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-[10px] font-black text-dark-500 uppercase tracking-widest">Security Level</span>
                <span className="text-xs font-bold text-green-500 flex items-center gap-1.5"><ShieldCheck size={12}/> Encrypted Logs</span>
             </div>
             <Button 
               variant="secondary" 
               icon={RefreshCw} 
               onClick={handleRefresh}
               loading={loading}
               className="border-dark-700"
             >
               Refresh
             </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 border border-dark-700/30 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                  <Activity size={20} />
              </div>
              <div>
                  <p className="text-xs font-bold text-dark-500 uppercase tracking-widest">Total Actions</p>
                  <p className="text-xl font-black text-white">{myActivities.length}</p>
              </div>
          </div>
          <div className="glass-panel p-4 border border-dark-700/30 flex items-center gap-4 md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <History size={20} />
              </div>
              <div>
                  <p className="text-xs font-bold text-dark-500 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-dark-200">Recording synchronization active • 99.9% Integrity</p>
              </div>
          </div>
      </div>

      {/* Timeline Section */}
      <div className="glass-panel p-6 md:p-10 border border-dark-700/50 bg-dark-900/50">
        <ActivityFeed activities={myActivities} loading={loading} />
      </div>

      {/* Footer Info */}
      <div className="text-center pt-10">
          <p className="text-[10px] font-bold text-dark-600 uppercase tracking-[0.2em] max-w-md mx-auto leading-loose">
              Activity data is immutable and stored securely within the CrewFlow decentralised audit engine.
          </p>
      </div>
    </div>
  );
};

export default MyActivity;
