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
 * @param {string} [role] Optional predefined role for this code
 */
export const generateOrgCode = (orgId, role) =>
    api.post(`/api/organizations/${orgId}/generate-code/`, { role });

/**
 * Regenerate the join code for a Team (ADMIN / MANAGER only).
 * @param {number} orgId
 * @param {number} teamId
 * @param {string} [role] Optional predefined role for this code
 */
export const generateTeamCode = (orgId, teamId, role) =>
    api.post(`/api/teams/organizations/${orgId}/teams/${teamId}/generate-code/`, { role });

/**
 * Regenerate the join code for a Project (ADMIN / MANAGER only).
 * @param {number} teamId
 * @param {number} projectId
 * @param {string} [role] Optional predefined role for this code
 */
export const generateProjectCode = (teamId, projectId, role) =>
    api.post(`/api/projects/teams/${teamId}/projects/${projectId}/generate-code/`, { role });

