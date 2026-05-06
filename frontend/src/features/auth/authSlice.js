import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { loginUser, registerUser, logoutUser, getCurrentUser, updateProfile, verifyOTP } from "./authAPI";

export const verifyEmailOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (data, { rejectWithValue }) => {
    try {
      const res = await verifyOTP(data);
      return extractData(res);
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

// Backend response format: { success, message, data }
// Success: { success: true, message: '', data: <payload> }
// Error:   { success: false, message: 'string', data: null }

{
  /*
It handles:
  Login
  Register
  Logout
  Fetch user
  Token storage
  Error handling  */
}

const extractData = (response) => response.data?.data ?? response.data;

const extractError = (err) => {
  const body = err.response?.data;
  if (!body) return { detail: "Network error. Please check your internet connection." };

  // If the backend followed our custom_exception_handler, message is a string
  if (typeof body.message === "string" && body.message) {
    return { detail: body.message };
  }

  // Fallback for legacy or direct DRF errors
  const msg = body.detail || body.message || body;
  if (typeof msg === "string") return { detail: msg };
  
  if (Array.isArray(msg)) {
    return { detail: msg.map(item => (typeof item === 'object' && item !== null) ? (item.string || String(item)) : String(item)).join(" · ") };
  }

  if (typeof msg === "object" && msg !== null) {
    const parts = Object.entries(msg).map(([k, v]) => {
      // Handle ErrorDetail or lists of strings
      let val = v;
      if (Array.isArray(v)) {
        val = v.map(item => (typeof item === 'object' && item !== null) ? (item.string || String(item)) : String(item)).join(", ");
      } else if (typeof v === 'object' && v !== null) {
        val = v.string || String(v);
      } else {
        val = String(v);
      }
      return k === "detail" || k === "message" ? val : `${k}: ${val}`;
    });
    return { detail: parts.join(" · ") };
  }

  return { detail: "An unexpected error occurred. Please try again." };
};

// ─── Async Thunks ───(A function that returns another function)─────────────────────────────────────────────────────────

export const login = createAsyncThunk(
  "auth/login",
  async (creds, { rejectWithValue }) => {
    try {
      const res = await loginUser(creds);
      const tokens = extractData(res); // { access, refresh }
      if (!tokens?.access) throw new Error("No access token in response");

      // Store tokens
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);

      // Important: update Axios default header BEFORE calling getCurrentUser
      api.defaults.headers.common.Authorization = `Bearer ${tokens.access}`;

      // Fetch user profile
      let user = null;
      try {
        const userRes = await getCurrentUser();
        user = extractData(userRes);
      } catch {
        // Non-fatal: user info can be fetched later
      }

      return { tokens, user };
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await registerUser(userData);
      return extractData(res);
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const refresh = localStorage.getItem("refresh_token");

      if (refresh) {
        await logoutUser(refresh); // backend logout (optional)
      }

      return { success: true }; // ✅ explicit return
    } catch (err) {
      // Optional: log error or send message
      return rejectWithValue({
        detail: "Logout failed on server, but local session cleared.",
        err,
      });
    } finally {
      // ✅ ALWAYS run (important)
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      delete api.defaults.headers.common.Authorization;
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getCurrentUser();
      return extractData(res);
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await updateProfile(userData);
      return extractData(res);
    } catch (err) {
      return rejectWithValue(extractError(err));
    }
  },
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState = {
  user: null, // Should contain { id, name, email } + other fields if available
  isAuthenticated: !!localStorage.getItem("access_token"),
  loading: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyEmailOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmailOTP.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyEmailOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // Token invalid/expired — clear auth
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
