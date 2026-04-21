import api from "../../services/api";

export const getProjects = (teamId) =>
  api.get(`/api/projects/teams/${teamId}/projects/`);

export const createProject = (teamId, data) =>
  api.post(`/api/projects/teams/${teamId}/projects/`, data);

export const getProject = (teamId, projectId) =>
  api.get(`/api/projects/teams/${teamId}/projects/${projectId}/`);

export const updateProject = (teamId, projectId, data) =>
  api.patch(`/api/projects/teams/${teamId}/projects/${projectId}/`, data);

export const deleteProject = (teamId, projectId) =>
  api.delete(`/api/projects/teams/${teamId}/projects/${projectId}/`);

// GET /api/projects/<projectId>/members/
// Returns project-scoped members (team members of the project's team).
export const getProjectMemberships = (projectId) =>
  api.get(`/api/projects/${projectId}/members/`);
