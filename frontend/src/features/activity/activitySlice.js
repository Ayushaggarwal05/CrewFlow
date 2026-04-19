import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOrgActivityFeed, getMyActivityLogs } from "./activityAPI";

export const fetchOrgActivity = createAsyncThunk(
  "activity/fetchOrgActivity",
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await getOrgActivityFeed(orgId);
      // Backend returns a simple list for this endpoint
      const payload = response.data?.data || response.data || [];
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch activity feed");
    }
  }
);

export const fetchMyActivity = createAsyncThunk(
  "activity/fetchMyActivity",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyActivityLogs();
      const payload = response.data?.data || response.data?.results || response.data || [];
      return Array.isArray(payload) ? payload : [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch my activity");
    }
  }
);

const initialState = {
  activities: [],
  myActivities: [],
  loading: false,
  error: null,
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  reducers: {
    clearActivities: (state) => {
      state.activities = [];
      state.myActivities = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrgActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchOrgActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.myActivities = action.payload;
      })
      .addCase(fetchMyActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
