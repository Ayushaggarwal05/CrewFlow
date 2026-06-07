import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Users,
  BarChart2,
  Shield,
  CheckCircle,
  ArrowRight,
  GitBranch,
  Layers,
  Activity,
  Heart,
  Terminal,
  Sparkles,
  Lock,
  Menu,
  X
} from "lucide-react";
import logo from "../../assets/logo2.png";
import heroBg from "../../assets/hero-bg.jpg";
import ThreeDScrollTriggerRow, { ThreeDScrollTriggerContainer } from "../../components/ui/ThreeDScrollTrigger";

const features = [
  {
    icon: Layers,
    title: "Project Management",
    desc: "Manage projects across teams with full lifecycle tracking from creation to completion.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Organize teams within organizations. Assign roles, manage memberships, and work together.",
  },
  {
    icon: BarChart2,
    title: "Kanban Boards",
    desc: "Drag-and-drop task boards with Todo, In Progress, and Done columns for every project.",
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Admin, Manager, and Developer roles with fine-grained permissions at every level.",
  },
  {
    icon: Activity,
    title: "Activity Logs",
    desc: "Full audit trail of every action in your projects. Stay informed, always.",
  },
  {
    icon: GitBranch,
    title: "Nested Structure",
    desc: "Organizations → Teams → Projects → Tasks. The hierarchy that mirrors how real teams work.",
  },
];

const trustedBy = ["Linear", "Notion", "Jira", "Asana", "Basecamp"];

