import api from "../../services/api";

// GET  /api/comments/task/<task_id>/comments/
// POST /api/comments/task/<task_id>/comments/
// PATCH/DELETE /api/comments/tasks/<task_id>/comments/<pk>/

export const getComments = (taskId) =>
  api.get(`/api/comments/task/${taskId}/comments/`);

export const createComment = (taskId, data) =>
  api.post(`/api/comments/task/${taskId}/comments/`, data);

export const deleteComment = (taskId, commentId) =>
  api.delete(`/api/comments/tasks/${taskId}/comments/${commentId}/`);
