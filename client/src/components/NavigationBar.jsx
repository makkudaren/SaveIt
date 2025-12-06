// NavigationBar.jsx
// -----------------------------------------------------------------------------
// PRIMARY PURPOSE:
// Provides the main sidebar navigation for the SaveIt application.
// Handles route-based active highlighting, navigation actions, and logout
// confirmation using a shared modal component.
// NOW INCLUDES: Collapsible sidebar functionality with smooth animations
// -----------------------------------------------------------------------------
//
// CORE RESPONSIBILITIES:
// - Render sidebar navigation with visual active-state indication
// - Toggle between expanded and collapsed states with smooth transitions
// - Open a logout confirmation modal before signing out
// - Perform Supabase logout via backend service logic
//
// This file follows maintainable documentation standards for readability and
// future extension (e.g., new routes, redesigned layout, role-based rules).
// -----------------------------------------------------------------------------

import { useState } from "react";
import SaveItLogo from "../assets/brand/SaveIt-Logo.png";
import HomeIcon from "../assets/icons/home-outline.svg?react";
import ProfileIcon from "../assets/icons/person-outline.svg?react";
import TrackerIcon from "../assets/icons/credit-card-outline.svg?react";
import StatisticsIcon from "../assets/icons/trending-up-outline.svg?react";
import SettingsIcon from "../assets/icons/settings-2-outline.svg?react";
import LogOutIcon from "../assets/icons/log-out-outline.svg?react";
import LayoutIcon from "../assets/icons/menu-outline.svg?react";

import Modal from "./Modal.jsx";
import { logoutUser } from "../services/DatabaseControl.js";
import { Link, useNavigate, useLocation } from "react-router-dom";

// MODIFIED: Accepts isCollapsed and setIsCollapsed from MainLayout
function NavigationBar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Controls visibility of the logout confirmation modal
  const [showLogout, setShowLogout] = useState(false);
  
  // REMOVED: isCollapsed state is now in MainLayout and passed as a prop

  // ---------------------------------------------------------------------------
  // confirmLogout()
  // Handles the logout process by calling the separated backend service.
  // Redirects the user to the login page after a successful sign-out.
  // ---------------------------------------------------------------------------
  const confirmLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Predefined active styling rules for selected menu items
  const activeClass = "bg-[var(--green3)] text-white";
  const activeStyle = { backgroundColor: "var(--green3)", color: "white" };

  // ---------------------------------------------------------------------------
  // isActive(path)
  // Detects if the current route matches or begins with the provided path.
  // Supports sub-routes (e.g., /trackers/123 => active for /trackers).
  // ---------------------------------------------------------------------------
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // ---------------------------------------------------------------------------
  // Button Component
  //
  // Helper component for rendering sidebar navigation buttons with:
  // - Consistent structure and spacing
  // - Automatic active highlighting based on routing
  // - Centralized icon styling logic
  // - Support for collapsed state (icon only)
  // - Smooth transitions for all state changes
  // ---------------------------------------------------------------------------
  const Button = ({ to, Icon, children }) => {
    const active = isActive(to);

    // COMBINED CLASSES FOR ANIMATION AND STRUCTURE
    const classes = `nav-button btn-3D flex items-center transition-all duration-300 ease-in-out ${
      isCollapsed ? 'justify-center w-full !p-5 !h-20' : 'gap-3 w-full !h-20'
    } p-0 rounded-xl ${
      active ? activeClass : ""
    }`;
    
    const style = active ? activeStyle : undefined;

    const iconProps = {
      className: `w-7 h-7 ${active ? "fill-white" : "fill-[var(--neutral2)]"} transition-all duration-300`,
    };

    return (
      <button
        className={classes}
        style={style}
        onClick={() => navigate(to)}
        type="button"
        title={isCollapsed ? children : undefined}
      >
        <Icon {...iconProps} />
        {/* ANIMATION FOR TEXT */}
        <span
          className={`overflow-hidden transition-[opacity,max-width] duration-300 ${
            isCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[200px]'
          }`}
        >
          {children}
        </span>
      </button>
    );
  };

  return (
    <>
          
      {/* -----------------------------------------------------------------------
         MAIN SIDEBAR (Desktop View)
         -----------------------------------------------------------------------
         Uses 'fixed' and the width classes from the second component, but keeps 
         the animation from the first.
         --------------------------------------------------------------------- */}
      <div className={`hidden fixed top-0 left-0 z-20 xl:flex min-h-screen flex-col items-center justify-between bg-[var(--green1)] p-3 border-[var(--neutral1)] border-2 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-24' : 'w-72' // Using w-24 and w-72 from second version
      }`}>

        <div className={`flex flex-col items-center w-full gap-6`}>
          <div className={`w-full flex transition-all ${isCollapsed ? "justify-between" : "justify-start"}`}>
            {/* TOGGLE BUTTON */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex justify-center items-center w-20 p-5 !bg-transparent hover:!bg-[var(--neutral0)] rounded-lg transition-all duration-300 ease-in-out"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {/* SMOOTH ROTATION */}
              <LayoutIcon className="w-7 h-7 fill-[var(--green3)] transition-transform duration-300" />
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-3 ">
            <img 
                    src={SaveItLogo} 
                    alt="SaveIt Logo" 
                    className="w-12 h-10 mb-0 transition-all duration-300"
                />
            
            <h6 className={`text-[var(--green3)] select-none transition-all duration-100 h-20 ${isCollapsed ? 'scale-x-0' : 'scale-x-100'}`}>SaveIt</h6>
            
          </div>
        </div>


        {/* NAVIGATION BUTTON GROUP */}
        <div className="flex flex-col items-center gap-3 w-full">
          <Button to="/dashboard" Icon={HomeIcon}>Dashboard</Button>
          <Button to="/trackers" Icon={TrackerIcon}>Trackers</Button>
          <Button to="/statistics" Icon={StatisticsIcon}>Statistics</Button>
          <Button to="/profile" Icon={ProfileIcon}>Profile</Button>
          <Button to="/settings" Icon={SettingsIcon}>Settings</Button>
        </div>

        {/* LOGOUT BUTTON */}
        <div className={`flex flex-row ${
          isCollapsed ? 'justify-center' : 'justify-start pl-5'
        } items-center w-full pb-3 transition-all duration-300`}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Prevents accidental navigation
              setShowLogout(true);
            }}
            // Combined classes for smooth transition and collapse handling
            className={`!text-[var(--neutral3)] p-0 !bg-transparent hover:border-0 flex items-center ${
              isCollapsed ? 'justify-center' : 'gap-2'
            } h-auto ${
              isCollapsed ? 'w-auto' : 'w-40'
            } transition-all duration-300`}
            title={isCollapsed ? "Log Out" : undefined}
          >
            <LogOutIcon className="w-7 h-7 fill-[var(--neutral3)] transition-all duration-300" />
            {/* SMOOTH FADE OUT/IN FOR TEXT */}
            <span className={`transition-all duration-300 ${
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>
              Log Out
            </span>
          </a>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
         LOGOUT CONFIRMATION MODAL
         --------------------------------------------------------------------- */}
      <Modal
        show={showLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogout(false)}
      />
    </>
  );
}

export default NavigationBar;