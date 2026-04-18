import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, ArrowRight } from "lucide-react";

import useCurrentOrg from "../../hooks/useCurrentOrg";
import { getTeams } from "../teams/teamAPI";
import { getProjects } from "./projectAPI";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate } from "../../utils/helpers";

import toast from "react-hot-toast";

const ProjectList = () => {
  const navigate = useNavigate();
  const { organizations, refreshOrgs } = useCurrentOrg();
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const loadAll = useCallback(async () => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-header">Projects</h1>
          <p className="text-dark-400 text-sm mt-1">
            All projects across your organizations
          </p>
        </div>

        <div className="flex gap-2">
          {["ALL", "ACTIVE", "COMPLETED", "ARCHIVED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs ${filter === s
                  ? "bg-brand-600 text-white"
                  : "bg-dark-700 text-dark-400"
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderKanban size={48} className="mx-auto text-dark-600 mb-4" />
          <p className="text-dark-300 font-medium text-lg">No projects found</p>

          <Button
            className="mt-4"
            onClick={() => navigate("/app/organizations")}
          >
            Go to Organizations
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="card-hover p-5"
              onClick={() =>
                navigate(`/app/teams/${proj.teamId}/projects/${proj.id}`)
              }
            >
              <Badge variant={proj.status} />

              <h3 className="font-semibold mt-2">{proj.name}</h3>

              <p className="text-xs text-dark-500">
                {proj.orgName} / {proj.teamName}
              </p>

              {proj.deadline && (
                <p className="text-xs text-dark-500">
                  Due {formatDate(proj.deadline)}
                </p>
              )}

              <div className="flex items-center gap-1 mt-2 text-brand-400 text-xs">
                Open board <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
