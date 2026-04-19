import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOrganizations, getOrganization, getOrgStats, createOrganization, deleteOrganization } from "./organizationAPI";
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


export const addOrganization = createAsyncThunk(
  "org/addOrganization",
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await createOrganization(orgData);
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to create organization");
    }
  }
);

export const removeOrganization = createAsyncThunk(
  "org/removeOrganization",
  async (orgId, { rejectWithValue, getState }) => {
    try {
      await deleteOrganization(orgId);
      return orgId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete organization");
    }
  }
);

const initialState = {
  organizations: [],
  selectedOrgId: localStorage.getItem("selected_org_id") ? Number(localStorage.getItem("selected_org_id")) : null,
  selectedOrgDetails: null,
  userRole: null, 
  stats: null,
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
      .addCase(addOrganization.fulfilled, (state, action) => {
        state.organizations.unshift(action.payload);
      })
      .addCase(removeOrganization.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.organizations = state.organizations.filter(o => o.id !== deletedId);
        if (state.selectedOrgId === deletedId) {
          state.selectedOrgId = state.organizations.length > 0 ? state.organizations[0].id : null;
          if (state.selectedOrgId) {
            localStorage.setItem("selected_org_id", state.selectedOrgId);
          } else {
            localStorage.removeItem("selected_org_id");
          }
        }
      });
  },
});

export const { setSelectedOrg, clearOrgState } = orgSlice.actions;
export default orgSlice.reducer;
