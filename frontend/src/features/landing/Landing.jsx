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
} from "lucide-react";

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

const Landing = () => {
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-dark-800/80 bg-dark-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-glow">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-lg font-bold text-dark-50">CrewFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-dark-400">
            <a
              href="#features"
              onClick={scrollTo("features")}
              className="hover:text-dark-100 transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              onClick={scrollTo("about")}
              className="hover:text-dark-100 transition-colors"
            >
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-dark-300 hover:text-dark-100 transition-colors"
            >
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-600/10 border border-brand-600/20 rounded-full text-brand-400 text-sm font-medium mb-6">
            <Zap size={14} />
            Project management reimagined
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-dark-50 leading-tight tracking-tight mb-6">
            Build faster with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
              your crew
            </span>
          </h1>

          <p className="text-lg md:text-xl text-dark-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            CrewFlow brings your entire organization into one workspace. Manage
            teams, track projects, and ship faster — all with role-based access
            control built-in.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="btn-primary px-8 py-3.5 text-base flex items-center gap-2 shadow-glow"
            >
              Start for free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-3.5 text-base">
              Sign in
            </Link>
          </div>

          <p className="mt-8 text-dark-500 text-sm">
            Trusted by teams at{" "}
            {trustedBy.map((name, i) => (
              <span key={`${name}-${i}`}>
                <span className="text-dark-400">{name}</span>
                {i < trustedBy.length - 1 && <span className="mx-1">·</span>}
              </span>
            ))}
          </p>
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

            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { col: "Todo", color: "text-dark-400", count: 3 },
                { col: "In Progress", color: "text-blue-400", count: 2 },
                { col: "Done", color: "text-green-400", count: 4 },
              ].map(({ col, color, count }) => (
                <div key={col} className="space-y-3">
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
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="section-title mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-dark-50">
              Everything your team needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6">
                <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-dark-50">{title}</h3>
                <p className="text-dark-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card p-12">
            <CheckCircle size={48} className="mx-auto text-brand-400 mb-6" />
            <h2 className="text-3xl font-bold text-dark-50 mb-4">
              Ready to ship faster?
            </h2>
            <Link to="/register" className="btn-primary px-8 py-3.5">
              Get started — it's free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
