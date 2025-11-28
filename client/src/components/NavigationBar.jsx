// NavigationBar.jsx
// -----------------------------------------------------------------------------
// Main sidebar navigation used across the SaveIt application.
// Provides quick access to dashboard, trackers, statistics, profile,
// settings, and logout functionality.
//
// Core responsibilities:
// - Render navigation buttons with active route highlighting
// - Show logout confirmation modal
// - Handle Supabase sign-out logic
//
// This file is documented following maintainability guidelines to support
// future developers who extend the navigation, redesign the sidebar, or
// modify logout logic.
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
import supabase from "../supabase-client";
import { Link, useNavigate, useLocation } from "react-router-dom";

function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Controls visibility of the logout confirmation modal
  const [showLogout, setShowLogout] = useState(false);

  // ---------------------------------------------------------------------------
  // confirmLogout()
  // Logs the user out of Supabase and returns them to the login screen.
  //
  // Future maintainers:
  // - You may add cleanup logic (localStorage clearing, analytics logging, etc.)
  //   before navigation.
  // ---------------------------------------------------------------------------
  const confirmLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Styling classes for active navigation buttons
  const activeClass = "bg-[var(--green3)] text-white";
  const activeStyle = { backgroundColor: "var(--green3)", color: "white" };

  // ---------------------------------------------------------------------------
  // isActive(path)
  // Determines if the current route matches or begins with the provided path.
  // Allows nested paths (e.g., /trackers/123) to highlight correctly.
  // ---------------------------------------------------------------------------
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // ---------------------------------------------------------------------------
  // Button Component
  //
  // Small helper component that:
  // - Renders consistent navigation buttons
  // - Applies active styles based on routing
  // - Prevents repetitive markup in the main JSX
  //
  // Props:
  // - to: Route path to navigate to
  // - Icon: Icon component to render
  // - children: Label to display
  //
  // Future maintainers:
  // - Can be extracted into its own file if reused elsewhere
  // - Could support tooltips or access roles in the future
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
         MAIN NAVIGATION SIDEBAR (Desktop View)
         -----------------------------------------------------------------------
         Contains:
         - Branding section
         - Navigation links
         - Logout button that opens a modal
         --------------------------------------------------------------------- */}
      <div className="hidden xl:flex min-h-screen flex-col items-center justify-between bg-[var(--green1)] p-3 pt-10 border-[var(--neutral1)] border-2">

        {/* BRANDING AREA */}
        <div className="flex flex-col items-center">
          <img src={SaveItLogo} alt="SaveIt Logo" className="w-15 h-auto mb-0" />
          <h6>SaveIt</h6>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="flex flex-col items-center gap-3">
          <Button to="/dashboard" Icon={HomeIcon}>Dashboard</Button>
          <Button to="/trackers" Icon={TrackerIcon}>Trackers</Button>
          <Button to="/statistics" Icon={StatisticsIcon}>Statistics</Button>
          <Button to="/profile" Icon={ProfileIcon}>Profile</Button>
          <Button to="/settings" Icon={SettingsIcon}>Settings</Button>
        </div>

        {/* ---------------------------------------------------------------------
           LOGOUT BUTTON
           Opens the modal for a confirmation before signing out.
           ------------------------------------------------------------------- */}
        <div className="flex flex-row justify-start items-center w-full pl-5 pb-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // Prevents accidental navigation due to <a> tag
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
         Uses shared Modal component for consistent UI/UX.
         Triggered when `showLogout` becomes true.
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
