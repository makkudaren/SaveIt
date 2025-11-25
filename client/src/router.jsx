import { createBrowserRouter } from "react-router-dom";
import App from "./App";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TermsPage from "./pages/TermsPage";

import MainLayout from "./pages/MainLayout";

import DashboardPage from "./pages/DashboardPage";
import TrackersPage from "./pages/TrackersPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import StatisticsPage from "./pages/StatisticsPage";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },

  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/terms-and-conditions", element: <TermsPage /> },

  {
    element: <MainLayout />,       // SHARED NAVBAR
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/trackers", element: <TrackersPage /> },
      { path: "/statistics", element: <StatisticsPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/settings", element: <SettingsPage /> }
    ]
  }
]);