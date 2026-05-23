import { useDispatch, useSelector } from "react-redux";
import { Menu, Sun, Moon, Bell, Search } from "lucide-react";
import { toggleTheme } from "../../app/themeSlice";
import { getInitials, getAvatarColor } from "../../utils/helpers";

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-dark-950/40 backdrop-blur-xl border-b border-dark-800/40 lg:rounded-2xl lg:mx-4 lg:mt-3 lg:mb-2 lg:border lg:border-dark-800/40 lg:shadow-xl lg:shadow-black/10 flex-shrink-0 z-30 transition-all duration-300">
      {/* Left controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all duration-200 active:scale-95"
        >
          <Menu size={20} />
        </button>

        {/* Premium interactive search bar */}
        <div className="hidden sm:flex items-center gap-2.5 bg-dark-950/40 hover:bg-dark-950/80 border border-dark-800 hover:border-dark-700/80 rounded-xl pt-2.5 pb-2.5 px-3.5 py-1.5 text-sm text-dark-400 w-72 md:w-[380px] focus-within:border-brand-500/60 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all duration-300 group cursor-pointer shadow-inner">
          <Search size={16} className="text-dark-500 group-hover:text-dark-300 transition-colors duration-300" />
          <span className="text-xs font-semibold tracking-wide text-dark-500 group-hover:text-dark-400 transition-colors duration-300">
            Search anything...
          </span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-dark-700 bg-dark-800 px-1.5 font-mono text-[9px] font-bold text-dark-500 shadow-sm">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-xl text-dark-400 hover:text-brand-400 hover:bg-dark-800 transition-all duration-300 group hover:scale-105 active:scale-95"
          title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <div className="transition-transform duration-500 group-hover:rotate-[360deg]">
            {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </div>
        </button>

        {/* Notifications with glowing pulse ring */}
        <button
          className="relative p-2 rounded-xl text-dark-400 hover:text-brand-400 hover:bg-dark-800 transition-all duration-300 group hover:scale-105 active:scale-95"
          title="Notifications"
        >
          <Bell size={18} className="transition-transform duration-300 group-hover:rotate-12" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-tr from-brand-400 to-indigo-500 rounded-full border border-dark-900 shadow-[0_0_10px_rgba(99,102,241,0.6)] animate-pulse" />
        </button>

        {/* Premium Avatar Layout */}
        <div className="relative group/avatar cursor-pointer pl-1.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 border-2 border-dark-700/60 group-hover/avatar:border-brand-500/80 shadow-md transition-all duration-300 hover:shadow-[0_0_12px_rgba(99,102,241,0.15)] ${getAvatarColor(user?.full_name)}`}
            title={user?.full_name}
          >
            {getInitials(user?.full_name)}
          </div>
          {/* Status Dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-dark-900 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
