// DashboardPage.jsx
// -----------------------------------------------------------------------------
// PRIMARY ROLE
// The Dashboard is the authenticated user’s main hub. It provides:
//    • Personalized greeting using profile data
//    • Streak statistics overview (today, current, all-time)
//    • Scrollable tracker preview carousel
//    • Placeholder sections for future analytics + transaction tables
//
// DATA SOURCES (via DatabaseControl service):
//    - getCurrentUser()        → ensures valid session
//    - getUserProfile()        → username, user metadata
//    - getUserTrackers()       → list of trackers created by the user
//    - getUserStreakStats()    → global streak progress for the user
//
// REFETCH LOGIC
// The Dashboard re-fetches data automatically whenever trackers are updated
// (edit/delete) by using a "dashboardUpdateKey" that increments on changes.
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import TrackerCard from "../components/TrackerCard";
import LoadingScreen from "../components/LoadingMode";
import StreakBadge from "../assets/badges/streakBadge5.svg?react";

import { 
    getCurrentUser, 
    getUserProfile, 
    getUserTrackers, 
    getUserStreakStats,
    getTodayStreakStatus 
} from "../services/DatabaseControl";

function DashboardPage() {

    // -------------------------------------------------------------------------
    // STATE MANAGEMENT
    // -------------------------------------------------------------------------
    const [profile, setProfile] = useState(null);      // Current user profile
    const [trackers, setTrackers] = useState([]);      // All trackers owned by the user
    const [streak, setStreak] = useState(null);        // Streak statistics
    const [loading, setLoading] = useState(true);       // Global loading indicator
    
    // Incrementing this key forces a data refresh
    const [dashboardUpdateKey, setDashboardUpdateKey] = useState(0);
    const [trackerStreakStatuses, setTrackerStreakStatuses] = useState({});

    // -------------------------------------------------------------------------
    // INITIAL + REFRESH DATA FETCH
    // Runs on mount and whenever dashboardUpdateKey changes.
    // -------------------------------------------------------------------------
    useEffect(() => {
        async function loadDashboard() {
            setLoading(true);

            // 1. Validate auth state
            const { user, error: userError } = await getCurrentUser();
            if (userError || !user) {
                setLoading(false);
                return; // You may redirect to login here in the future
            }

            const userId = user.id;

            // 2. Fetch all required dashboard data concurrently
            const [profileResult, trackersResult, streakResult] = await Promise.all([
                getUserProfile(userId),
                getUserTrackers(userId),
                getUserStreakStats(userId)
            ]);

            setProfile(profileResult.data);
            setTrackers(trackersResult.data || []);
            setStreak(streakResult.data);
            setLoading(false);

            // Fetch streak statuses for all trackers with streak enabled
            if (trackersResult.data.length > 0) {
                trackersResult.data.forEach(tracker => {
                    if (tracker.streak_enabled) {
                        fetchStreakStatus(tracker.id);
                    }
                });
            }
        }

        loadDashboard();
    }, [dashboardUpdateKey]);

    // -----------------------------------------------------------------------------
    // Function to fetch and update streak status for a specific tracker
    // -----------------------------------------------------------------------------
    const fetchStreakStatus = async (trackerId) => {
        const result = await getTodayStreakStatus(trackerId);
        if (result.success) {
            setTrackerStreakStatuses(prev => ({
                ...prev,
                [trackerId]: result.isActive
            }));
        }
    };

    // -------------------------------------------------------------------------
    // TRACKER UPDATE HANDLER
    // Triggered when TrackerCard reports an update or delete event.
    // Causes full dashboard refresh.
    // -------------------------------------------------------------------------
    const handleTrackerUpdate = async (changeInfo) => {
        console.log("Dashboard tracker update:", changeInfo);
        
        // Refresh streak status after transaction
        if (changeInfo.action === "update" && changeInfo.trackerId) {
            const tracker = trackers.find(t => t.id === changeInfo.trackerId);
            if (tracker?.streak_enabled) {
                await fetchStreakStatus(changeInfo.trackerId);
            }
        }
        
        setDashboardUpdateKey(prev => prev + 1);
    };

    // -------------------------------------------------------------------------
    // TEMPORARY STATIC VALUES
    // These placeholders will eventually be replaced with streakResult.data.
    // -------------------------------------------------------------------------
    const fstreakTotalSavedToday = 200;
    const fstreakTrackerName = "LandBank";
    const fstreakTrackerSaved = 530;
    const fstreakDays = 5;
    const fstreakBadge = "Gold";
    const fstreakHighestDays = 450;
    const fstreakHighestBadge = "Diamond";
    const fstreakHighestSaved = 1050;

    // -------------------------------------------------------------------------
    // GLOBAL LOADING STATE
    // -------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <LoadingScreen text={"Loading Dashboard..."}/>
            </div>
        );
    }

    // -------------------------------------------------------------------------
    // MAIN RENDER
    // -------------------------------------------------------------------------
    return (
        <>
            <div className="flex justify-center p-5 h-full">
                <div className="flex flex-col w-full max-w-[95em] max-h-[55em]">

                    {/* USER GREETING -------------------------------------------------- */}
                    <h1>Hello, {profile?.username}</h1>

                    <div className="flex flex-row h-full gap-5">

                        {/* -----------------------------------------------------------------
                           LEFT PANEL — STREAK OVERVIEW WIDGET
                           Displays streak progress, today’s activity,
                           current streak details, and all-time achievements.
                           ----------------------------------------------------------------- */}
                        <div className="flex flex-col items-center min-w-120 shadow-lg bg-[var(--green0)] rounded-4xl p-5 gap-2">

                            {/* MAIN STREAK BADGE GRAPHIC */}
                            <div className="flex bg-[var(--green0)] justify-center relative z-0 fx-hover-scale mx-1">
                                
                                <div className="streak-badge">
                                    <div className="flex flex-col justify-center items-center absolute inset-0 z-2 pointer-events-none">
                                        <h1 className="translate-y-3 text-neutral-50 [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">
                                            {fstreakDays}
                                        </h1>
                                        <h2 className="-translate-y-3 text-neutral-50 [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">
                                            days
                                        </h2>
                                    </div>
                                <StreakBadge className="w-50 h-auto scale-145 z-1" />

                                </div>
                            </div>

                            <h5>Streak Information</h5>

                            {/* STREAK DETAIL GRID */}
                            <div className="flex flex-col w-full h-full gap-3">

                                {/* ACTIVATED / NON-ACTIVATED TRACKERS (placeholder) */}
                                <div className="flex flex-row gap-3">
                                    <div className="flex flex-col items-center p-3 gap-2 bg-[var(--green1)] w-full h-30 rounded-3xl">
                                        <h5>Activated</h5>
                                        <h2 className="text-[var(--green3)] scale-125">2</h2>
                                    </div>
                                    <div className="flex flex-col items-center p-3 gap-2 bg-[var(--green1)] w-full h-30 rounded-3xl">
                                        <h5>Unactivated</h5>
                                        <h2 className="text-[var(--neutral2)] scale-125">4</h2>
                                    </div>
                                </div>

                                {/* TODAY / CURRENT / ALL-TIME SECTIONS */}
                                <div className="flex flex-col items-center p-3 bg-[var(--green1)] w-full h-full rounded-3xl gap-1">

                                    {/* TODAY */}
                                    <h4 className="text-[var(--neutral3)]">----- Today -----</h4>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Total Saved Today:</h5>
                                        <h5>${fstreakTotalSavedToday}</h5>
                                    </div>

                                    {/* CURRENT STREAK */}
                                    <h4 className="text-[var(--neutral3)]">----- Current -----</h4>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Tracker Name:</h5>
                                        <h5>{fstreakTrackerName}</h5>
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Tracker Saved:</h5>
                                        <h5>${fstreakTrackerSaved}</h5>
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Streak Days:</h5>
                                        <h5>{fstreakDays} days</h5>
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Streak Badge:</h5>
                                        <h5>{fstreakBadge}</h5>
                                    </div>

                                    {/* ALL-TIME */}
                                    <h4 className="text-[var(--neutral3)]">----- All Time -----</h4>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Highest Saved</h5>
                                        <h5>${fstreakHighestSaved}</h5>
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Highest Streak</h5>
                                        <h5>{fstreakHighestDays} days</h5>
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Highest Badge</h5>
                                        <h5>{fstreakHighestBadge}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* -----------------------------------------------------------------
                           RIGHT PANEL — TRACKERS + STATISTICS + TRANSACTIONS
                           ----------------------------------------------------------------- */}
                        <div className="w-full flex flex-col gap-0">

                            {/* TRACKER PREVIEW CAROUSEL */}
                            <div className="flex flex-row gap-x-5 w-255 min-h-56 justify-start overflow-x-auto scrollbar-hover px-2 snap-x snap-mandatory">
                                <div className="flex flex-row gap-3">
                                    {trackers.length > 0 ? (
                                        trackers.map(t => (
                                            <TrackerCard
                                                key={t.id}
                                                tracker={t}
                                                isDashboardContext={true}
                                                onTrackerUpdated={handleTrackerUpdate}
                                                isTodayStreakActive={trackerStreakStatuses[t.id] || false}
                                            />
                                        ))
                                    ) : (
                                        <div className="p-5 text-lg text-[var(--neutral3)]">
                                            You haven't created any trackers yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* FUTURE STATISTICS WIDGET */}
                            <div className="w-full h-60 flex mb-5 bg-[var(--green0)] rounded-4xl shadow-lg"></div>

                            {/* FUTURE TRANSACTION HISTORY MINI TABLE */}
                            <div className="w-full h-full flex bg-[var(--green0)] rounded-4xl shadow-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DashboardPage;
