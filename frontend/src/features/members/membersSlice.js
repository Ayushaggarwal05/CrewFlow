import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getOrgMemberships, patchOrgMembership, deleteOrgMembership } from "../organizations/organizationAPI";

export const fetchMembers = createAsyncThunk(
  "members/fetchMembers",
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await getOrgMemberships(orgId);
      // Backend results are at response.data or response.data.results
      const payload = response.data?.data?.results || response.data?.results || response.data || [];
      return payload;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch members");
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  "members/updateMemberRole",
  async ({ orgId, membershipId, role }, { rejectWithValue }) => {
    try {
      const response = await patchOrgMembership(orgId, membershipId, { role });
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update role");
    }
  }
);

export const removeMember = createAsyncThunk(
  "members/removeMember",
  async ({ orgId, membershipId }, { rejectWithValue }) => {
    try {
      await deleteOrgMembership(orgId, membershipId);
      return membershipId;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to remove member");
    }
  }
);

const initialState = {
  members: [],
  loading: false,
  error: null,
};

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearMembers: (state) => {
      state.members = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        const index = state.members.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.members = state.members.filter(m => m.id !== action.payload);
      });
  },
});

export const { clearMembers } = membersSlice.actions;
export default membersSlice.reducer;
