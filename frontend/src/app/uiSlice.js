import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarMobileOpen: false,
  },
  reducers: {
    setSidebarMobileOpen: (state, action) => {
      state.sidebarMobileOpen = action.payload;
    },
    toggleSidebarMobile: (state) => {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },
  },
});

export const { setSidebarMobileOpen, toggleSidebarMobile } = uiSlice.actions;
export default uiSlice.reducer;
