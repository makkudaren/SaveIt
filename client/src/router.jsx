// router.jsx
// -----------------------------------------------------------------------------
// PRIMARY FUNCTION:
// Defines all application routes using React Router v6+ with createBrowserRouter.
// This central routing configuration controls:
//   - Public access pages (login, register, terms)
//   - Protected app pages wrapped by MainLayout (navbar + structure)
//   - App-level navigation between Dashboard, Trackers, Profile, etc.
//
// ARCHITECTURE OVERVIEW:
//
//   Public Routes:
//      "/"                → App (landing or redirect logic)
//      "/login"           → LoginPage
//      "/register"        → RegisterPage
//      "/terms..."        → TermsPage
//
//   Protected Layout Group:
//      <MainLayout>
//          "/dashboard"
//          "/trackers"
//          "/statistics"
//          "/profile"
//          "/settings"
//      </MainLayout>
//
// The MainLayout component provides consistent UI: sidebar navigation,
// user header, and shared styles for all internal app pages.
//
// FUTURE IMPLEMENTATION:
// - Add route protection (authentication guard) using Supabase auth session.
// - Add redirect rules (e.g., redirect "/" to "/login" or "/dashboard").
// - Implement error pages (404, 500).
// - Add child routes for tracker-specific pages (e.g., /trackers/:id).
//
// This file serves as the backbone of navigation for the whole project.
// -----------------------------------------------------------------------------


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
  // ---------------------------------------------------------------------------
  // ROOT ROUTE
  // The base path loads <App />, which can act as:
  //   - A landing page
  //   - A redirector based on login session (future enhancement)
  // ---------------------------------------------------------------------------
  { path: "/", element: <App /> },

  // ---------------------------------------------------------------------------
  // PUBLIC AUTH ROUTES
  // These do NOT require the user to be logged in.
  // ---------------------------------------------------------------------------
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/terms-and-conditions", element: <TermsPage /> },
  
  // ---------------------------------------------------------------------------
  // PROTECTED ROUTES GROUP (Shared Layout)
  // MainLayout provides the navigation sidebar + consistent structure.
  // All children below inherit the layout.
  //
  // FUTURE: Wrap this with an authentication guard once Supabase session
  // checking is implemented.
  // ---------------------------------------------------------------------------
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