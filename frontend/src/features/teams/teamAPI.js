import api from "../../services/api";

// GET  /api/teams/organizations/<org_id>/teams/
// POST /api/teams/organizations/<org_id>/teams/
// GET  /api/teams/organizations/<org_id>/teams/<pk>/
// GET  /api/teams/teams/<team_id>/memberships/
// POST /api/teams/teams/<team_id>/memberships/

export const getTeams = (orgId) =>
  api.get(`/api/teams/organizations/${orgId}/teams/`);

export const createTeam = (orgId, data) =>
  api.post(`/api/teams/organizations/${orgId}/teams/`, data);

export const getTeam = (orgId, teamId) =>
  api.get(`/api/teams/organizations/${orgId}/teams/${teamId}/`);

export const updateTeam = (orgId, teamId, data) =>
  api.patch(`/api/teams/organizations/${orgId}/teams/${teamId}/`, data);

export const deleteTeam = (orgId, teamId) =>
  api.delete(`/api/teams/organizations/${orgId}/teams/${teamId}/`);

export const getTeamMemberships = (teamId) =>
  api.get(`/api/teams/teams/${teamId}/memberships/`);

export const createTeamMembership = (teamId, data) =>
  api.post(`/api/teams/teams/${teamId}/memberships/`, data);

export const deleteTeamMembership = (teamId, membershipId) =>
  api.delete(`/api/teams/teams/${teamId}/memberships/${membershipId}/`);

export const updateTeamMembership = (teamId, membershipId, data) =>
  api.patch(`/api/teams/teams/${teamId}/memberships/${membershipId}/`, data);

export const getTeamUsers = (teamId) =>
  api.get(`/api/users/teams/${teamId}/users/`);
