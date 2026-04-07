import { useDispatch, useSelector } from "react-redux";
import { Menu, Sun, Moon, Bell } from "lucide-react";
import { toggleTheme } from "../../app/themeSlice";
import { getInitials, getAvatarColor } from "../../utils/helpers";

const Navbar = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-dark-800 bg-dark-900/80 backdrop-blur-sm flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 bg-dark-700/60 rounded-lg px-3 py-2 text-sm text-dark-400 min-w-48">
          <span>🔍</span>
          <span>Search...</span>
          <span className="ml-auto text-xs bg-dark-600 px-1.5 py-0.5 rounded text-dark-500">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
          title={
            mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 cursor-pointer ${getAvatarColor(user?.full_name)}`}
          title={user?.full_name}
        >
          {getInitials(user?.full_name)}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
