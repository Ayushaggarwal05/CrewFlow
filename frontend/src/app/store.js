import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import orgReducer from "../features/organizations/orgSlice";
import uiReducer from "./uiSlice";
import themeReducer from "./themeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    org: orgReducer,
    ui: uiReducer,
    theme: themeReducer,
  },
});

export default store;
