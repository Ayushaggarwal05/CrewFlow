import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import Landing from "../features/landing/Landing";
import DashboardLayout from "../components/layout/DashboardLayout";
import Dashboard from "../features/dashboard/Dashboard";
import OrganizationList from "../features/organizations/OrganizationList";
import TeamList from "../features/teams/TeamList";
import TeamDetails from "../features/teams/TeamDetails";
import ProjectList from "../features/projects/ProjectList";
import ProjectDetails from "../features/projects/ProjectDetails";
import TaskBoard from "../features/tasks/TaskBoard";
import ActivityLog from "../features/activity/ActivityLog";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes  */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="organizations" element={<OrganizationList />} />
        <Route path="organizations/:orgId/teams" element={<TeamList />} />
        <Route
          path="organizations/:orgId/teams/:teamId"
          element={<TeamDetails />}
        />

        <Route path="teams/:teamId/projects" element={<ProjectList />} />
        <Route
          path="teams/:teamId/projects/:projectId"
          element={<ProjectDetails />}
        />

        <Route path="projects/:projectId/tasks" element={<TaskBoard />} />
        <Route path="projects/:projectId/activity" element={<ActivityLog />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
