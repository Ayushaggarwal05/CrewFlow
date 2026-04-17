import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FolderKanban, ArrowRight } from "lucide-react";

import { fetchWorkspaceSnapshot } from "../organizations/orgSlice";

import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { CardSkeleton } from "../../components/ui/Spinner";
import { formatDate } from "../../utils/helpers";

const ProjectList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const allProjects = useSelector((state) => state.org.allProjectsEnriched);
  const loading = useSelector((state) => state.org.workspaceSnapshotLoading);

  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchWorkspaceSnapshot());
  }, [dispatch]);

  const filtered = useMemo(
    () =>
      filter === "ALL"
        ? allProjects
        : allProjects.filter((p) => p.status === filter),
    [allProjects, filter],
  );

  return (
    <div className="space-y-6">
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
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs ${
                filter === s
                  ? "bg-brand-600 text-white"
                  : "bg-dark-700 text-dark-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

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
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/app/teams/${proj.teamId}/projects/${proj.id}`);
                }
              }}
              role="button"
              tabIndex={0}
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
