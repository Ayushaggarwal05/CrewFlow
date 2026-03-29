import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("theme") || "dark";
  }
  return "dark";
};

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: getInitialTheme() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("theme", state.mode);
      if (state.mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("theme", action.payload);
      if (action.payload === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
