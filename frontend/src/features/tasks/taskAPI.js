import api from "../../services/api";

// GET  /api/tasks/projects/<project_id>/tasks/
// POST /api/tasks/projects/<project_id>/tasks/
// GET  /api/tasks/projects/<project_id>/tasks/<pk>/
// PATCH/DELETE as well

export const getTasks = (projectId) =>
  api.get(`/api/tasks/projects/${projectId}/tasks/`);

export const createTask = (projectId, data) =>
  api.post(`/api/tasks/projects/${projectId}/tasks/`, data);

export const getTask = (projectId, taskId) =>
  api.get(`/api/tasks/projects/${projectId}/tasks/${taskId}/`);

export const updateTask = (projectId, taskId, data) =>
  api.patch(`/api/tasks/projects/${projectId}/tasks/${taskId}/`, data);

export const deleteTask = (projectId, taskId) =>
  api.delete(`/api/tasks/projects/${projectId}/tasks/${taskId}/`);

export const getMyOrgTasks = (orgId) =>
  api.get(`/api/tasks/my-tasks/`, { params: { org_id: orgId } });
