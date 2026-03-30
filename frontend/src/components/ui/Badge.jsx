import { clsx } from "clsx";

const variants = {
  // Status
  TODO: "bg-dark-600/60 text-dark-300 border-dark-600",
  IN_PROGRESS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  DONE: "bg-green-500/20 text-green-400 border-green-500/30",
  // Priority
  LOW: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  // Role
  ADMIN: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  MANAGER: "bg-brand-500/20 text-brand-400 border-brand-500/30",
  DEVELOPER: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  LEAD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  MEMBER: "bg-dark-600/60 text-dark-300 border-dark-600",
  // Project status
  ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
  COMPLETED: "bg-brand-500/20 text-brand-400 border-brand-500/30",
  ARCHIVED: "bg-dark-600/60 text-dark-400 border-dark-600",
  // Generic
  default: "bg-dark-600/60 text-dark-300 border-dark-600",
};

const Badge = ({ label, variant, className = "" }) => {
  const style = variants[variant] || variants.default;
  return (
    <span className={clsx("badge border", style, className)}>
      {label || variant}
    </span>
  );
};

export default Badge;
