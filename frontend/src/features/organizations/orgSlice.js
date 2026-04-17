import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOrganizations, getOrganization, getOrgStats } from "./organizationAPI";
import { getOrgActivityFeed } from "../activity/activityAPI";

// Thunks
export const fetchOrganizations = createAsyncThunk(
  "org/fetchOrganizations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOrganizations();
      const payload = response.data?.data?.results || response.data?.data || response.data || [];
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch organizations");
    }
  }
);

export const fetchOrgDetails = createAsyncThunk(
  "org/fetchOrgDetails",
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await getOrganization(orgId);
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch organization details");
    }
  }
);

export const fetchOrgStats = createAsyncThunk(
  "org/fetchOrgStats",
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await getOrgStats(orgId);
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch organization stats");
    }
  }
);

export const fetchOrgActivity = createAsyncThunk(
  "org/fetchOrgActivity",
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await getOrgActivityFeed(orgId);
      return response.data?.data || response.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch activity feed");
    }
  }
);

const initialState = {
  organizations: [],
  selectedOrgId: localStorage.getItem("selected_org_id") ? Number(localStorage.getItem("selected_org_id")) : null,
  selectedOrgDetails: null,
  userRole: null, 
  stats: null,
  activityFeed: [],
  loading: false,
  error: null,
};

const orgSlice = createSlice({
  name: "org",
  initialState,
  reducers: {
    setSelectedOrg: (state, action) => {
      state.selectedOrgId = action.payload;
      localStorage.setItem("selected_org_id", action.payload);
      
      const currentOrg = state.organizations.find(o => Number(o.id) === Number(action.payload));
      if (currentOrg) {
        state.userRole = currentOrg.user_role || currentOrg.role || "MEMBER";
      }
    },
    clearOrgState: (state) => {
      state.selectedOrgId = null;
      state.selectedOrgDetails = null;
      state.userRole = null;
      state.stats = null;
      state.activityFeed = [];
      localStorage.removeItem("selected_org_id");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
        
        if (!state.selectedOrgId && action.payload.length > 0) {
          state.selectedOrgId = action.payload[0].id;
          localStorage.setItem("selected_org_id", action.payload[0].id);
        }

        const currentOrg = action.payload.find(o => Number(o.id) === Number(state.selectedOrgId));
        if (currentOrg) {
          state.userRole = currentOrg.user_role || currentOrg.role || "MEMBER";
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrgDetails.fulfilled, (state, action) => {
        state.selectedOrgDetails = action.payload;
        if (action.payload.user_role) {
            state.userRole = action.payload.user_role;
        }
      })
      .addCase(fetchOrgStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchOrgActivity.fulfilled, (state, action) => {
        state.activityFeed = action.payload;
      });
  },
});

export const { setSelectedOrg, clearOrgState } = orgSlice.actions;
export default orgSlice.reducer;
