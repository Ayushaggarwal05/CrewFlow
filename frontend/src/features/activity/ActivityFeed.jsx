import { useMemo } from "react";
import { Activity, Rocket } from "lucide-react";
import ActivityItem from "./ActivityItem";
import { formatDate } from "../../utils/helpers";

const ActivityFeed = ({ activities, loading }) => {
  // Group activities by date category
  const groups = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const sortedGroups = {
      Today: [],
      Yesterday: [],
      "Earlier this week": [],
      Older: []
    };

    activities.forEach(log => {
      const logDate = new Date(log.timestamp);
      logDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === today.getTime()) {
        sortedGroups["Today"].push(log);
      } else if (logDate.getTime() === yesterday.getTime()) {
        sortedGroups["Yesterday"].push(log);
      } else if (logDate.getTime() >= thisWeek.getTime()) {
        sortedGroups["Earlier this week"].push(log);
      } else {
        sortedGroups["Older"].push(log);
      }
    });

    return Object.entries(sortedGroups).filter(([_, items]) => items.length > 0);
  }, [activities]);

  if (loading && activities.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 animate-pulse">
            <div className="w-10 h-10 bg-dark-700 rounded-xl" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-dark-700 rounded w-1/2" />
              <div className="h-2 bg-dark-800 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center glass-panel border-dashed border-2 border-dark-700/50">
        <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mb-4 text-dark-500">
          <Activity size={32} />
        </div>
        <h3 className="text-lg font-semibold text-dark-100 uppercase tracking-tight">No actions yet</h3>
        <p className="text-dark-400 text-sm mt-2 max-w-xs">
          Recent activity from your workspace will appear here once your team starts moving.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-10">
      {/* Vertical Timeline Guide */}
      <div className="absolute left-[20px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-brand-500/20 via-dark-800 to-transparent" />

      {groups.map(([title, items]) => (
        <div key={title} className="space-y-4">
          <div className="flex items-center gap-3 ml-2.5">
             <div className="px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-700 text-[10px] font-black text-brand-400 uppercase tracking-widest shadow-xl">
               {title}
             </div>
             <div className="flex-1 h-[1px] bg-dark-800/50" />
          </div>
          
          <div className="space-y-2">
            {items.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        </div>
      ))}
      
      {activities.length >= 30 && (
         <div className="text-center pt-4">
            <button className="text-[10px] font-bold text-dark-500 uppercase tracking-widest hover:text-brand-400 transition-colors">
              View Earlier History →
            </button>
         </div>
      )}
    </div>
  );
};

export default ActivityFeed;
