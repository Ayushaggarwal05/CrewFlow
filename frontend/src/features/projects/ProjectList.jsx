import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, ArrowRight, Rocket, Plus } from "lucide-react";

import useCurrentOrg from "../../hooks/useCurrentOrg";
import { getTeams } from "../teams/teamAPI";
import { getProjects } from "./projectAPI";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate } from "../../utils/helpers";

import toast from "react-hot-toast";
import JoinCodeModal from "../invites/JoinCodeModal";

const ProjectList = () => {
  const navigate = useNavigate();
  const { organizations, refreshOrgs } = useCurrentOrg();
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showJoin, setShowJoin] = useState(false);

  const loadAll = useCallback(async () => {
    if (organizations.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      // Fetch all teams in parallel for the organizations we have in Redux
      const teamsResponses = await Promise.all(
        organizations.map((org) =>
          getTeams(org.id)
            .then((res) => ({ org, teams: res.data?.results || res.data || [] }))
            .catch((err) => {
              console.error(`Teams error for org ${org.id}:`, err);
              return { org, teams: [] };
            }),
        ),
      );

      // Flatten teams
      const allTeams = teamsResponses.flatMap(({ org, teams }) =>
        (Array.isArray(teams) ? teams : []).map((team) => ({
          ...team,
          orgName: org.name,
          orgId: org.id,
        })),
      );

      // Fetch all projects in parallel
      const projectResponses = await Promise.all(
        allTeams.map((team) =>
          getProjects(team.id)
            .then((res) => {
              const projData = res.data?.results || res.data || [];
              return (Array.isArray(projData) ? projData : []).map((p) => ({
                ...p,
                teamName: team.name,
                orgName: team.orgName,
                teamId: team.id,
                orgId: team.orgId,
              }));
            })
            .catch((err) => {
              console.error(`Projects error for team ${team.id}:`, err);
              return [];
            }),
        ),
      );

      const projectList = projectResponses.flat();
      setAllProjects(projectList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [organizations]);

  useEffect(() => {
    if (organizations.length === 0) {
      refreshOrgs();
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered =
    filter === "ALL"
      ? allProjects
      : allProjects.filter((p) => p.status === filter);

  return (
    <div className="-mt-8 space-y-10 pb-20 animate-fade-in pt-0 px-2 lg:px-4 text-dark-100 relative overflow-hidden bg-transparent">
      {/* Subtle top right atmospheric glowing highlight */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/8 via-cyan-500/3 to-transparent rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Header */}
      <div className="page-header-container border-b border-dark-800/60 pb-6 flex items-center justify-between flex-wrap gap-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600/10 to-purple-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/5">
            <FolderKanban size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 text-transparent bg-clip-text tracking-tight mb-0">
              Projects
            </h1>
            <p className="text-dark-300 font-light text-sm mt-1 leading-relaxed">
              All active projects across your organization workspaces.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-dark-900/60 border border-white/5 p-1 rounded-xl gap-1 mr-2">
            {["ALL", "ACTIVE", "COMPLETED", "ARCHIVED"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-200 ${filter === s
                  ? "bg-brand-500/15 border border-brand-500/25 text-brand-400 shadow-[0_0_12px_rgba(99,102,241,0.05)]"
                  : "text-dark-400 hover:text-white border border-transparent"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Rocket} onClick={() => setShowJoin(true)}>
              Join
            </Button>
            <Button size="sm" icon={Plus} onClick={() => navigate("/app/organizations")}>
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {loading ? (
          <CardSkeleton count={3} />
        ) : filtered.length === 0 ? (
          <div className="relative bg-[#0f172a]/45 backdrop-blur-[20px] border-dashed border-2 border-dark-700/60 rounded-[24px] p-16 text-center max-w-lg mx-auto">
            <FolderKanban size={48} className="mx-auto text-dark-500 mb-4 animate-pulse" />
            <p className="text-dark-200 font-bold text-lg">No projects found</p>
            <p className="text-dark-400 text-sm mt-2 font-light leading-relaxed mb-6">
              Join an existing team workspace with a code or setup an organization flow to initialize your first project.
            </p>
            <div className="flex flex-row justify-center items-center gap-3">
              <Button variant="secondary" size="sm" icon={Rocket} onClick={() => setShowJoin(true)}>
                Join Workspace
              </Button>
              <Button size="sm" icon={Plus} onClick={() => navigate("/app/organizations")}>
                New Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((proj) => {
              const activeColors = [
                "bg-indigo-600/10 text-indigo-400 border-indigo-500/20 shadow-indigo-500/5",
                "bg-cyan-600/10 text-cyan-400 border-cyan-500/20 shadow-cyan-500/5",
                "bg-purple-600/10 text-purple-400 border-purple-500/20 shadow-purple-500/5"
              ];
              const colorTheme = activeColors[proj.id % activeColors.length];

              return (
                <div
                  key={proj.id}
                  className="relative bg-[#0f172a]/45 backdrop-blur-[20px] border border-white/[0.04] rounded-[24px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-indigo-500/25 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6),0_0_30px_rgba(99,102,241,0.12)] p-6 cursor-pointer group flex flex-col justify-between h-[230px]"
                  onClick={() =>
                    navigate(`/app/teams/${proj.teamId}/projects/${proj.id}`)
                  }
                >
                  <div className="w-full flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className={`p-2.5 rounded-xl border transition-all bg-dark-800 text-dark-400 group-hover:scale-105 ${colorTheme}`}>
                        <FolderKanban size={18} />
                      </div>

                      {/* Sci-fi Status Badge */}
                      <div className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${proj.status === 'COMPLETED'
                        ? "bg-brand-500/10 border-brand-500/20 text-brand-400 shadow-[0_0_12px_rgba(99,102,241,0.05)]"
                        : proj.status === 'ARCHIVED'
                          ? "bg-dark-700/10 border-dark-700/20 text-dark-400"
                          : "bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.05)]"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${proj.status === 'COMPLETED' ? "bg-brand-400" : proj.status === 'ARCHIVED' ? "bg-dark-400" : "bg-green-400 animate-pulse"
                          }`} />
                        <span>{proj.status || "ACTIVE"}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
                        {proj.name}
                      </h3>
                      <p className="text-[10px] text-dark-500 font-bold uppercase tracking-widest mt-1">
                        {proj.orgName} / {proj.teamName}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3.5 border-t border-white/[0.03] w-full mt-4">
                    <span className="text-[10px] text-dark-500 font-mono">
                      {proj.deadline ? `Due ${formatDate(proj.deadline)}` : "No deadline"}
                    </span>

                    <span className="flex items-center gap-1 text-[10px] text-brand-400 font-bold uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                      Open Board <ArrowRight size={12} className="text-brand-400" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <JoinCodeModal
        open={showJoin}
        onClose={() => setShowJoin(false)}
        onSuccess={loadAll}
      />
    </div>
  );
};

export default ProjectList;
