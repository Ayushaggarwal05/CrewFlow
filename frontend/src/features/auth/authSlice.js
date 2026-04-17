import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { loginUser, registerUser, logoutUser, getCurrentUser } from "./authAPI";

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
  if (!body) return { detail: "Network error. Is the server running?" };

  // After exception_handler fix, message is always a plain string in error responses
  const msg = body.message;
  if (typeof msg === "string" && msg) return { detail: msg };
  if (typeof msg === "object" && msg !== null) {
    // Field-level errors (registration validation)
    const parts = Object.entries(msg).map(([k, v]) => {
      const val = Array.isArray(v) ? v.join(", ") : String(v);
      return k === "detail" ? val : `${k}: ${val}`;
    });
    return { detail: parts.join(" · ") };
  }
  return { detail: "Something went wrong. Please try again." };
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