const testimonials = [
  {
    quote: "CrewFlow decreased our feature delivery time by 40% in two months.",
    author: "Sarah Jenkins",
    role: "Growth Lead, TechFlow",
    bg: "bg-blue-600"
  },
  {
    quote: "Organizing teams and projects has never been this seamless and fast.",
    author: "Michael Chen",
    role: "Founder, ScaleUp",
    bg: "bg-indigo-600"
  },
  {
    quote: "The nested organizations and Kanban boards make tracking tasks so clear.",
    author: "Jessica Lee",
    role: "Marketing Director, ROI Labs",
    bg: "bg-purple-600"
  },
  {
    quote: "A must-have tool for modern engineering and product team scaling.",
    author: "David Ross",
    role: "CTO, AdVantage",
    bg: "bg-slate-800"
  },
  {
    quote: "Saved our managers 20 hours a week on manual alignment meetings.",
    author: "Emily White",
    role: "Head of Product, EcomGiant",
    bg: "bg-emerald-600"
  },
  {
    quote: "The activity logs and roles are absolute gold for corporate audit trails.",
    author: "Tom Baker",
    role: "Operations Director, AdLab",
    bg: "bg-amber-600"
  }
];

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 glass-nav max-w-7xl mx-auto">
        <div className="px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-0 group">
            <img src={logo} alt="CrewFlow Logo" className="w-12 h-12 group-hover:scale-110 transition-transform duration-300 object-contain drop-shadow-md" />
            <span className="text-2xl font-bold tracking-tight group-hover:opacity-80 transition-opacity duration-300">
              <span className="text-white">Crew</span>
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-sm">Flow</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#features"
              onClick={scrollTo("features")}
              className="text-dark-300 hover:text-brand-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              onClick={scrollTo("about")}
              className="text-dark-300 hover:text-brand-400 transition-colors"
            >
              About
            </a>
            <a
              href="#pricing"
              className="text-dark-300 hover:text-brand-400 transition-colors"
            >
              Pricing
            </a>
          </div>

          {/* Desktop Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm shadow-glow hover:-translate-y-0.5 transform transition-all duration-300">
              Get started free
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/login" className="px-3 py-1.5 text-xs font-semibold text-dark-300 hover:text-white transition-colors">
              Sign in
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-all duration-200 active:scale-95"
              aria-label="Toggle Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {menuOpen && (
          <div className="absolute top-20 left-0 right-0 mx-2 bg-dark-900/95 backdrop-blur-2xl border border-dark-800 rounded-3xl p-6 shadow-2xl z-40 md:hidden animate-fade-in flex flex-col gap-6">
            <div className="flex flex-col gap-4 text-center">
              <a
                href="#features"
                onClick={(e) => { scrollTo("features")(e); setMenuOpen(false); }}
                className="py-3 px-4 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors text-base font-semibold"
              >
                Features
              </a>
              <a
                href="#about"
                onClick={(e) => { scrollTo("about")(e); setMenuOpen(false); }}
                className="py-3 px-4 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors text-base font-semibold"
              >
                About
              </a>
              <a
                href="#pricing"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-xl text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors text-base font-semibold"
              >
                Pricing
              </a>
            </div>
            
            <div className="border-t border-dark-800 pt-6 flex flex-col gap-4">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full py-3 text-center text-sm font-semibold text-dark-300 hover:text-white hover:bg-dark-800 rounded-xl transition-all"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="w-full py-4 text-center text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-glow transition-all"
              >
                Get started free
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Cyberpunk Workspace Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBg}
              alt="Futuristic Developer Collaboration Background"
              className="w-full h-full object-cover object-[center_-80px] opacity-[0.26] filter brightness-[0.75] contrast-[1.15]"
            />
            {/* Precise gradients to blend with deep navy theme and keep text readable */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-dark-950 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[450px] bg-gradient-to-t from-dark-950 via-dark-950/75 to-transparent" />
            <div className="absolute inset-0 bg-dark-950/10" />
          </div>
          {/* Glowing Animated Ambient Blobs */}
          <div className="absolute inset-0 flex justify-center items-center z-10">
            <div className="absolute top-1/4 w-96 h-96 bg-brand-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-blob" />
            <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-20 left-20 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-60 animate-blob animation-delay-4000" />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800/50 backdrop-blur-sm border border-brand-500/30 rounded-full text-brand-400 text-sm font-medium mb-8 hover:bg-brand-600/10 transition-colors duration-300 cursor-default">
            <Zap size={16} className="text-amber-400" />
            <span className="text-dark-100">Project management reimagined</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
            Build faster with{" "}
            <span className="text-gradient block mt-2">
              Your Crew
            </span>
          </h1>

          <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            CrewFlow brings your entire organization into one workspace. Manage
            teams, track projects, and ship faster - all with role-based access
            control built-in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-8 py-4 rounded-xl flex items-center gap-2 shadow-glow hover:-translate-y-1 transform transition-all duration-300"
            >
              Start for free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="bg-dark-800 hover:bg-dark-700 border border-dark-600 text-white font-medium px-8 py-4 rounded-xl hover:-translate-y-1 transform transition-all duration-300">
              Sign in
            </Link>
          </div>

          <p className="mt-12 text-dark-500 text-sm font-medium uppercase tracking-wider">
            Trusted by modern teams at
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {trustedBy.map((name, i) => (
              <span key={`${name}-${i}`} className="text-xl font-bold text-dark-300">
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="relative max-w-5xl mx-auto mt-16">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-dark-800 border-b border-dark-700">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <div className="ml-4 flex-1 bg-dark-700 rounded-md h-5 max-w-xs" />
            </div>

            <div className="p-6 flex md:grid md:grid-cols-3 gap-4 overflow-x-auto snap-x scrollbar-thin">
              {[
                { col: "Todo", color: "text-dark-400", count: 3 },
                { col: "In Progress", color: "text-blue-400", count: 2 },
                { col: "Done", color: "text-green-400", count: 4 },
              ].map(({ col, color, count }) => (
                <div key={col} className="space-y-3 min-w-[200px] flex-1 md:min-w-0 snap-align-start flex-shrink-0">
                  <div className={`text-xs font-semibold uppercase ${color}`}>
                    {col}
                  </div>
                  {[...Array(count)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-dark-800 rounded-lg p-3 border border-dark-700 space-y-2"
                    >
                      <div className="h-3 bg-dark-700 rounded w-3/4 animate-pulse" />
                      <div className="h-2 bg-dark-700 rounded w-1/2" />
                      <div className="flex gap-1">
                        <div className="h-4 w-10 bg-brand-600/20 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 relative overflow-hidden bg-dark-950">
        <style>{`
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(0.5deg); }
          }
          @keyframes floatMedium {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-16px) rotate(-0.5deg); }
          }
          @keyframes floatFast {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-22px); }
          }
          @keyframes borderGlowSweep {
            0%, 100% { border-color: rgba(99, 102, 241, 0.15); }
            50% { border-color: rgba(168, 85, 247, 0.35); }
          }
          @keyframes pulsePing {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.08); opacity: 0.3; }
            100% { transform: scale(0.95); opacity: 0.8; }
          }
          @keyframes scrollLogs {
            0% { transform: translateY(0); }
            100% { transform: translateY(-33.33%); }
          }
          .animate-float-slow {
            animation: floatSlow 9s ease-in-out infinite;
          }
          .animate-float-medium {
            animation: floatMedium 7s ease-in-out infinite;
          }
          .animate-float-fast {
            animation: floatFast 5s ease-in-out infinite;
          }
          .spatial-card {
            position: relative;
            background: rgba(8, 13, 26, 0.4);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 24px;
            overflow: hidden;
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .spatial-card:hover {
            transform: translateY(-8px) scale(1.015);
            border-color: rgba(99, 102, 241, 0.25);
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.12);
          }
          .spatial-card::before {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            background: radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.08) 30%, transparent 60%);
            z-index: 1;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s ease;
          }
          .spatial-card::after {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            background: radial-gradient(400px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.4), rgba(6, 182, 212, 0.4) 30%, transparent 60%);
            z-index: 0;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.6s ease;
          }
          .spatial-card:hover::before, .spatial-card:hover::after {
            opacity: 1;
          }
          .spatial-grid-bg {
            background-size: 30px 30px;
            background-image: linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px);
          }
        `}</style>

        {/* Cinematic deep-space environment backgrounds */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Starry mesh */}
          <div className="absolute inset-0 spatial-grid-bg opacity-75" />
          {/* Large soft neon atmospheric glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-blue-600/5 rounded-full blur-[160px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-500/5 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/25 rounded-full text-purple-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Sparkles size={12} className="text-purple-400 animate-pulse" />
              <span>Features</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-none">
              Spatial Operating <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-300">System</span>
            </h2>
            <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto font-light leading-relaxed">
              Ditch the generic grids. CrewFlow acts like a high-end spatial console, unifying your organization into a gorgeous multi-layered environment.
            </p>
          </div>

          {/* ASYMMETRICAL SPATIAL GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch perspective-1000">

            {/* LEFT SATELLITE COLUMN: Col-span 3 */}
            <div className="lg:col-span-3 flex flex-col gap-8 justify-between">

              {/* FEATURE 1: Smart Team Collaboration */}
              <div
                className="spatial-card p-6 flex flex-col justify-between h-[360px] animate-float-slow group"
                onMouseMove={handleCardMouseMove}
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center border border-purple-500/30 mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <Users size={18} className="text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Smart Collaboration</h3>
                  <p className="text-dark-300 text-sm font-light leading-relaxed">
                    Dynamic presence tracking and high-fidelity synchronization bring teams into perfect coordination.
                  </p>
                </div>

                {/* VISUAL COMPONENT: Collaboration Network */}
                <div className="relative h-28 w-full mt-4 bg-dark-900/50 rounded-xl border border-dark-800/80 overflow-hidden flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 100">
                    <line x1="40" y1="50" x2="100" y2="30" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="160" y1="50" x2="100" y2="30" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="100" y1="30" x2="100" y2="80" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
                  </svg>

                  {/* Orbiting Avatar nodes */}
                  <div className="absolute top-1/4 left-1/5 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-purple-600 border border-purple-400 flex items-center justify-center text-[10px] text-white font-bold shadow-md shadow-purple-500/20">
                    S
                  </div>
                  <div className="absolute top-1/4 right-1/5 translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center text-[10px] text-white font-bold shadow-md shadow-indigo-500/20">
                    M
                  </div>
                  <div className="absolute bottom-1/5 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 rounded-full bg-cyan-600 border border-cyan-400 flex items-center justify-center text-[10px] text-white font-bold shadow-md shadow-cyan-500/20">
                    D
                  </div>

                  {/* AI Core pulse node */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center border-2 border-white/20 relative shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <Sparkles size={14} className="text-white" />
                    <span className="absolute -inset-2 rounded-full border border-purple-500/30 animate-ping opacity-60" />
                  </div>

                  <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] font-semibold text-green-400 tracking-wider uppercase">Active Live Sync</span>
                  </div>
                </div>
              </div>

              {/* FEATURE 2: Real-Time Kanban Boards */}
              <div
                className="spatial-card p-6 flex flex-col justify-between h-[360px] animate-float-medium group"
                onMouseMove={handleCardMouseMove}
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-indigo-500/30 mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <BarChart2 size={18} className="text-indigo-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Real-Time Kanban</h3>
                  <p className="text-dark-300 text-sm font-light leading-relaxed">
                    Interactive tasks flowing across stages with instant telemetry updates and fluid layouts.
                  </p>
                </div>

                {/* VISUAL COMPONENT: Isometric Kanban Stack */}
                <div className="relative h-28 w-full mt-4 bg-dark-900/50 rounded-xl border border-dark-800/80 p-2 overflow-hidden flex gap-2">
                  {[
                    { title: "Todo", count: 2, color: "border-purple-500/30 text-purple-400" },
                    { title: "Active", count: 1, color: "border-blue-500/40 text-blue-400", active: true },
                    { title: "Done", count: 2, color: "border-green-500/30 text-green-400" }
                  ].map((col, idx) => (
                    <div key={idx} className="flex-1 flex flex-col gap-1.5 bg-dark-950/40 border border-white/5 rounded-lg p-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider opacity-60">{col.title}</span>
                        <span className={`text-[8px] px-1 bg-white/5 border ${col.color} rounded-md font-mono`}>{col.count}</span>
                      </div>

                      {col.active ? (
                        <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-indigo-500/40 rounded px-1.5 py-1 flex flex-col gap-1 shadow-md shadow-indigo-500/10">
                          <div className="h-1 bg-indigo-300/40 rounded w-4/5" />
                          <div className="h-0.5 bg-indigo-300/20 rounded w-1/2" />
                          <div className="flex justify-between items-center mt-1">
                            <div className="w-2 h-2 rounded-full bg-brand-500" />
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-dark-800/40 border border-white/5 rounded px-1.5 py-1.5 flex flex-col gap-1">
                          <div className="h-1 bg-dark-600 rounded w-3/4" />
                          <div className="h-0.5 bg-dark-700 rounded w-1/3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER WIDESCREEN CORE CONSOLE: Col-span 6 */}
            <div
              className="lg:col-span-6 spatial-card p-8 flex flex-col justify-between min-h-[750px] border-brand-500/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] relative group animate-float-slow"
              onMouseMove={handleCardMouseMove}
            >
              {/* Animated corner nodes for sci-fi HUD feel */}
              <div className="absolute top-3 left-3 w-2 h-2 border-t-2 border-l-2 border-white/20" />
              <div className="absolute top-3 right-3 w-2 h-2 border-t-2 border-r-2 border-white/20" />
              <div className="absolute bottom-3 left-3 w-2 h-2 border-b-2 border-l-2 border-white/20" />
              <div className="absolute bottom-3 right-3 w-2 h-2 border-b-2 border-r-2 border-white/20" />

              <div className="relative z-10 w-full">
                {/* Browser UI header bar */}
                <div className="flex items-center justify-between border-b border-dark-800 pb-5 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                    <span className="text-xs font-mono text-dark-500 ml-4">~/crewflow/workspace/core-ai</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px] text-brand-400 bg-brand-500/5 border border-brand-500/20 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.05)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
                    <span>SYS CORE STATUS: NOMINAL</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                  {/* LEFT COMPONENT: NESTED WORKSPACE ARCHITECTURE */}
                  <div className="space-y-6">
                    <div>
                      <div className="inline-block px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                        Structural Core
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-2">Nested Architectures</h4>
                      <p className="text-dark-300 text-sm font-light leading-relaxed">
                        Organizations flow seamlessly into Teams, Projects, and Tasks with precise inheritance rules.
                      </p>
                    </div>

                    {/* Interactive tree graph */}
                    <div className="bg-dark-950/60 rounded-2xl border border-dark-800/80 p-5 relative overflow-hidden h-64 flex items-center justify-center">
                      <div className="absolute inset-0 spatial-grid-bg opacity-30" />

                      <div className="relative w-full h-full flex flex-col justify-between py-2">
                        {/* Node 1: Org (Root) */}
                        <div className="flex justify-center relative">
                          <div className="z-10 bg-gradient-to-r from-brand-600 to-indigo-600 border border-brand-400 text-white font-mono text-[10px] font-bold px-4 py-1.5 rounded-lg shadow-lg shadow-brand-500/20 flex items-center gap-2">
                            <Layers size={12} />
                            <span>Org: CrewFlow</span>
                          </div>

                          {/* Branch lines */}
                          <svg className="absolute top-8 left-0 w-full h-40 pointer-events-none" viewBox="0 0 200 160">
                            <path d="M100,0 L100,30 C100,30 100,45 60,45 L60,65" fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" />
                            <path d="M100,0 L100,30 C100,30 100,45 140,45 L140,65" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.5" />
                            <path d="M60,65 L60,95 C60,95 60,110 30,110 L30,130" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.2" />
                            <path d="M60,65 L60,95 C60,95 60,110 90,110 L90,130" fill="none" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1.2" />
                          </svg>
                        </div>

                        {/* Node 2: Teams */}
                        <div className="flex justify-between px-2 mt-4 relative">
                          <div className="z-10 bg-dark-900 border border-brand-500/30 text-dark-100 font-mono text-[9px] px-3 py-1 rounded-md shadow-md flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            <span>Team: Platform</span>
                          </div>
                          <div className="z-10 bg-dark-900 border border-cyan-500/30 text-dark-100 font-mono text-[9px] px-3 py-1 rounded-md shadow-md flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <span>Team: Growth</span>
                          </div>
                        </div>

                        {/* Node 3: Projects & Tasks */}
                        <div className="flex justify-start pl-1 gap-3 mt-4">
                          <div className="z-10 bg-dark-950/90 border border-white/5 text-dark-300 font-mono text-[8px] px-2 py-1 rounded shadow flex items-center gap-1">
                            <GitBranch size={10} className="text-purple-400" />
                            <span>Proj: SpaceUI</span>
                          </div>
                          <div className="z-10 bg-dark-950/90 border border-white/5 text-dark-300 font-mono text-[8px] px-2 py-1 rounded shadow flex items-center gap-1">
                            <CheckCircle size={10} className="text-green-400" />
                            <span>Task: 3D Grid</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COMPONENT: AI SPRINT GENERATOR & TELEMETRY */}
                  <div className="space-y-6">
                    <div>
                      <div className="inline-block px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                        AI Autopilot
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-2">AI Project Control</h4>
                      <p className="text-dark-300 text-sm font-light leading-relaxed">
                        Execute advanced sprints, auto-optimize backlogs, and run predictions in plain language.
                      </p>
                    </div>

                    {/* AI command console */}
                    <div className="bg-dark-900/80 border border-dark-800/80 rounded-2xl p-4 font-mono text-xs text-dark-300 h-64 flex flex-col justify-between overflow-hidden">
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-brand-400">
                          <span>&gt;</span>
                          <span className="border-r border-brand-400 pr-0.5 animate-pulse">/optimize-sprint --team Platform</span>
                        </div>

                        <div className="text-[11px] text-dark-400 leading-relaxed space-y-1">
                          <p className="text-white font-semibold">🤖 CrewFlow AI:</p>
                          <p>• Scanned 48 items across 2 projects.</p>
                          <p>• Found developer overload in "SpaceUI".</p>
                          <p className="text-cyan-400">• Re-allocated 3 tasks to Developer "D".</p>
                        </div>
                      </div>

                      {/* Spark telemetry graph */}
                      <div className="h-16 w-full border-t border-dark-800 pt-3 relative flex flex-col justify-end">
                        <div className="absolute top-2 left-0 text-[8px] text-dark-500">VELOCITY RATIO PROJECTION</div>
                        <svg className="w-full h-8 overflow-visible" viewBox="0 0 160 30">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <path d="M0,25 Q20,5 40,20 T80,10 T120,5 T160,2" fill="none" stroke="rgb(99,102,241)" strokeWidth="2" />
                          <path d="M0,25 Q20,5 40,20 T80,10 T120,5 T160,2 L160,30 L0,30 Z" fill="url(#chartGrad)" />
                          <circle cx="160" cy="2" r="3" fill="#818cf8" className="animate-ping" />
                          <circle cx="160" cy="2" r="2" fill="#818cf8" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Telemetry Command bar */}
              <div className="w-full bg-dark-900/60 border border-dark-800/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 relative mt-8 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-dark-400 font-mono">ENCRYPTED TELEMETRY STREAM LINKED</span>
                </div>
                <div className="flex gap-4 font-mono text-[9px] text-dark-500">
                  <span>ENGINES: 100%</span>
                  <span>SYNC: REALTIME</span>
                  <span>ACTIVE AGENTS: 48</span>
                </div>
              </div>
            </div>

            {/* RIGHT SATELLITE COLUMN: Col-span 3 */}
            <div className="lg:col-span-3 flex flex-col gap-8 justify-between">

              {/* FEATURE 3: Role-Based Access Control */}
              <div
                className="spatial-card p-6 flex flex-col justify-between h-[360px] animate-float-medium group"
                onMouseMove={handleCardMouseMove}
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30 mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <Shield size={18} className="text-cyan-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Role-Based Access</h3>
                  <p className="text-dark-300 text-sm font-light leading-relaxed">
                    Granular boundaries matching enterprise constraints, with Admin, Manager, and Dev roles.
                  </p>
                </div>

                {/* VISUAL COMPONENT: Security Rings */}
                <div className="relative h-28 w-full mt-4 bg-dark-900/50 rounded-xl border border-dark-800/80 p-2 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 flex justify-center items-center">
                    <div className="absolute w-20 h-20 border border-dashed border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                    <div className="absolute w-16 h-16 border border-dashed border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
                    <div className="absolute w-12 h-12 bg-dark-950 rounded-full flex items-center justify-center border border-white/10 shadow-inner shadow-cyan-500/10">
                      <Lock size={14} className="text-cyan-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Digital Scopes */}
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-dark-500">POLICY INTEGRITY</div>
                  <div className="absolute bottom-2 right-2 text-[8px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                    TLS 1.3 SIG
                  </div>
                </div>
              </div>

              {/* FEATURE 4: Activity Analytics */}
              <div
                className="spatial-card p-6 flex flex-col justify-between h-[360px] animate-float-slow group"
                onMouseMove={handleCardMouseMove}
              >
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-pink-500/30 mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <Activity size={18} className="text-pink-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Activity Analytics</h3>
                  <p className="text-dark-300 text-sm font-light leading-relaxed">
                    Live system telemetry displaying activity streams and audits as they occur in real-time.
                  </p>
                </div>

                {/* VISUAL COMPONENT: Auto-Scrolling Activity Terminal */}
                <div className="relative h-28 w-full mt-4 bg-dark-900/80 border border-dark-800/80 rounded-xl p-2.5 overflow-hidden font-mono text-[9px] text-dark-400">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-dark-900 to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-dark-900 to-transparent z-10 pointer-events-none" />

                  <div
                    className="space-y-1.5"
                    style={{
                      animation: "scrollLogs 8s linear infinite"
                    }}
                  >
                    {[
                      { time: "00:04", label: "SYS", msg: "Workspace active.", color: "text-indigo-400" },
                      { time: "00:05", label: "AI", msg: "Allocated task 4", color: "text-purple-400" },
                      { time: "00:07", label: "USER", msg: "Sarah merged SpaceUI", color: "text-cyan-400" },
                      { time: "00:09", label: "RBAC", msg: "Admin policy verified", color: "text-green-400" },

                      { time: "00:04", label: "SYS", msg: "Workspace active.", color: "text-indigo-400" },
                      { time: "00:05", label: "AI", msg: "Allocated task 4", color: "text-purple-400" },
                      { time: "00:07", label: "USER", msg: "Sarah merged SpaceUI", color: "text-cyan-400" },
                      { time: "00:09", label: "RBAC", msg: "Admin policy verified", color: "text-green-400" }
                    ].map((log, idx) => (
                      <div key={idx} className="flex gap-1.5 items-center truncate">
                        <span className="text-[7px] text-dark-600">{log.time}</span>
                        <span className={`font-semibold ${log.color}`}>[{log.label}]</span>
                        <span className="text-dark-300">{log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative overflow-hidden bg-slate-50 border-t border-b border-slate-200/60">
        {/* Subtle ambient lighting */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">growth teams</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            Accelerating development and coordination for modern engineering teams worldwide.
          </p>
        </div>

        <ThreeDScrollTriggerContainer className="space-y-8 relative z-10">
          {/* Row 1 - Scrolling Left */}
          <ThreeDScrollTriggerRow baseVelocity={-1.5} className="py-4">
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="w-[300px] md:w-[450px] mx-4 p-8 rounded-2xl bg-white border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 whitespace-normal flex flex-col h-full justify-between group cursor-default hover:scale-[1.01] hover:border-slate-300"
              >
                <blockquote className="text-lg md:text-xl font-medium text-slate-700 mb-6 leading-relaxed">
                  "{item.quote}"
                </blockquote>
                <div className="flex items-center mt-auto">
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center text-white font-bold mr-3 flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    {item.author.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors duration-300 truncate">{item.author}</div>
                    <div className="text-sm text-slate-500 truncate">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </ThreeDScrollTriggerRow>

          {/* Row 2 - Scrolling Right */}
          <ThreeDScrollTriggerRow baseVelocity={1.5} className="py-4">
            {testimonials.slice().reverse().map((item, index) => (
              <div
                key={index}
                className="w-[300px] md:w-[450px] mx-4 p-8 rounded-2xl bg-white border border-slate-200/60 shadow-md hover:shadow-xl transition-all duration-300 whitespace-normal flex flex-col h-full justify-between group cursor-default hover:scale-[1.01] hover:border-slate-300"
              >
                <blockquote className="text-lg md:text-xl font-medium text-slate-700 mb-6 leading-relaxed">
                  "{item.quote}"
                </blockquote>
                <div className="flex items-center mt-auto">
                  <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center text-white font-bold mr-3 flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                    {item.author.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors duration-300 truncate">{item.author}</div>
                    <div className="text-sm text-slate-500 truncate">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </ThreeDScrollTriggerRow>
        </ThreeDScrollTriggerContainer>
      </section>

      {/* CTA Section (About) */}
      <section id="about" className="py-28 px-6 relative overflow-hidden bg-gradient-to-r from-brand-700 via-indigo-600 to-blue-600 text-white border-t border-b border-white/10 w-full">
        {/* Elegant glassmorphic background noise/grids inside the full width section */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Ambient floating glowing meshes */}
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-brand-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
          {/* Creative Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-cyan-200 text-xs font-bold uppercase tracking-wider mb-8 shadow-inner">
            <CheckCircle size={14} className="text-cyan-300" />
            <span>CrewFlow Workspace</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6 text-center leading-none max-w-3xl">
            Ready to ship <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-blue-100 drop-shadow-md">faster?</span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-2xl mx-auto text-center leading-relaxed font-normal opacity-90">
            Join thousands of high-performing teams already using CrewFlow to manage their organizations, coordinate teams, track Kanban boards, and achieve milestones in record time.
          </p>

          {/* Interactive Links/CTA Actions - Large Pill-Shaped buttons with increased padding */}
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              to="/register"
              className="group bg-white text-brand-700 hover:text-brand-600 hover:bg-slate-50 font-bold px-12 py-5 rounded-full shadow-xl hover:-translate-y-0.5 transform transition-all duration-300 inline-flex items-center gap-2.5 text-base"
            >
              Get started — it's free
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300 text-brand-700" />
            </Link>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white font-semibold px-10 py-5 rounded-full transition-all duration-300 text-base"
            >
              Sign in to Account
            </Link>
          </div>

          {/* Mini Guarantees / High Trust Points */}
          <div className="mt-12 pt-8 border-t border-white/10 w-full max-w-xl flex justify-between items-center text-xs font-semibold text-indigo-200/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-cyan-300" /> Free Forever Mode
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300/40" />
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-cyan-300" /> Unlimited Projects
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300/40" />
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-cyan-300" /> No Credit Card
            </span>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative border-t border-dark-800 bg-dark-950 pt-24 pb-12 px-6 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-600/5 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

            {/* Brand & Newsletter */}
            <div className="lg:col-span-4">
              <Link to="/" className="flex items-center gap-0 mb-6 group">
                <img src={logo} alt="CrewFlow Logo" className="w-16 h-16 pr-2 group-hover:scale-110 transition-transform duration-300 object-contain drop-shadow-lg" />
                <span className="text-3xl font-bold tracking-tight group-hover:opacity-80 transition-opacity duration-300">
                  <span className="text-white">Crew</span>
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-sm">Flow</span>
                </span>
              </Link>
              <p className="text-dark-300 mb-8 max-w-sm leading-relaxed">
                The most advanced project management platform for high-performing teams. Ship features, not excuses.
              </p>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Subscribe to our newsletter</h4>
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-dark-900 border border-dark-700 text-dark-100 placeholder-dark-500 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                  <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap shadow-glow">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 lg:pl-12">
              <div>
                <h4 className="text-white font-semibold mb-6">Product</h4>
                <ul className="space-y-4 text-dark-400">
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Features</a></li>
                  <li>
                    <a href="#" className="hover:text-brand-400 transition-colors flex items-center gap-2">
                      Integrations
                      <span className="bg-brand-500/20 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>
                    </a>
                  </li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Changelog</a></li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Enterprise</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6">Resources</h4>
                <ul className="space-y-4 text-dark-400">
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Community Forum</a></li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Help Center</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-6">Company</h4>
                <ul className="space-y-4 text-dark-400">
                  <li><a href="#" className="hover:text-brand-400 transition-colors">About Us</a></li>
                  <li>
                    <a href="#" className="hover:text-brand-400 transition-colors flex items-center gap-2">
                      Careers
                      <span className="bg-dark-800 text-dark-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-dark-700">WE'RE HIRING</span>
                    </a>
                  </li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Partners</a></li>
                  <li><a href="#" className="hover:text-brand-400 transition-colors">Legal</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-dark-800/80 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} CrewFlow Inc. All rights reserved.
            </p>

            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-400 hover:border-brand-500 hover:text-brand-400 transition-all duration-300 group shadow-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:scale-110 transition-transform">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-400 hover:border-brand-500 hover:text-brand-400 transition-all duration-300 group shadow-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:scale-110 transition-transform">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.8c0-1.2-.4-2.4-1.2-3.3 3.1-.3 6.3-1.5 6.3-6.8 0-1.5-.5-2.8-1.5-3.8.1-.4.6-1.8-.1-3.8-1.2 0-3.9 1.8-3.9 1.8-1.1-.3-2.3-.4-3.5-.4-1.2 0-2.4.1-3.5.4 0 0-2.7-1.8-3.9-1.8-.7 2-.2 3.4-.1 3.8-1 1-1.5 2.3-1.5 3.8 0 5.3 3.2 6.5 6.3 6.8-.8.9-1.2 2.1-1.2 3.3V23"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-400 hover:border-brand-500 hover:text-brand-400 transition-all duration-300 group shadow-card">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:scale-110 transition-transform">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm text-dark-500">
              <a href="#" className="hover:text-dark-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-dark-300 transition-colors">Terms</a>
              <p className="flex items-center gap-1">
                Made with <Heart size={14} className="text-brand-500 mx-0.5" /> by developers
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
