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

  const [showLogout, setShowLogout] = useState(false);

  const confirmLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const activeClass = "bg-[var(--green3)] text-white";
  const activeStyle = { backgroundColor: "var(--green3)", color: "white" };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

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
      {/* MAIN NAVIGATION BAR */}
      <div className="hidden xl:flex min-h-screen flex-col items-center justify-between bg-[var(--green1)] p-3 pt-10 border-[var(--neutral1)] border-2">

        <div className="flex flex-col items-center">
          <img src={SaveItLogo} alt="SaveIt Logo" className="w-15 h-auto mb-0" />
          <h6>SaveIt</h6>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button to="/dashboard" Icon={HomeIcon}>Dashboard</Button>
          <Button to="/trackers" Icon={TrackerIcon}>Trackers</Button>
          <Button to="/statistics" Icon={StatisticsIcon}>Statistics</Button>
          <Button to="/profile" Icon={ProfileIcon}>Profile</Button>
          <Button to="/settings" Icon={SettingsIcon}>Settings</Button>
        </div>

        {/* LOGOUT BUTTON opens modal */}
        <div className="flex flex-row justify-start items-center w-full pl-5 pb-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault(); // prevent default navigation
              setShowLogout(true);
            }}
            className="!text-[var(--neutral3)] p-0 !bg-transparent hover:border-0 flex items-center gap-2 h-auto w-40"
          >
            <LogOutIcon className="w-7 h-7 fill-[var(--neutral3)]" />
            Log Out
          </a>
        </div>
      </div>

      {/* LOGOUT MODAL */}
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
