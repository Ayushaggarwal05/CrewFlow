import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOrganizations, getOrganization, getOrgMemberships } from "./organizationAPI";
import { getTeams, getTeam, getTeamMemberships } from "../teams/teamAPI";
import { getProjects } from "../projects/projectAPI";
import { getTasks } from "../tasks/taskAPI";
import { logout } from "../auth/authSlice";

export const SELECTED_ORG_STORAGE_KEY = "crewflow_selected_org_id";

const ORG_LIST_TTL_MS = 60_000;
const ORG_DETAIL_TTL_MS = 60_000;
const WORKSPACE_TTL_MS = 45_000;
const TEAM_PAGE_TTL_MS = 30_000;
const TASKS_TTL_MS = 20_000;

const readSelectedOrgId = () => {
  const raw = localStorage.getItem(SELECTED_ORG_STORAGE_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const persistSelectedOrgId = (id) => {
  if (id == null) {
    localStorage.removeItem(SELECTED_ORG_STORAGE_KEY);
    return;
  }
  localStorage.setItem(SELECTED_ORG_STORAGE_KEY, String(id));
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const extractOrgError = (err) => {
  const body = err.response?.data;
  if (!body) return { detail: "Network error. Is the server running?" };
  const msg = body.message ?? body.detail;
  if (typeof msg === "string" && msg) return { detail: msg };
  return { detail: "Something went wrong." };
};

const baseOrgState = {
  organizations: [],
  organizationsLoading: false,
  organizationsError: null,
  organizationsFetchedAt: null,

  selectedOrgId: null,

  orgDetailsById: {},
  orgDetailsLoadingById: {},
  orgDetailsFetchedAtById: {},
  orgDetailsErrorById: {},

  userRoleByOrgId: {},
  statsByOrgId: {},
  statsLoadingByOrgId: {},
  statsFetchedAtByOrgId: {},
  /** Tracks which user id org stats were resolved for (invalidates cache on user switch). */
  statsResolvedForUserByOrgId: {},

  teamsByOrgId: {},
  teamsLoadingByOrgId: {},
  teamsFetchedAtByOrgId: {},

  projectsByTeamId: {},

  teamPages: {},
  teamPageLoadingById: {},

  tasksByProjectId: {},
  tasksLoadingByProjectId: {},

  allProjectsEnriched: [],
  workspaceSnapshotLoading: false,
  workspaceSnapshotError: null,
  workspaceSnapshotFetchedAt: null,
};

const initialState = {
  ...baseOrgState,
  selectedOrgId: readSelectedOrgId(),
};

export const fetchOrganizations = createAsyncThunk(
  "org/fetchOrganizations",
  async ({ force = false } = {}, { rejectWithValue }) => {
    try {
      const res = await getOrganizations();
      const organizations = normalizeList(res.data);
      return { organizations, fetchedAt: Date.now() };
    } catch (err) {
      return rejectWithValue(extractOrgError(err));
    }
  },
  {
    condition: ({ force = false } = {}, { getState }) => {
      if (force) return true;
      const { organizations, organizationsFetchedAt } = getState().org;
      if (
        organizations.length > 0 &&
        organizationsFetchedAt &&
        Date.now() - organizationsFetchedAt < ORG_LIST_TTL_MS
      ) {
        return false;
      }
      return true;
    },
  },
);

export const fetchWorkspaceSnapshot = createAsyncThunk(
  "org/fetchWorkspaceSnapshot",
  async ({ force = false } = {}, { rejectWithValue }) => {
    try {
      const orgsRes = await getOrganizations();
      const orgList = normalizeList(orgsRes.data);
      const teamsByOrgId = {};
      const projectsByTeamId = {};
      const allTeams = [];

      for (const org of orgList) {
        const teamsRes = await getTeams(org.id);
        const teams = normalizeList(teamsRes.data);
        teamsByOrgId[org.id] = teams;
        for (const team of teams) {
          allTeams.push({ ...team, orgId: org.id, orgName: org.name });
        }
      }

      const allProjectsEnriched = [];
      for (const t of allTeams) {
        const prRes = await getProjects(t.id);
        const projects = normalizeList(prRes.data);
        projectsByTeamId[t.id] = projects;
        for (const p of projects) {
          allProjectsEnriched.push({
            ...p,
            teamId: t.id,
            teamName: t.name,
            orgId: t.orgId,
            orgName: t.orgName,
          });
        }
      }

      return {
        organizations: orgList,
        teamsByOrgId,
        projectsByTeamId,
        allProjectsEnriched,
        fetchedAt: Date.now(),
      };
    } catch (err) {
      return rejectWithValue(extractOrgError(err));
    }
  },
  {
    condition: ({ force = false } = {}, { getState }) => {
      if (force) return true;
      const { workspaceSnapshotFetchedAt, organizations } = getState().org;
      if (
        organizations.length > 0 &&
        workspaceSnapshotFetchedAt &&
        Date.now() - workspaceSnapshotFetchedAt < WORKSPACE_TTL_MS
      ) {
        return false;
      }
      return true;
    },
  },
);

export const fetchOrgDetails = createAsyncThunk(
  "org/fetchOrgDetails",
  async (orgId, { rejectWithValue }) => {
    try {
      const res = await getOrganization(orgId);
      return { orgId: Number(orgId), org: res.data, fetchedAt: Date.now() };
    } catch (err) {
      return rejectWithValue(extractOrgError(err));
    }
  },
  {
    condition: (orgId, { getState }) => {
      const id = Number(orgId);
      const { orgDetailsById, orgDetailsFetchedAtById } = getState().org;
      const at = orgDetailsFetchedAtById[id];
      if (orgDetailsById[id] && at && Date.now() - at < ORG_DETAIL_TTL_MS) {
        return false;
      }
      return true;
    },
  },
);

export const fetchOrgStats = createAsyncThunk(
  "org/fetchOrgStats",
  async (orgId, { getState, rejectWithValue }) => {
    const id = Number(orgId);
    const user = getState().auth.user;
    try {
      const res = await getOrgMemberships(id);
      const memberships = normalizeList(res.data);
      const mine = user?.id != null ? memberships.find((m) => m.user?.id === user.id || m.user === user.id) : null;
      const role = mine?.role ?? null;
      return {
        orgId: id,
        membersCount: memberships.length,
        role,
        fetchedAt: Date.now(),
        resolvedForUserId: user?.id ?? null,
      };
    } catch (err) {
      return rejectWithValue(extractOrgError(err));
    }
  },
  {
    condition: (orgId, { getState }) => {
      const id = Number(orgId);
      const user = getState().auth.user;
      const { statsFetchedAtByOrgId, statsByOrgId, statsResolvedForUserByOrgId } = getState().org;
      const at = statsFetchedAtByOrgId[id];
      const lastUser = statsResolvedForUserByOrgId[id];
      if (
        statsByOrgId[id] != null &&
        at &&
        Date.now() - at < ORG_DETAIL_TTL_MS &&
        lastUser === (user?.id ?? null)
      ) {
        return false;
      }
      return true;
    },
  },
);

export const fetchTeamsForOrg = createAsyncThunk(
  "org/fetchTeamsForOrg",
  async ({ orgId, force = false }, { getState, rejectWithValue }) => {
    const id = Number(orgId);
    if (!force) {
      const { teamsByOrgId, teamsFetchedAtByOrgId } = getState().org;
      const at = teamsFetchedAtByOrgId[id];
      if (teamsByOrgId[id] && at && Date.now() - at < ORG_LIST_TTL_MS) {
        return { orgId: id, teams: teamsByOrgId[id], fetchedAt: at, skipped: true };
      }
    }
    try {
      const res = await getTeams(id);
      const teams = normalizeList(res.data);
      return { orgId: id, teams, fetchedAt: Date.now(), skipped: false };
    } catch (err) {
      return rejectWithValue(extractOrgError(err));
    }
  },
);

export const fetchTeamPage = createAsyncThunk(
  "org/fetchTeamPage",
  async ({ orgId, teamId, force = false }, { getState, rejectWithValue }) => {
    const tid = Number(teamId);
    const oid = Number(orgId);
    if (!force) {
      const existing = getState().org.teamPages[tid];
      if (
        existing?.fetchedAt &&
        Date.now() - existing.fetchedAt < TEAM_PAGE_TTL_MS &&
        existing.team &&
        existing.projects &&
        existing.memberships
      ) {
        return {
          orgId: oid,
          teamId: tid,
          team: existing.team,
          projects: existing.projects,
          memberships: existing.memberships,
          fetchedAt: existing.fetchedAt,
          skipped: true,
        };
      }
    }
    try {
      const [teamRes, projectsRes, membersRes] = await Promise.all([
        getTeam(oid, tid),
        getProjects(tid),
        getTeamMemberships(tid),
      ]);
      const team = teamRes.data;
      const projects = normalizeList(projectsRes.data);
      const memberships = normalizeList(membersRes.data);
      return {
        orgId: oid,
        teamId: tid,
        team,
        projects,
        memberships,
        fetchedAt: Date.now(),
        skipped: false,
      };
    } catch (err) {
      return rejectWithValue(extractOrgError(err));
    }
  },
);

export const fetchProjectTasks = createAsyncThunk(
  "org/fetchProjectTasks",
  async ({ projectId, force = false }, { getState, rejectWithValue }) => {
    const pid = Number(projectId);
    if (!force) {
      const bucket = getState().org.tasksByProjectId[pid];
      if (bucket?.fetchedAt && Date.now() - bucket.fetchedAt < TASKS_TTL_MS) {
        return {
          projectId: pid,
          tasks: bucket.items,
          fetchedAt: bucket.fetchedAt,
          skipped: true,
        };
      }
    }
    try {
      const res = await getTasks(pid);
      const tasks = normalizeList(res.data);
      return { projectId: pid, tasks, fetchedAt: Date.now(), skipped: false };
    } catch (err) {
      return rejectWithValue(extractOrgError(err));
    }
  },
);

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    setSelectedOrg: (state, action) => {
      const id = action.payload == null ? null : Number(action.payload);
      state.selectedOrgId = Number.isFinite(id) ? id : null;
      persistSelectedOrgId(state.selectedOrgId);
    },
    patchProjectTaskStatus: (state, action) => {
      const { projectId, taskId, status } = action.payload;
      const pid = Number(projectId);
      const bucket = state.tasksByProjectId[pid];
      if (!bucket?.items) return;
      const t = bucket.items.find((x) => x.id === taskId);
      if (t) t.status = status;
    },
    addProjectTask: (state, action) => {
      const { projectId, task } = action.payload;
      const pid = Number(projectId);
      if (!state.tasksByProjectId[pid]) {
        state.tasksByProjectId[pid] = { items: [], fetchedAt: Date.now() };
      }
      state.tasksByProjectId[pid].items.push(task);
    },
    removeProjectTask: (state, action) => {
      const { projectId, taskId } = action.payload;
      const pid = Number(projectId);
      const bucket = state.tasksByProjectId[pid];
      if (!bucket?.items) return;
      bucket.items = bucket.items.filter((t) => t.id !== taskId);
    },
    upsertTeamPageProjects: (state, action) => {
      const { teamId, projects } = action.payload;
      const tid = Number(teamId);
      if (state.teamPages[tid]) {
        state.teamPages[tid].projects = projects;
        state.teamPages[tid].fetchedAt = Date.now();
      }
      state.projectsByTeamId[tid] = projects;
    },
    invalidateTeamPage: (state, action) => {
      const tid = Number(action.payload);
      delete state.teamPages[tid];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        persistSelectedOrgId(null);
        return { ...baseOrgState, selectedOrgId: null };
      })
      .addCase(fetchOrganizations.pending, (state) => {
        state.organizationsLoading = true;
        state.organizationsError = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.organizationsLoading = false;
        state.organizations = action.payload.organizations;
        state.organizationsFetchedAt = action.payload.fetchedAt;
        if (
          state.selectedOrgId &&
          !state.organizations.some((o) => o.id === state.selectedOrgId)
        ) {
          state.selectedOrgId = null;
          persistSelectedOrgId(null);
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.organizationsLoading = false;
        state.organizationsError = action.payload?.detail ?? "Failed to load organizations";
      })
      .addCase(fetchWorkspaceSnapshot.pending, (state) => {
        state.workspaceSnapshotLoading = true;
        state.workspaceSnapshotError = null;
      })
      .addCase(fetchWorkspaceSnapshot.fulfilled, (state, action) => {
        state.workspaceSnapshotLoading = false;
        state.organizations = action.payload.organizations;
        state.organizationsFetchedAt = action.payload.fetchedAt;
        state.teamsByOrgId = { ...state.teamsByOrgId, ...action.payload.teamsByOrgId };
        state.projectsByTeamId = {
          ...state.projectsByTeamId,
          ...action.payload.projectsByTeamId,
        };
        state.allProjectsEnriched = action.payload.allProjectsEnriched;
        state.workspaceSnapshotFetchedAt = action.payload.fetchedAt;
        for (const orgId of Object.keys(action.payload.teamsByOrgId)) {
          const id = Number(orgId);
          state.teamsFetchedAtByOrgId[id] = action.payload.fetchedAt;
        }
        if (
          state.selectedOrgId &&
          !state.organizations.some((o) => o.id === state.selectedOrgId)
        ) {
          state.selectedOrgId = null;
          persistSelectedOrgId(null);
        }
      })
      .addCase(fetchWorkspaceSnapshot.rejected, (state, action) => {
        state.workspaceSnapshotLoading = false;
        state.workspaceSnapshotError = action.payload?.detail ?? "Failed to load workspace";
      })
      .addCase(fetchOrgDetails.pending, (state, action) => {
        const id = action.meta.arg;
        state.orgDetailsLoadingById[id] = true;
        state.orgDetailsErrorById[id] = null;
      })
      .addCase(fetchOrgDetails.fulfilled, (state, action) => {
        const { orgId, org, fetchedAt } = action.payload;
        state.orgDetailsLoadingById[orgId] = false;
        state.orgDetailsById[orgId] = org;
        state.orgDetailsFetchedAtById[orgId] = fetchedAt;
      })
      .addCase(fetchOrgDetails.rejected, (state, action) => {
        const id = action.meta.arg;
        state.orgDetailsLoadingById[id] = false;
        state.orgDetailsErrorById[id] = action.payload?.detail ?? "Failed";
      })
      .addCase(fetchOrgStats.pending, (state, action) => {
        const id = action.meta.arg;
        state.statsLoadingByOrgId[id] = true;
      })
      .addCase(fetchOrgStats.fulfilled, (state, action) => {
        const { orgId, membersCount, role, fetchedAt, resolvedForUserId } = action.payload;
        state.statsLoadingByOrgId[orgId] = false;
        state.statsByOrgId[orgId] = { membersCount };
        state.statsFetchedAtByOrgId[orgId] = fetchedAt;
        state.statsResolvedForUserByOrgId[orgId] = resolvedForUserId;
        state.userRoleByOrgId[orgId] = role;
      })
      .addCase(fetchOrgStats.rejected, (state, action) => {
        const id = action.meta.arg;
        state.statsLoadingByOrgId[id] = false;
      })
      .addCase(fetchTeamsForOrg.pending, (state, action) => {
        const id = action.meta.arg.orgId;
        state.teamsLoadingByOrgId[id] = true;
      })
      .addCase(fetchTeamsForOrg.fulfilled, (state, action) => {
        const { orgId, teams, fetchedAt, skipped } = action.payload;
        state.teamsLoadingByOrgId[orgId] = false;
        if (!skipped) {
          state.teamsByOrgId[orgId] = teams;
          state.teamsFetchedAtByOrgId[orgId] = fetchedAt;
        }
      })
      .addCase(fetchTeamsForOrg.rejected, (state, action) => {
        const id = action.meta.arg.orgId;
        state.teamsLoadingByOrgId[id] = false;
      })
      .addCase(fetchTeamPage.pending, (state, action) => {
        const tid = action.meta.arg.teamId;
        state.teamPageLoadingById[tid] = true;
      })
      .addCase(fetchTeamPage.fulfilled, (state, action) => {
        const { teamId, team, projects, memberships, fetchedAt, skipped } = action.payload;
        state.teamPageLoadingById[teamId] = false;
        if (!skipped) {
          state.teamPages[teamId] = { team, projects, memberships, fetchedAt };
          state.projectsByTeamId[teamId] = projects;
        }
      })
      .addCase(fetchTeamPage.rejected, (state, action) => {
        const tid = action.meta.arg.teamId;
        state.teamPageLoadingById[tid] = false;
      })
      .addCase(fetchProjectTasks.pending, (state, action) => {
        const pid = action.meta.arg.projectId;
        state.tasksLoadingByProjectId[pid] = true;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        const { projectId, tasks, fetchedAt, skipped } = action.payload;
        state.tasksLoadingByProjectId[projectId] = false;
        if (!skipped) {
          state.tasksByProjectId[projectId] = { items: tasks, fetchedAt };
        }
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        const pid = action.meta.arg.projectId;
        state.tasksLoadingByProjectId[pid] = false;
      });
  },
});

export const {
  setSelectedOrg,
  patchProjectTaskStatus,
  addProjectTask,
  removeProjectTask,
  upsertTeamPageProjects,
  invalidateTeamPage,
} = orgSlice.actions;

export const selectWorkspaceTeamCount = (state) =>
  Object.values(state.org.teamsByOrgId).reduce((n, teams) => n + (teams?.length ?? 0), 0);

export const selectOrgUserRole = (state, orgId) =>
  orgId != null ? state.org.userRoleByOrgId[Number(orgId)] ?? null : null;

/** Resolve parent organization id for a team using cached workspace data. */
export const selectOrgIdForTeam = (state, teamId) => {
  const tid = Number(teamId);
  if (!Number.isFinite(tid)) return null;
  for (const [oid, teams] of Object.entries(state.org.teamsByOrgId)) {
    if (teams?.some((t) => Number(t.id) === tid)) return Number(oid);
  }
  return null;
};

export default orgSlice.reducer;
