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

import { useState } from "react"; // ADDED: Need to manage the collapsed state here
import NavigationBar from "../components/NavigationBar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function MainLayout() {
  // NEW: State to control the sidebar's collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // NEW: Define Tailwind classes for the dynamic margin
  // The 'xl:ml-20' corresponds to the collapsed width of the NavigationBar (w-20)
  // The 'xl:ml-72' corresponds to a fixed-large-enough-width for the expanded NavigationBar
  // This approach is required because the NavigationBar is outside the content area.
  const contentAreaClass = isCollapsed ? 'xl:ml-20' : 'xl:ml-72';


  return (
    <div className="flex min-w-screen min-h-screen ">

        {/* LEFT SIDEBAR (Navigation Menu) 
            NEW: It's now fixed and manages its position based on the flex container
            It also receives the state and setter function. */}
        <NavigationBar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />

        {/* MAIN CONTENT AREA 
            NEW: The entire content area now has a left margin that shifts smoothly
            to match the width of the NavigationBar, making the <Outlet /> fill 
            the *remaining* space seamlessly. */}
        <div className={`flex flex-col w-full min-h-screen transition-all duration-300 ease-out ${contentAreaClass}`}>

            {/* HEADER (User info, page title, notifications, etc.) */}
            <Header />

            {/* OUTLET → Loads child pages dynamically */}
            
              <Outlet />
            
            
        </div>

    </div>
  );
}

export default MainLayout;