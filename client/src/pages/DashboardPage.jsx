// DashboardPage.jsx
// -----------------------------------------------------------------------------
// PRIMARY ROLE
// The Dashboard is the authenticated user's main hub. It provides:
//    • Personalized greeting using profile data
//    • Streak statistics overview (today, current, all-time)
//    • Scrollable tracker preview carousel
//    • Recent activity across all trackers
//    • Placeholder sections for future analytics
//
// DATA SOURCES (via DatabaseControl service):
//    - getCurrentUser()              → ensures valid session
//    - getUserProfile()              → username, user metadata
//    - getUserTrackers()             → list of trackers created by the user
//    - getUserStreakStats()          → global streak progress for the user
//    - getUserRecentTransactions()   → recent transactions across all trackers
// -----------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrackerCard from "../components/TrackerCard";
import LoadingScreen from "../components/LoadingMode";
import StreakBadge1 from "../assets/badges/streakBadge1.svg?react";
import StreakBadge2 from "../assets/badges/streakBadge2.svg?react";
import StreakBadge3 from "../assets/badges/streakBadge3.svg?react";
import StreakBadge4 from "../assets/badges/streakBadge4.svg?react";
import StreakBadge5 from "../assets/badges/streakBadge5.svg?react";
import StreakBadge6 from "../assets/badges/streakBadge6.svg?react";
import StreakBadge7 from "../assets/badges/streakBadge7.svg?react";
import StreakBadge8 from "../assets/badges/streakBadge8.svg?react";
import ExpandIcon from "../assets/icons/expand-outline.svg?react";

import { 
    getCurrentUser, 
    getUserProfile, 
    getUserTrackers, 
    getUserStreakStats,
    getTodayStreakStatus,
    getUserRecentTransactions,
    getUserSavingsStatistics,
    getStreakBadge
} from "../services/DatabaseControl";

// -------------------------------------------------------------------------
// HELPER FUNCTION: Get the correct Badge SVG component based on days
// -------------------------------------------------------------------------
const getBadgeComponent = (days) => {
    if (days >= 500) return StreakBadge8; // Diamond Legend
    if (days >= 250) return StreakBadge7; // Sapphire Master
    if (days >= 200) return StreakBadge6; // Ruby Champion
    if (days >= 150) return StreakBadge5; // Emerald Keeper
    if (days >= 100) return StreakBadge4; // Platinum Saver
    if (days >= 50) return StreakBadge3;  // Gold Saver
    if (days >= 10) return StreakBadge2;  // Silver Saver
    if (days >= 3) return StreakBadge1;   // Bronze Saver
    return StreakBadge1; // Default to Novice/Bronze badge style
};

// -------------------------------------------------------------------------
// NEW SKELETON COMPONENTS (1:1 SIZING)
// -------------------------------------------------------------------------

