import api from "../../services/api";

/**
 * Join any entity (Organization / Team / Project) via a join code.
 * @param {string} code  e.g. "ORG-9XK3P", "TEAM-AB12", "PROJ-Z9Q8"
 */
export const joinViaCode = (code) =>
    api.post("/api/join/", { code });

/**
 * Regenerate the join code for an Organization (ADMIN only).
 * @param {number} orgId
 */
export const generateOrgCode = (orgId) =>
    api.post(`/api/organizations/${orgId}/generate-code/`);

/**
 * Regenerate the join code for a Team (ADMIN / MANAGER only).
 * @param {number} orgId
 * @param {number} teamId
 */
export const generateTeamCode = (orgId, teamId) =>
    api.post(`/api/teams/organizations/${orgId}/teams/${teamId}/generate-code/`);

/**
 * Regenerate the join code for a Project (ADMIN / MANAGER only).
 * @param {number} teamId
 * @param {number} projectId
 */
export const generateProjectCode = (teamId, projectId) =>
    api.post(`/api/projects/teams/${teamId}/projects/${projectId}/generate-code/`);
