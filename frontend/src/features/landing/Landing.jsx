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
  Terminal
} from "lucide-react";
import logo from "../../assets/logo2.png";

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

          <div className="flex items-center gap-3">
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
        </div>
      </nav>
      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex justify-center items-center">
          <div className="absolute top-1/4 w-96 h-96 bg-brand-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-20 left-20 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center z-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800/50 backdrop-blur-sm border border-brand-500/30 rounded-full text-brand-400 text-sm font-medium mb-8 hover:bg-brand-600/10 transition-colors duration-300 cursor-default">
            <Zap size={16} className="text-amber-400" />
            <span className="text-dark-100">Project management reimagined</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-[1.1] tracking-tight mb-8">
            Build faster with{" "}
            <span className="text-gradient block mt-2">
              your crew
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
      <section id="features" className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-dark-900/50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything your team needs
            </h2>
            <p className="text-xl text-dark-400 max-w-2xl mx-auto">
              A comprehensive toolkit designed to help your team execute at the highest level.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon, title, desc }, index) => {
              const FeatureIcon = icon;
              return (
                <div key={title} className="glass-panel p-8 card-hover" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-6 border border-white/5">
                    <FeatureIcon size={24} className="text-brand-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-dark-300 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-600/5 mix-blend-overlay" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="glass-panel p-16 border-brand-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 via-purple-400 to-brand-400" />
            <CheckCircle size={56} className="mx-auto text-brand-400 mb-8" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to ship faster?
            </h2>
            <p className="text-xl text-dark-300 mb-10 max-w-xl mx-auto">
              Join thousands of teams already using CrewFlow to manage their work and achieve their goals.
            </p>
            <Link to="/register" className="bg-white text-dark-950 hover:bg-dark-50 font-bold px-10 py-4 rounded-xl shadow-glow hover:-translate-y-1 transform transition-all duration-300 inline-flex items-center gap-2">
              Get started — it's free
              <ArrowRight size={20} />
            </Link>
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
