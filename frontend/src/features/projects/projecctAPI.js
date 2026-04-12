import api from "../../services/api";

// GET  /api/projects/teams/<team_id>/projects/
// POST /api/projects/teams/<team_id>/projects/
// GET  /api/projects/teams/<team_id>/projects/<pk>/
// PATCH/DELETE as well

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
