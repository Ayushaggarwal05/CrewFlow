import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, User, RefreshCw } from "lucide-react";
import { getMyActivityLogs } from "./activityAPI";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatRelativeTime } from "../../utils/helpers";
import toast from "react-hot-toast";

const MyActivity = () => {
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getMyActivityLogs();
      const normalized = Array.isArray(data) ? data : data?.results || [];
      setLogs(normalized);
    } catch {
      toast.error("Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
    toast.success("Refreshed");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="page-header">Activity</h1>
            <p className="text-dark-400 text-sm mt-0.5">
              All actions you’ve performed
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <CardSkeleton count={5} />
      ) : logs.length === 0 ? (
        <div className="card p-10 text-center">
          <Clock size={40} className="mx-auto text-dark-600 mb-3" />
          <p className="text-dark-400 font-medium">No activity yet</p>
          <p className="text-dark-500 text-sm mt-1">
            Your actions across organizations and projects will appear here
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-dark-800">
          {logs.map((log, i) => (
            <div key={log.id || i} className="flex items-start gap-3 p-4">
              <div className="w-7 h-7 bg-brand-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={14} className="text-brand-400" />
              </div>

              <div className="flex-1">
                <p className="text-sm text-dark-200">
                  <span className="font-medium text-dark-100">
                    {log.user?.full_name || log.user?.email || "You"}
                  </span>{" "}
                  {log.action}
                </p>

                <p className="text-xs text-dark-500 mt-0.5 flex items-center gap-1">
                  <Clock size={10} />
                  {formatRelativeTime(log.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyActivity;
