import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import themeReducer from "./themeSlice";
import orgReducer from "../features/organizations/orgSlice";
import uiReducer from "./uiSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    org: orgReducer,
    theme: themeReducer,
    ui: uiReducer,
  },
});

export default store;
