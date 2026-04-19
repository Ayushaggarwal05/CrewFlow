import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import orgReducer from "../features/organizations/orgSlice";
import taskReducer from "../features/tasks/taskSlice";
import activityReducer from "../features/activity/activitySlice";
import membersReducer from "../features/members/membersSlice";
import uiReducer from "./uiSlice";
import themeReducer from "./themeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    org: orgReducer,
    task: taskReducer,
    activity: activityReducer,
    members: membersReducer,
    ui: uiReducer,
    theme: themeReducer,
  },
});

export default store;
