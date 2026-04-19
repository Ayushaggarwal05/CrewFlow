import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMyOrgTasks, updateTask } from "./taskAPI";

export const fetchMyTasks = createAsyncThunk(
  "task/fetchMyTasks",
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await getMyOrgTasks(orgId);
      return response.data?.data || response.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch tasks");
    }
  }
);

export const toggleTaskDone = createAsyncThunk(
  "task/toggleTaskDone",
  async ({ projectId, taskId, currentStatus }, { rejectWithValue }) => {
    try {
      const newStatus = currentStatus === "DONE" ? "TODO" : "DONE";
      const response = await updateTask(projectId, taskId, { status: newStatus });
      return { taskId, newStatus, data: response.data?.data || response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update task");
    }
  }
);

const initialState = {
  myTasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    clearTaskState: (state) => {
      state.myTasks = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.myTasks = action.payload;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleTaskDone.fulfilled, (state, action) => {
        const { taskId, newStatus } = action.payload;
        if (newStatus === "DONE") {
            state.myTasks = state.myTasks.filter(t => t.id !== taskId);
        }
      });
  },
});

export const { clearTaskState } = taskSlice.actions;
export default taskSlice.reducer;