// Matches the TrackerCard structure (w-80 h-50)
function SkeletonTrackerCard() {
    return(
        <div className="pl-2 snap-start transition-all animate-pulse">
            <div
                className={`mb-5 relative flex flex-col justify-between min-w-80 min-h-50 max-w-80 max-h-50 w-80 h-50 bg-[var(--neutral0)] rounded-4xl shadow-lg p-5`}
            >
                {/* POP-UP MENU BUTTON SKELETON */}
                <div className="absolute top-5 right-5">
                    <div className="!w-9 !h-9 !rounded-full !bg-[var(--neutral1)] flex items-center justify-center shadow">
                        <div className="w-5 h-5 bg-[var(--neutral1)] rounded-full"></div>
                    </div>
                </div>
                                
                <div className="pt-2"> 
                    {/* Bank Name (h5) */}
                    <div className="h-5 w-32 bg-[var(--neutral1)] rounded"></div>
                </div>

                {/* Balance (h2) */}
                <div className="mt-3">
                    <div className="h-8 w-48 bg-[var(--neutral1)] rounded"></div>
                </div>

                {/* STREAK DISPLAY SKELETON */}
                <div className={`flex items-center gap-2 mt-auto`}>
                    {/* Streak Icon */}
                    <div className="w-6 h-6 bg-[var(--neutral1)] rounded-full"></div>
                    {/* Streak Days text */}
                    <div className="h-5 w-20 bg-[var(--neutral1)] rounded"></div>
                </div>

                {/* GOAL PROGRESS BAR SKELETON */}
                <div className={`flex flex-col justify-end w-full pt-4`}>
                                    
                    {/* Progress Percentage (h5) */}
                    <div className="flex justify-end w-full mb-1">
                        <div className="h-4 w-8 bg-[var(--neutral1)] rounded"></div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-[var(--neutral1)] rounded-full">
                        <div
                            className="h-full bg-[var(--neutral1)] rounded-full"
                            style={{ width: `60%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Matches the StatItem structure
function SkeletonStatItem() {
    return (
        <div className="flex flex-col p-4 bg-[var(--green1)] rounded-xl shadow-md min-h-24 justify-center animate-pulse">
            {/* Title Placeholder (h5 text-xs) */}
            <div className="h-4 w-3/5 bg-[var(--neutral1)] rounded mb-1"></div>
            {/* Value Placeholder (h3 text-2xl) */}
            <div className="h-6 w-1/2 min-w-16 bg-[var(--neutral1)] rounded-lg"></div>
        </div>
    );
}

// Matches the nested status boxes (Active/Inactive)
function SkeletonStatusBox() {
    return (
        <div className="flex flex-col justify-center items-center p-3 gap-2 bg-[var(--green1)] w-full h-25 rounded-3xl shadow-md p-5 animate-pulse">
            {/* Title Placeholder (h5) */}
            <div className="h-4 w-3/4 bg-[var(--neutral1)] rounded"></div>
            {/* Value Placeholder (h2 scale-125) */}
            <div className="h-6 w-1/4 bg-[var(--neutral1)] rounded-lg"></div>
        </div>
    );
}

// Matches the detail sections (Today's Progress, Current Streak, All-Time)
function SkeletonDetailSection() {
    return (
        <div className="flex flex-col items-center bg-[var(--green1)] w-[99%] h-auto rounded-3xl shadow-md p-2 animate-pulse">
            {/* Header Placeholder (h4) */}
            <div className="h-5 w-1/2 bg-[var(--neutral1)] rounded-lg mb-3 mt-1"></div>
            
            {/* Row 1 */}
            <div className="flex flex-row justify-between w-full px-5 py-0.5">
                <div className="h-4 w-1/4 bg-[var(--neutral1)] rounded"></div>
                <div className="h-4 w-1/4 bg-[var(--neutral1)] rounded"></div>
            </div>

            {/* Row 2 (if needed) */}
            <div className="flex flex-row justify-between w-full px-5 py-0.5">
                <div className="h-4 w-1/3 bg-[var(--neutral1)] rounded"></div>
                <div className="h-4 w-1/3 bg-[var(--neutral1)] rounded"></div>
            </div>

            {/* Row 3 (if needed) */}
            <div className="flex flex-row justify-between w-full px-5 py-0.5 mb-1">
                <div className="h-4 w-2/5 bg-[var(--neutral1)] rounded"></div>
                <div className="h-4 w-2/5 bg-[var(--neutral1)] rounded"></div>
            </div>
        </div>
    )
}

function SkeletonDashboardPage() {
    return (
        <div className="flex justify-center p-5 h-full ">
            <div className="flex flex-col w-full max-w-[95em] max-h-[50em]">

                {/* USER GREETING SKELETON (h1) */}
                <div className="min-h-10 w-64 bg-[var(--neutral1)] rounded-lg mb-4 animate-pulse"></div>

                <div className="flex flex-row h-[95%] gap-5">

                    {/* LEFT PANEL – STREAK OVERVIEW SKELETON (min-w-120) */}
                    <div className="flex flex-col items-center min-w-120 h-full shadow-lg bg-[var(--green0)] rounded-4xl p-5 gap-2 animate-pulse">

                        {/* MAIN STREAK BADGE GRAPHIC SKELETON */}
                        <div className="flex bg-[var(--green0)] justify-center relative z-0 mx-1 w-50 h-50">
                            {/* Placeholder for the large badge image */}
                            <div className="w-40 h-40 bg-[var(--neutral1)] rounded-full scale-100 mt-5"></div>
                        </div>

                        {/* Sub-header Placeholder (h5) */}
                        <div className="h-4 w-2/5 bg-[var(--neutral1)] rounded my-2"></div>

                        {/* STREAK DETAIL GRID */}
                        <div className="flex flex-col w-full h-full gap-3">
                            {/* ACTIVATED / NON-ACTIVATED TRACKERS */}
                            <div className="flex flex-row gap-3 ">
                                <SkeletonStatusBox />
                                <SkeletonStatusBox />
                            </div>

                            {/* TODAY / CURRENT / ALL-TIME SECTIONS */}
                            <SkeletonDetailSection />
                            <SkeletonDetailSection />
                            <SkeletonDetailSection />
                        </div>
                    </div>

                    {/* RIGHT PANEL – TRACKERS + RECENT ACTIVITY + STATISTICS */}
                    <div className="w-full flex flex-col gap-0">

                        {/* TRACKER PREVIEW CAROUSEL SKELETON */}
                        <div className="flex flex-row gap-x-5 w-255 min-h-56 justify-start overflow-x-hidden px-2 snap-x snap-mandatory mb-3">
                            <div className="flex flex-row gap-3">
                                <SkeletonTrackerCard />
                                <SkeletonTrackerCard />
                                <SkeletonTrackerCard />
                                {/* Placeholder for the "Add Tracker" card */}
                                <div className="pl-2 snap-start transition-all">
                                    <div
                                        className={`mb-5 relative flex flex-col justify-center items-center 
                                            min-w-80 min-h-50 max-w-80 max-h-50 w-80 h-50 bg-[var(--green0)] 
                                            rounded-4xl shadow-lg p-0`}
                                    >
                                        <h1 className="!leading-none text-7xl text-[var(--green3)]">+</h1>
                                        <h5 className="text-[var(--neutral3)] text-center mt-3">
                                            Add Tracker
                                        </h5>
                                        <div className="!h-10 w-auto bg-[var(--neutral1)] rounded-xl mt-3 !pt-1 !p-5"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* STATISTICS WIDGET SKELETON (INLINE IMPLEMENTATION) */}
                        <div className="w-full h-70 bg-[var(--green0)] rounded-4xl shadow-lg p-5 mb-5 animate-pulse">
                            <div className="flex flex-row justify-between items-center mb-4">
                                {/* Header Placeholder (h2) */}
                                <div className="h-6 w-40 bg-[var(--neutral1)] rounded"></div>
                                {/* Link Placeholder (a) */}
                                <div className="h-4 w-24 bg-[var(--neutral1)] rounded"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <SkeletonStatItem />
                                <SkeletonStatItem />
                                <SkeletonStatItem />
                            </div>
                        </div>


                        {/* RECENT ACTIVITY TABLE SKELETON */}
                        <div className="w-full h-full flex flex-col bg-[var(--green0)] rounded-4xl shadow-lg p-5 animate-pulse">
                            {/* Header and Expand Icon Placeholder */}
                            <div className=" flex flex-row justify-between mb-4">
                                <div className="h-5 w-48 bg-[var(--neutral1)] rounded"></div>
                                <div className="w-7 h-7 bg-[var(--neutral1)] rounded-full"></div>
                            </div>

                            {/* HEADER ROW SKELETON */}
                            <div className="flex flex-row justify-between w-[100%] h-8 ">
                                <div className="w-full flex justify-start items-center h-4 w-12 bg-[var(--neutral1)] rounded"></div>
                                <div className="w-full flex justify-start items-center h-4 w-16 bg-[var(--neutral1)] rounded"></div>
                                <div className="w-full flex justify-start items-center h-4 w-16 bg-[var(--neutral1)] rounded"></div>
                                <div className="w-full flex justify-start items-center h-4 w-20 bg-[var(--neutral1)] rounded"></div>
                                <div className="w-full flex justify-start items-center h-4 w-12 bg-[var(--neutral1)] rounded"></div>
                            </div>
                            <div className="bg-[var(--neutral1)] w-[100%] h-0.5 "></div>

                            <div className="w-full h-full overflow-hidden">
                                <div className="w-[100%] h-20 mt-2">
                                    {/* DYNAMIC TRANSACTION DATA ROWS SKELETON (5 rows) */}
                                    {[...Array(5)].map((_, index) => (
                                        <div key={index} className="flex flex-row justify-between w-[100%] h-10 items-center my-2">
                                            {/* Amount */}
                                            <div className="w-full h-4 bg-[var(--neutral1)] rounded"></div>
                                            {/* Tracker */}
                                            <div className="w-full h-4 bg-[var(--neutral1)] rounded"></div>
                                            {/* Contributor */}
                                            <div className="w-full h-4 bg-[var(--neutral1)] rounded"></div>
                                            {/* Date */}
                                            <div className="w-full h-4 bg-[var(--neutral1)] rounded"></div>
                                            {/* Status */}
                                            <div className="w-[80px] h-4 bg-[var(--neutral1)] rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function DashboardPage() {
    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // STATE MANAGEMENT
    // -------------------------------------------------------------------------
    const [profile, setProfile] = useState(null);      // Current user profile
    const [trackers, setTrackers] = useState([]);      // All trackers owned by the user
    const [streak, setStreak] = useState(null);        // Streak statistics
    const [loading, setLoading] = useState(true);       // Global loading indicator
    const [stats, setStats] = useState(null);           // User Streaks
    
    // Incrementing this key forces a data refresh
    const [dashboardUpdateKey, setDashboardUpdateKey] = useState(0);
    const [trackerStreakStatuses, setTrackerStreakStatuses] = useState({});

    // Recent Activity State
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [isRecentLoading, setIsRecentLoading] = useState(true);

    // Data
    const currentStats = stats || {}; 
    const currentStreakDays = currentStats.highest_current_streak_days || 0;
    const currentStreakBadge = getStreakBadge(currentStreakDays);
    const personalHighestBadge = getStreakBadge(currentStats.personal_highest_streak_days || 0);
    
    const CurrentBadgeComponent = getBadgeComponent(currentStreakDays);

    const hasCurrentStreak = currentStreakDays > 0;

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
                return;
            }

            const userId = user.id;

            // 2. Fetch all required dashboard data concurrently
            const [profileResult, trackersResult, streakResult, recentResult, statsResult] = await Promise.all([
                getUserProfile(userId),
                getUserTrackers(userId),
                getUserStreakStats(userId),
                getUserRecentTransactions(userId, 8), // Fetch 8 most recent transactions
                getUserSavingsStatistics(userId)
            ]);

            setProfile(profileResult.data);
            setTrackers(trackersResult.data || []);
            setStreak(streakResult.data);
            setRecentTransactions(recentResult.data || []);
            setStats(statsResult.data);
            setIsRecentLoading(false);
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
    // HELPER FUNCTIONS for Formatting
    // -------------------------------------------------------------------------
    const formatCurrency = (amount) => {
        return parseFloat(amount || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    
    const formatPercent = (amount) => `${parseFloat(amount || 0).toFixed(2)}%`;

    const formatAmount = (type, amount) => {
        const sign = type === 'deposit' ? '+' : '-';
        const colorClass = type === 'deposit' ? 'text-[var(--green3)]' : 'text-[var(--red3)]';
        return <span className={colorClass}>{sign} ${formatCurrency(amount)}</span>;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: 'numeric', 
            day: 'numeric', 
            year: '2-digit'
        }) + " " + date.toLocaleTimeString("en-US", { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        }).replace(' ', '');
    };
    
    // -------------------------------------------------------------------------
    // INLINE COMPONENT: StatItem (Used by the inline widget)
    // -------------------------------------------------------------------------
    const StatItem = ({ title, value, unit = '' }) => (
        <div className="flex flex-col p-4 bg-[var(--green1)] rounded-xl shadow-md min-h-24 justify-center">
            <h5 className="text-[var(--neutral3)] text-xs mb-0.5">{title}</h5>
            <h3 className="text-[var(--green3)] text-2xl font-bold">
                {value}{unit}
            </h3>
        </div>
    );


    // -------------------------------------------------------------------------
    // RENDER: RECENT ACTIVITY CONTENT
    // -------------------------------------------------------------------------
    let recentActivityContent;
    if (isRecentLoading) {
        // Use skeleton row placeholders while recent activity loads separately
        recentActivityContent = (
            <div className="w-full h-full overflow-hidden">
                <div className="w-[100%] h-20 mt-2">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex flex-row justify-between w-[100%] h-10 items-center my-2 animate-pulse">
                            {/* Amount */}
                            <div className="w-full h-4 bg-[var(--neutral1)] rounded"></div>
                            {/* Tracker */}
                            <div className="w-full h-4 bg-[var(--neutral1)] rounded"></div>
                            {/* Contributor */}
                            <div className="w-full h-4 bg-[var(--neutral1)] rounded"></div>
                            {/* Date */}
                            <div className="w-full h-4 bg-[var(--neutral1)] rounded"></div>
                            {/* Status */}
                            <div className="w-[80px] h-4 bg-[var(--neutral1)] rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } else if (recentTransactions.length === 0) {
        recentActivityContent = (
            <div className="flex flex-col justify-center items-center h-[90%] bg-[var(--green1)] rounded-xl p-5 mt-4 shadow-sm hover:shadow-md transition-shadow ">
                <span className="text-4xl mb-2">🎉</span>
                <p className="text-[var(--neutral3)] text-center">
                    Mission Log Empty!
                </p>
                <p className="text-[var(--neutral3)] text-center">
                     You're due for a save! Start a streak or make a deposit to track your first achievement.
                </p>
            </div>
        );
    } else {
        recentActivityContent = recentTransactions.map((t) => (
            <div 
                key={t.id} 
                className="flex justify-start w-[100%] h-14 items-center gap-3 p-3 my-2 bg-[var(--green1)] rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >   
                <div className="flex justify-start w-[90%] h-14 items-center gap-3 p-3 my-2">
                    {/* AMOUNT */}
                    <div className="w-full flex justify-start items-center text-sm">
                        {formatAmount(t.type, t.amount)}
                    </div>
                    {/* TRACKER NAME */}
                    <div className="w-full flex justify-start items-center text-[var(--neutral3)] text-sm">
                        {t.trackers?.tracker_name || 'N/A'}
                    </div>
                    {/* CONTRIBUTOR */}
                    <div className="w-full flex justify-start items-center text-[var(--neutral3)] text-sm">
                        {t.profiles?.username || 'N/A'}
                    </div>
                    {/* DATE */}
                    <div className="w-full flex justify-start items-center text-[var(--neutral3)] text-xs min-w-[100px]">
                        {formatDate(t.created_at)}
                    </div>
                    {/* TYPE */}
                    <div className="w-[80px] flex justify-start items-center text-[var(--neutral3)] text-sm font-medium">
                        {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </div>
                </div>
            </div>
        ));
    }

    // -------------------------------------------------------------------------
    // GLOBAL LOADING STATE
    // -------------------------------------------------------------------------
    if (loading) {
        return <SkeletonDashboardPage />;
    }

    // -------------------------------------------------------------------------
    // RENDER: TRACKER PLACEHOLDER CARD (New component/function)
    // -------------------------------------------------------------------------
    const TrackerPlaceholderCard = () => (
        <div className="transition-all flex flex-row justify-start">
            <div
                className={`
                    mb-5 relative flex flex-col justify-center items-center 
                    min-w-80 min-h-50 max-w-80 max-h-50 w-80 h-50 bg-[var(--green0)] 
                    rounded-4xl shadow-lg p-0 hover:shadow-xl transition-shadow cursor-pointer
                `}
                onClick={() => navigate('/trackers')} // Redirects to the Trackers page
            >
                <h1 className="!leading-none text-7xl text-[var(--green3)]">+</h1>
                <h5 className="text-[var(--neutral3)] text-center mt-3">
                    Add Tracker
                </h5>
                <button 
                    className="!h-10 w-auto btn-3D bg-[var(--green3)] text-white mt-3 !pt-1 !p-5" 
                    onClick={() => navigate('/trackers')}
                >
                    Go to Trackers
                </button>
            </div>
        </div>
    );

    // -------------------------------------------------------------------------
    // MAIN RENDER
    // -------------------------------------------------------------------------
    return (
        <>
            <div className="flex justify-center p-5 pt-2 h-full ">
                <div className="flex flex-col w-full max-w-[95em] max-h-[50em]">

                    {/* USER GREETING -------------------------------------------------- */}
                    <h1>Hello, {profile?.username}</h1>

                    <div className="flex flex-row h-full gap-5">

                        {/* -----------------------------------------------------------------
                           LEFT PANEL – STREAK OVERVIEW WIDGET
                           Displays streak progress, today's activity,
                           current streak details, and all-time achievements.
                           ----------------------------------------------------------------- */}
                        <div className="flex flex-col items-center min-w-120 shadow-lg bg-[var(--green0)] rounded-4xl p-5 gap-2">

                            {/* MAIN STREAK BADGE GRAPHIC */}
                            <div className="flex bg-[var(--green0)] justify-center relative z-0 fx-hover-scale mx-1">
                                {hasCurrentStreak ? (
                                    // STATE 1: ACTIVE STREAK
                                    <div className="streak-badge fx-hover-scale">
                                        <div className="flex flex-col justify-center items-center absolute inset-0 z-2 pointer-events-none">
                                            <h1 className="translate-y-3 text-neutral-50 [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">
                                                {currentStreakDays}
                                            </h1>
                                            <h2 className="-translate-y-3 text-neutral-50 [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">
                                                {currentStreakDays === 1 ? 'day' : 'days'}
                                            </h2>
                                        </div>
                                        {/* The Badge graphic will be based on the badge tier */}
                                        <CurrentBadgeComponent className="w-50 h-auto scale-145 z-1 " onClick={() => navigate('/statistics')} /> 
                                    </div>
                                ) : (
                                    // STATE 2: NO ACTIVE STREAK
                                    <div className="flex flex-col justify-center items-center w-50 h-50 pt-5" onClick={() => navigate('/statistics')}>
                                        <h1 className="text-9xl !scale-250 hover:!scale-270 select-none transition duration-300">🌱</h1>
                                        <h5 className="text-[var(--neutral3)] mt-6 text-center w-70">
                                            Start Saving With Streaks
                                        </h5>
                                    </div>
                                )}
                            </div>

                            <h5>Streak Information</h5>

                            {/* STREAK DETAIL GRID */}
                            <div className="flex flex-col w-full h-full gap-3">

                                {/* ACTIVATED / NON-ACTIVATED TRACKERS */}
                                <div className="flex flex-row gap-3 ">
                                    <div className="flex flex-col justify-center items-center p-3 gap-2 bg-[var(--green1)] w-full h-25 rounded-3xl shadow-md p-5">
                                        <h5 className="leading-none flex items-center gap-1">Active Streaks</h5>
                                        <h2 className="leading-none text-[var(--green3)] scale-125">{currentStats.activated_streaks_today || 0}</h2>
                                    </div>
                                    <div className="flex flex-col justify-center items-center p-3 gap-2 bg-[var(--green1)] w-full h-25 rounded-3xl shadow-md p-5">
                                        <h5 className="leading-none flex items-center gap-1">Inactive Streaks</h5>
                                        <h2 className="leading-none text-[var(--red3)] scale-125">{currentStats.unactivated_streaks_today || 0}</h2> 
                                    </div>
                                </div>

                                {/* TODAY / CURRENT / ALL-TIME SECTIONS */}
                                <div className="flex flex-col items-center bg-[var(--green1)] w-[99%] h-auto rounded-3xl shadow-md p-2">
                                    {/* TODAY */}
                                    <h4 className="text-[var(--green3)] font-semibold mb-2">🚀 Today's Progress Log</h4>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Saved Today:</h5>
                                        <h5 className="font-semibold text-[var(--green3)]">${formatCurrency(currentStats.total_saved_today)}</h5>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center bg-[var(--green1)] w-[99%] h-auto rounded-3xl shadow-md p-2">
                                    {/* CURRENT STREAK */}
                                    <h4 className="text-[var(--green3)] font-semibold mb-2">🔥 Current Streak Status</h4>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Active Tracker:</h5>
                                        <h5>{currentStats.highest_current_streak_tracker || 'N/A'}</h5>
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Streak Length:</h5>
                                        <h5 className="font-semibold">{currentStreakDays} {currentStreakDays === 1 ? 'day' : 'days'}</h5>
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Current Rank:</h5>
                                        <h5 className="font-semibold">{currentStreakBadge.name} {currentStreakBadge.emoji}</h5>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center bg-[var(--green1)] w-[99%] h-auto rounded-3xl shadow-md p-2">
                                    {/* ALL-TIME */}
                                    <h4 className="text-[var(--green3)] font-semibold mb-2">🏆 All-Time Best</h4>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Highest Single Save:</h5>
                                        <h5 className="font-semibold">${formatCurrency(currentStats.highest_saved_amount)}</h5>
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Record Streak:</h5>
                                        <h5 className="font-semibold">{currentStats.personal_highest_streak_days || 0} {currentStreakDays === 1 ? 'day' : 'days'}</h5>
                                    </div>
                                    <div className="text-[var(--neutral2)] flex flex-row justify-between w-full px-5">
                                        <h5>Highest Rank Achieved:</h5>
                                        <h5 className="font-semibold">{personalHighestBadge.name} {personalHighestBadge.emoji}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* -----------------------------------------------------------------
                           RIGHT PANEL – TRACKERS + RECENT ACTIVITY + STATISTICS
                           ----------------------------------------------------------------- */}
                        <div className="w-full flex flex-col gap-0">

                            {/* TRACKER PREVIEW CAROUSEL */}
                            <div className="flex flex-row gap-x-5 w-255 min-h-56 justify-start overflow-x-auto scrollbar-hover px-2 snap-x snap-mandatory">
                                <div className="flex flex-row gap-3">
                                    {trackers.length > 0 ? (
                                         <>
                                            {trackers.map(t => (
                                                <TrackerCard
                                                    key={t.id}
                                                    tracker={t}
                                                    isDashboardContext={true}
                                                    onTrackerUpdated={handleTrackerUpdate}
                                                    isTodayStreakActive={trackerStreakStatuses[t.id] || false}
                                                />
                                            ))}
                                            <TrackerPlaceholderCard />
                                        </>
                                    ) : (
                                        // EMPTY STATE: Show the placeholder card
                                        <div className="flex items-center w-full min-w-[50em] justify-start p-5">
                                            <TrackerPlaceholderCard />
                                            <p className="p-5 text-lg text-[var(--neutral3)] w-full">
                                                You haven't created any trackers yet. Click the card to visit the Trackers page and begin!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* STATISTICS WIDGET (INLINE IMPLEMENTATION) */}
                            <div className="w-full h-70 bg-[var(--green0)] rounded-4xl shadow-lg p-5 mb-5">
                                <div className="flex flex-row justify-between items-center mb-4">
                                    <h2 className="text-[var(--green3)]">📊 Savings Overview</h2>
                                    <a 
                                        href="#"
                                        onClick={() => navigate('/statistics')}
                                        className="flex flex-row items-center text-[var(--neutral3)] hover:text-[var(--green3)] transition-colors text-sm"
                                    >
                                        View All Stats 
                                        <ExpandIcon className="w-5 h-5 fill-current ml-1" />
                                    </a>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <StatItem 
                                        title="Total Saved" 
                                        value={`$${formatCurrency(currentStats.total_saved_across_all)}`} 
                                    />
                                    <StatItem 
                                        title="Trackers With Streaks" 
                                        value={currentStats.trackers_with_streaks || 0} 
                                    />
                                    <StatItem 
                                        title="Overall Goal Progress" 
                                        value={formatPercent(currentStats.total_goal_progress_percent)} 
                                        unit=""
                                    />
                                </div>
                            </div>


                            {/* FUTURE TRANSACTION HISTORY MINI TABLE */}
                            <div className="w-full h-full flex flex-col bg-[var(--green0)] rounded-4xl shadow-lg p-5">
                                <a
                                    className=" flex flex-row justify-between"
                                    href="#"
                                    // Removed onClick={() => setShowTransactionHistory(true)} since it's not defined here
                                    >
                                    {/* DYNAMIC COUNT */}
                                    <h5 className="!text-[var(--green3)]">Recent Activity ({recentTransactions.length})</h5>
                                    <ExpandIcon className="w-7 h-7 fill-[var(--neutral3)] hover:scale-110"/>
                                </a>

                                            {/* HEADER ROW */}
                                            <div className="flex flex-row justify-between w-[100%] h-8 ">
                                                <div className="w-full flex justify-start items-center"><label>Amount</label></div>
                                                <div className="w-full flex justify-start items-center"><label>Tracker</label></div>
                                                <div className="w-full flex justify-start items-center"><label>Contributor</label></div>
                                                <div className="w-full flex justify-start items-center"><label>Date</label></div>
                                                <div className="w-full flex justify-start items-center"><label>Status</label></div>
                                            </div>
                                            <div className="bg-[var(--neutral2)] w-[100%] h-0.5 "></div>

                                <div className="w-full h-full overflow-auto">
                                    
                                    <div className=" w-[100%] h-20">
                                        {/* FETCH FROM THE DATABASE */}
                                        <div className="flex-1 w-[99%] trans-smooth">
                                            {/* DYNAMIC TRANSACTION DATA ROWS */}
                                            {recentActivityContent}
                                        </div>
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

export default DashboardPage;