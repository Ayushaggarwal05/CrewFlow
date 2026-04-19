import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  RefreshCcw, 
  Trash2, 
  MessageSquare, 
  UserPlus, 
  Edit3,
  ExternalLink 
} from "lucide-react";
import { formatDate, getInitials, getAvatarColor } from "../../utils/helpers";

const ActivityItem = ({ log }) => {
  const navigate = useNavigate();
  const { user, action, project, organization, timestamp } = log;

  // Determine Action Style & Icon
  const actionDetails = useMemo(() => {
    const act = action.toLowerCase();
    
    if (act.includes("created")) {
      return { 
        icon: Plus, 
        color: "text-green-400", 
        bgColor: "bg-green-500/10",
        indicator: "bg-green-500" 
      };
    }
    if (act.includes("updated") || act.includes("status")) {
      return { 
        icon: RefreshCcw, 
        color: "text-blue-400", 
        bgColor: "bg-blue-500/10", 
        indicator: "bg-blue-500"
      };
    }
    if (act.includes("deleted") || act.includes("removed")) {
      return { 
        icon: Trash2, 
        color: "text-red-400", 
        bgColor: "bg-red-500/10", 
        indicator: "bg-red-500"
      };
    }
    if (act.includes("comment")) {
      return { 
        icon: MessageSquare, 
        color: "text-purple-400", 
        bgColor: "bg-purple-500/10", 
        indicator: "bg-purple-500"
      };
    }
    if (act.includes("joined")) {
      return { 
        icon: UserPlus, 
        color: "text-brand-400", 
        bgColor: "bg-brand-500/10", 
        indicator: "bg-brand-500"
      };
    }
    
    return { 
      icon: Edit3, 
      color: "text-dark-300", 
      bgColor: "bg-dark-700/50", 
      indicator: "bg-dark-500" 
    };
  }, [action]);

  const Icon = actionDetails.icon;
  const userName = user?.full_name || "Unknown User";

  return (
    <div className="group relative flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-dark-800/40 border border-transparent hover:border-dark-700/50">
      {/* Connector Line Dot */}
      <div className={`absolute -left-[30px] top-6 w-3 h-3 rounded-full border-2 border-dark-900 ${actionDetails.indicator} z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]`} />
      
      {/* Avatar Section */}
      <div className="relative shrink-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg ${getAvatarColor(userName)}`}>
          {getInitials(userName)}
        </div>
        <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg ${actionDetails.bgColor} ${actionDetails.color} border border-dark-900 shadow-xl`}>
          <Icon size={10} strokeWidth={3} />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-dark-100 font-medium">
            <span className="text-white font-black hover:text-brand-400 cursor-pointer transition-colors uppercase tracking-tight text-xs mr-1">{userName}</span>
            <span className="text-dark-400 inline-block align-middle lowercase ml-1">{action}</span>
          </p>
          <span className="shrink-0 text-[10px] font-bold text-dark-500 uppercase tracking-widest whitespace-nowrap">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {(project || organization) && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {organization && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 rounded-lg group-hover:border-brand-500/40 transition-colors">
                <span className="text-[10px] font-black text-brand-400 uppercase tracking-tighter">
                  {organization.name}
                </span>
              </div>
            )}
            {project && (
              <button 
                onClick={() => navigate(`/app/projects/${project.id}/tasks`)}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-dark-900 border border-dark-700/50 rounded-lg group-hover:border-brand-500/30 transition-colors cursor-pointer"
              >
                <ExternalLink size={10} className="text-brand-500" />
                <span className="text-[10px] font-bold text-dark-300 uppercase tracking-tighter">
                  {project.name}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityItem;
