// MainLayout.jsx
// -----------------------------------------------------------------------------
// PRIMARY FUNCTION:
// MainLayout serves as the **shared structural layout** for all authenticated
// sections of the application. It wraps all pages that require navigation,
// user header display, and a consistent page structure.
//
// Pages using this layout:
//    - Dashboard
//    - Trackers
//    - Statistics
//    - Profile
//    - Settings
//
// STRUCTURE PROVIDED BY THIS LAYOUT:
//    • Left Sidebar Navigation (NavigationBar)
//    • Top Header (Header)
//    • Dynamic Content Area (<Outlet />)
//
// <Outlet /> renders the child route matched by React Router, allowing multiple
// pages to share the same UI frame.
//
// ARCHITECTURE OVERVIEW:
//
//   <MainLayout>
//       <NavigationBar />   // fixed sidebar
//       <Header />          // top bar inside the content area
//       <Outlet />          // the active page (Dashboard, Trackers, etc.)
//   </MainLayout>
//
// FUTURE IMPLEMENTATION:
// - Add authentication guard wrapping MainLayout (protect all internal pages).
// - Add responsive behavior (collapsible sidebar for mobile).
// - Add global context providers (user session, theme, etc.).
// - Integrate user details into Header (profile picture, notifications).
//
// IMPORTANCE:
// This component centralizes layout rules, making the codebase more maintainable
// and enforcing consistent UI across the application.
// -----------------------------------------------------------------------------

import NavigationBar from "../components/NavigationBar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div className="flex min-w-screen min-h-screen">

        {/* LEFT SIDEBAR (Navigation Menu) */}
        <NavigationBar className="" />

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col w-full">

            {/* HEADER (User info, page title, notifications, etc.) */}
            <Header />

            {/* OUTLET → Loads child pages dynamically */}
            
              <Outlet />
            
            
        </div>

    </div>
  );
}

export default MainLayout;
