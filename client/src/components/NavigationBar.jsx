// NavigationBar.jsx
// -----------------------------------------------------------------------------
// PRIMARY PURPOSE:
// Provides the main sidebar navigation for the SaveIt application.
// Handles route-based active highlighting, navigation actions, and logout
// confirmation using a shared modal component.
// -----------------------------------------------------------------------------
//
// CORE RESPONSIBILITIES:
// - Render sidebar navigation with visual active-state indication
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

import Modal from "./Modal.jsx";
import { logoutUser } from "../services/DatabaseControl.js";
import { Link, useNavigate, useLocation } from "react-router-dom";

function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Controls visibility of the logout confirmation modal
  const [showLogout, setShowLogout] = useState(false);

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
  //
  // Props:
  // - to: navigation path
  // - Icon: SVG icon component
  // - children: button label
  //
  // Maintainability notes:
  // - Can be transferred to its own file if reused in a different layout
  // - Could be enhanced with tooltips or permission-based visibility
  // ---------------------------------------------------------------------------
  const Button = ({ to, Icon, children }) => {
    const active = isActive(to);

    const classes = `nav-button flex items-center gap-3 px-3 py-2 rounded-xl w-full ${
      active ? activeClass : ""
    }`;
    const style = active ? activeStyle : undefined;

    const iconProps = {
      className: `w-7 h-7 ${active ? "fill-white" : "fill-[var(--neutral2)]"}`,
    };

    return (
      <button
        className={classes}
        style={style}
        onClick={() => navigate(to)}
        type="button"
      >
        <Icon {...iconProps} />
        {children}
      </button>
    );
  };

  return (
    <>
      {/* -----------------------------------------------------------------------
         MAIN SIDEBAR (Desktop View)
         -----------------------------------------------------------------------
         Structure:
         - Branding section
         - Navigation categories
         - Logout trigger with modal confirmation
         --------------------------------------------------------------------- */}
      <div className="hidden xl:flex min-h-screen flex-col items-center justify-between bg-[var(--green1)] p-3 pt-10 border-[var(--neutral1)] border-2">

        {/* BRAND LOGO + APP NAME */}
        <div className="flex flex-col items-center">
          <img src={SaveItLogo} alt="SaveIt Logo" className="w-15 h-auto mb-0" />
          <h6>SaveIt</h6>
        </div>

        {/* NAVIGATION BUTTON GROUP */}
        <div className="flex flex-col items-center gap-3">
          <Button to="/dashboard" Icon={HomeIcon}>Dashboard</Button>
          <Button to="/trackers" Icon={TrackerIcon}>Trackers</Button>
          <Button to="/statistics" Icon={StatisticsIcon}>Statistics</Button>
          <Button to="/profile" Icon={ProfileIcon}>Profile</Button>
          <Button to="/settings" Icon={SettingsIcon}>Settings</Button>
        </div>

        {/* ---------------------------------------------------------------------
           LOGOUT BUTTON
           Opens a confirmation modal rather than signing out immediately.
           ------------------------------------------------------------------- */}
        <div className="flex flex-row justify-start items-center w-full pl-5 pb-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Prevents accidental navigation
              setShowLogout(true);
            }}
            className="!text-[var(--neutral3)] p-0 !bg-transparent hover:border-0 flex items-center gap-2 h-auto w-40"
          >
            <LogOutIcon className="w-7 h-7 fill-[var(--neutral3)]" />
            Log Out
          </a>
        </div>
      </div>

      {/* -----------------------------------------------------------------------
         LOGOUT CONFIRMATION MODAL
         Uses a shared modal component for consistent UI/UX.
         Triggered when showLogout === true.
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
