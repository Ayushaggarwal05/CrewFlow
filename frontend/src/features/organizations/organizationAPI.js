import api from "../../services/api";

// GET all organizations
export const getOrganizations = (params) =>
  api.get("/api/organizations/", { params });

// CREATE organization
export const createOrganization = (data) =>
  api.post("/api/organizations/", data);

// GET single organization
export const getOrganization = (orgId) =>
  api.get(`/api/organizations/${orgId}/`);

// UPDATE organization
export const updateOrganization = (orgId, data) =>
  api.patch(`/api/organizations/${orgId}/`, data);

// DELETE organization
export const deleteOrganization = (orgId) =>
  api.delete(`/api/organizations/${orgId}/`);

// GET memberships
export const getOrgMemberships = (orgId) =>
  api.get(`/api/organizations/${orgId}/memberships/`);

// CREATE membership
export const createOrgMembership = (orgId, data) =>
  api.post(`/api/organizations/${orgId}/memberships/`, data);

// DELETE membership
export const deleteOrgMembership = (orgId, membershipId) =>
  api.delete(`/api/organizations/${orgId}/memberships/${membershipId}/`);

// GET users in org
export const getOrgUsers = (orgId) =>
  api.get(`/api/users/organizations/${orgId}/users/`);
