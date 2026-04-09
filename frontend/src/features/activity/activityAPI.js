import api from "../../services/api";

// GET /api/activity/projects/<project_id>/activity/

export const getActivityLogs = (projectId) =>
  api.get(`/api/activity/projects/${projectId}/activity`);
