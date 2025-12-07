
import { useState, useEffect } from "react";
import { getCurrentUser, getUserProfile, getUserSavingsStatistics, getStreakBadge } from "../services/DatabaseControl";

// Import the new ToggleSwitch component
import ToggleSwitch from "../components/ToggleSwitch"; 
import SettingsIcon from "../assets/icons/settings-outline.svg?react";
import ProfileIcon from "../assets/icons/person-outline.svg?react";
import ChartIcon from "../assets/icons/pie-chart-outline.svg?react";
import BellIcon from "../assets/icons/bell-outline.svg?react";
import PeopleIcon from "../assets/icons/people-outline.svg?react";
import VolumeIcon from "../assets/icons/volume-up-outline.svg?react";
import MoonIcon from "../assets/icons/bulb-outline.svg?react";
import ColorIcon from "../assets/icons/color-palette-outline.svg?react";


// --- Sub-Components ---

// Simplified AppToggle component now wrapping the ToggleSwitch
const AppToggleWrapper = ({ label, isEnabled, onToggle, IconComponent }) => (
    <div className="flex justify-between items-center p-4 bg-[var(--green1)] rounded-xl shadow-sm">
        <h4 className="text-[var(--neutral3)] font-semibold flex items-center gap-2">
            {IconComponent && <IconComponent className="w-5 h-5 fill-current"/>} {label}
        </h4>
        {/* Using the imported ToggleSwitch component */}
        <ToggleSwitch 
            value={isEnabled} 
            onChange={onToggle}
        />
    </div>
);

// --- MAIN COMPONENT ---
function SettingsPage(){
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);
    const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(false);
    const [coOpModeEnabled, setCoOpModeEnabled] = useState(false);

    // Mock data for user info
    const clientName = "Mac Darren Louis";
    const userEmail = "macdarren@saveit.app";

    return (
        <>
            <div className="flex justify-center p-5">
                {/* Main container uses full width up to 95em, matching other pages */}
                <div className="flex flex-col w-full max-w-[95em] max-h-[55em] gap-5">
                    
                    <div className="bg-[var(--green0)] w-full p-8 rounded-4xl shadow-lg flex flex-col gap-6">
                        
                        {/* ⚙️ HEADER */}
                        <div className="flex items-center gap-3 border-b pb-4 border-[var(--green1)]">
                            <SettingsIcon className="w-1 h-10 fill-[var(--green3)]"/>
                            <h1 className="text-[var(--green3)]">
                                Application Settings
                            </h1>
                            <h5 className="text-[var(--neutral2)]">
                                (In Development)
                            </h5>
                        </div>
                        
                        {/* Settings Panels - Split into 2 columns on large screens */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* LEFT COLUMN: Account Profile & Tracker Management */}
                            <div className="flex flex-col gap-6">
                                
                                {/* 👤 ACCOUNT PANEL */}
                                <div>
                                    <h3 className="text-[var(--green3)] border-b border-[var(--green2)] pb-2 mb-3 flex items-center gap-2">
                                        <ProfileIcon className="w-8 h-8 fill-current"/>
                                        Account Details
                                    </h3>
                                    <div className="flex flex-col gap-3 p-4 bg-[var(--green1)] rounded-xl shadow-md">
                                        <p className="text-[var(--neutral3)]">User Name: <span className="font-semibold text-[var(--green3)]">{clientName}</span></p>
                                        <p className="text-[var(--neutral3)]">Primary Email: <span className="font-semibold text-[var(--green3)]">{userEmail}</span></p>
                                        <button className="!h-10 w-auto btn-3D bg-[var(--red3)] text-white mt-2">
                                            Change Password
                                        </button>
                                    </div>
                                </div>

                                {/* 📈 TRACKER MANAGEMENT */}
                                <div>
                                    <h3 className="text-[var(--green3)] border-b border-[var(--green2)] pb-2 mb-3 flex items-center gap-2">
                                        <ChartIcon className="w-8 h-8 fill-current"/>
                                        Tracker Management
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        <AppToggleWrapper 
                                            label="Streak Reminder Notifications" 
                                            isEnabled={notificationsEnabled} 
                                            onToggle={setNotificationsEnabled}
                                            IconComponent={BellIcon}
                                        />
                                        <AppToggleWrapper 
                                            label="Enable Shared Trackers (Co-Op)" 
                                            isEnabled={coOpModeEnabled} 
                                            onToggle={setCoOpModeEnabled}
                                            IconComponent={PeopleIcon}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Appearance & Other Controls */}
                            <div className="flex flex-col gap-6">
                                
                                {/* 🎨 APPEARANCE SETTINGS */}
                                <div>
                                    <h3 className="text-[var(--green3)] border-b border-[var(--green2)] pb-2 mb-3 flex items-center gap-2">
                                        <ColorIcon className="w-8 h-8 fill-current"/>
                                        Appearance
                                    </h3>
                                    <div className="flex flex-col gap-3">
                                        <AppToggleWrapper 
                                            label="Dark Mode"
                                            isEnabled={darkModeEnabled} 
                                            onToggle={setDarkModeEnabled}
                                            IconComponent={MoonIcon}
                                        />
                                        <AppToggleWrapper 
                                            label="Interface Sound Effects" 
                                            isEnabled={soundEffectsEnabled} 
                                            onToggle={setSoundEffectsEnabled}
                                            IconComponent={VolumeIcon}
                                        />
                                        <button className="!h-10 w-auto btn-3D bg-[var(--green3)] text-white !pt-0">
                                            Change Theme Color
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default SettingsPage