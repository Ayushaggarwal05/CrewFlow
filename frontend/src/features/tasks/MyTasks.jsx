import { CheckSquare, Rocket } from "lucide-react";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";

const MyTasks = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
      <div className="w-20 h-20 bg-brand-600/10 rounded-3xl flex items-center justify-center mb-6 border border-brand-500/20">
        <CheckSquare size={40} className="text-brand-400" />
      </div>
      
      <h1 className="text-2xl font-bold text-dark-50 mb-3">My Tasks</h1>
      <p className="text-dark-400 max-w-md mx-auto mb-8">
        This is where your personalized task workflow will live. We're currently building a unified view for all your assignments across different teams and projects.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full mb-10">
        <div className="card p-5 border-dashed border-2 border-dark-700/50 flex flex-col items-center gap-3">
          <div className="p-2 bg-dark-700 rounded-lg text-dark-300">
             <Rocket size={20} />
          </div>
          <p className="text-sm font-semibold text-dark-200">Unified Inbox</p>
          <p className="text-xs text-dark-500">See everything in one place</p>
        </div>
        <div className="card p-5 border-dashed border-2 border-dark-700/50 flex flex-col items-center gap-3">
          <div className="p-2 bg-dark-700 rounded-lg text-dark-300">
             <CheckSquare size={20} />
          </div>
          <p className="text-sm font-semibold text-dark-200">Focus Mode</p>
          <p className="text-xs text-dark-500">Pick your top 3 for today</p>
        </div>
      </div>

      <Button onClick={() => navigate("/app/dashboard")}>
        Back to Dashboard
      </Button>
    </div>
  );
};

export default MyTasks;
