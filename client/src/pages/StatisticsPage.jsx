import { useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingMode";
import { 
    getCurrentUser, 
    getUserSavingsStatistics, 
    getStreakBadge 
} from "../services/DatabaseControl";

// -------------------------------------------------------------------------
// STREAK BADGE IMPORTS
// -------------------------------------------------------------------------
import StreakBadge1 from "../assets/badges/streakBadge1.svg?react";
import StreakBadge2 from "../assets/badges/streakBadge2.svg?react";
import StreakBadge3 from "../assets/badges/streakBadge3.svg?react";
import StreakBadge4 from "../assets/badges/streakBadge4.svg?react";
import StreakBadge5 from "../assets/badges/streakBadge5.svg?react";
import StreakBadge6 from "../assets/badges/streakBadge6.svg?react";
import StreakBadge7 from "../assets/badges/streakBadge7.svg?react";
import StreakBadge8 from "../assets/badges/streakBadge8.svg?react";

// The Streak Tier Guide Data
const STREAK_TIERS = [
    { days: 500, name: "Mythical", emoji: "✨" },
    { days: 250, name: "Diamond", emoji: "💎" },
    { days: 200, name: "Ruby", emoji: "🔴" },
    { days: 150, name: "Gold", emoji: "🛡️" },
    { days: 100, name: "Platinum", emoji: "🥇" },
    { days: 50, name: "Silver", emoji: "🥈" },
    { days: 10, name: "Bronze", emoji: "🥉" },
    { days: 3, name: "Wood", emoji: "🪵" },
];

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
    return StreakBadge1; // Default
};

// -------------------------------------------------------------------------
// UPDATED SKELETON COMPONENTS (Increased Height/Spacing)
// -------------------------------------------------------------------------

// Helper to create a skeleton item that matches the StatItem's structure
function SkeletonStatItem({ isLargeValue = true, colSpan = 1 }) {
    // Increased min-h slightly to min-h-28 (from min-h-24) to account for live component spacing.
    return (
        <div className={`flex flex-col p-4 bg-[var(--green1)] rounded-xl shadow-md min-h-28 animate-pulse col-span-${colSpan}`}>
            {/* Title Placeholder (h5) */}
            <div className="h-4 w-3/5 bg-[var(--neutral1)] rounded mb-2"></div> 
            
            {/* Value Placeholder (h2 text-3xl) */}
            {isLargeValue ? (
                // Matches the size of text-3xl (h-8) and uses a significant width
                <div className="h-8 w-1/2 min-w-16 bg-[var(--neutral1)] rounded-lg mt-1"></div>
            ) : (
                // Used for values that are single-line, like 'days' or 'badge name' (h-6)
                <div className="h-6 w-3/4 min-w-20 bg-[var(--neutral1)] rounded-lg mt-1"></div>
            )}
        </div>
    );
}

function SkeletonStatisticsPage() {
    return (
        <div className="flex justify-center p-5 h-full animate-pulse overflow-x-hidden">
            {/* Increased max-h slightly */}
            <div className="flex flex-col w-full max-w-[95em] max-h-[52em] gap-5 ">
                
                {/* STREAK TIER GUIDE SKELETON */}
                <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5 mt-5">
                    {/* Title Placeholder (h2) */}
                    <div className="h-7 w-64 bg-[var(--neutral1)] rounded-lg mb-4"></div>
                    {/* Description Placeholder (p) */}
                    <div className="h-4 w-3/4 bg-[var(--neutral1)] rounded mb-4"></div>
                    
                    {/* Tiers Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="flex flex-col items-center justify-start p-3 bg-[var(--green1)] rounded-xl min-h-50 shadow-md"> {/* Increased min-h here */}
                                {/* Badge Placeholder (w-30 h-30) */}
                                <div className="w-12 h-12 bg-[var(--neutral1)] rounded-full mb-2 mt-2"></div>
                                {/* Name Placeholder (h5) */}
                                <div className="h-4 w-3/4 bg-[var(--neutral1)] rounded mb-1"></div>
                                {/* Days Placeholder (p text-sm) */}
                                <div className="h-3 w-1/2 bg-[var(--neutral1)] rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-10 !w-[60%] !min-h-20 bg-[var(--neutral1)] rounded-3xl"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                    {/* OVERALL STATS SKELETON (lg:col-span-4) */}
                    <div className="lg:col-span-4 bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                        <div className="h-6 w-80 bg-[var(--neutral1)] rounded mb-4"></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <SkeletonStatItem isLargeValue={true} />
                            <SkeletonStatItem isLargeValue={true} />
                            <SkeletonStatItem isLargeValue={true} />
                            <SkeletonStatItem isLargeValue={true} />
                        </div>
                    </div>
                </div>

                {/* STREAK & GOAL DETAILS SKELETON */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* STREAK & SAVED BY PERIOD WIDGETS (lg:col-span-2) */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                        {/* CURRENT STREAK STATUS SKELETON */}
                        <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                            <div className="h-6 w-64 bg-[var(--neutral1)] rounded mb-4"></div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <SkeletonStatItem isLargeValue={false} />
                                <SkeletonStatItem isLargeValue={false} />
                                <SkeletonStatItem isLargeValue={false} />
                                <SkeletonStatItem isLargeValue={false} />
                                <SkeletonStatItem colSpan={2} isLargeValue={false} /> 
                                <SkeletonStatItem colSpan={2} isLargeValue={true} />
                            </div>
                        </div>

                        {/* GOAL TRACKING SKELETON */}
                        <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                            <div className="h-6 w-40 bg-[var(--neutral1)] rounded mb-4"></div>
                            <div className="grid grid-cols-3 gap-4">
                                <SkeletonStatItem isLargeValue={true} />
                                <SkeletonStatItem isLargeValue={true} />
                                <SkeletonStatItem isLargeValue={true} />
                            </div>
                        </div>
                        
                        {/* SAVED BY PERIOD SKELETON */}
                        <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                            <div className="h-6 w-40 bg-[var(--neutral1)] rounded mb-4"></div>
                            <div className="flex flex-col gap-3">
                                {/* These StatItems were using min-h-24, increasing them to min-h-28 for better spacing */}
                                <SkeletonStatItem isLargeValue={true} colSpan={4} /> 
                                <SkeletonStatItem isLargeValue={true} colSpan={4} /> 
                                <SkeletonStatItem isLargeValue={true} colSpan={4} /> 
                            </div>
                        </div>
                    </div>

                    {/* PERSONAL HIGHS SKELETON (lg:col-span-1) */}
                    <div className="lg:col-span-1 flex flex-col gap-5">
                        <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                            <div className="h-6 w-32 bg-[var(--neutral1)] rounded mb-4"></div>
                            <div className="flex flex-col gap-3">
                                <SkeletonStatItem isLargeValue={false} colSpan={1} />
                                <SkeletonStatItem isLargeValue={false} colSpan={1} />
                                <SkeletonStatItem isLargeValue={true} colSpan={1} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatisticsPage(){
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadStatistics() {
            setLoading(true);
            const { user, error: userError } = await getCurrentUser();
            
            if (userError || !user) {
                setError("User not logged in or session expired.");
                setLoading(false);
                return;
            }

            const { data: statsData, error: statsError } = await getUserSavingsStatistics(user.id);

            if (statsError) {
                setError("Failed to fetch statistics: " + statsError);
            } else {
                setStats(statsData);
            }
            setLoading(false);
        }

        loadStatistics();
    }, []);

    if (loading) {
        // RENDER SKELETON WHEN LOADING
        return <SkeletonStatisticsPage />;
    }

    if (error) {
        return <div className="flex justify-center p-5 text-red-500">Error: {error}</div>;
    }
    
    // Safety check after loading
    const currentStats = stats || {}; 
    const currentStreakBadge = getStreakBadge(currentStats.highest_current_streak_days || 0);
    const personalHighestBadge = getStreakBadge(currentStats.personal_highest_streak_days || 0);

    // -------------------------------------------------------------------------
    // UPDATED FORMATTING FUNCTIONS
    // -------------------------------------------------------------------------
    const formatCurrency = (amount) => {
        return `$${parseFloat(amount || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };
    
    const formatPercent = (amount) => `${parseFloat(amount || 0).toFixed(2)}%`;
    const formatDays = (days) => `${days || 0} ${days === 1 ? "day" : "days"}`;

    const StatItem = ({ title, value, unit = '' }) => (
        <div className="flex flex-col p-4 bg-[var(--green1)] rounded-xl shadow-md min-h-24">
            <h5 className="text-[var(--neutral3)] mb-1">{title}</h5>
            <h2 className="text-[var(--green3)] text-3xl font-bold">
                {value}{unit}
            </h2>
        </div>
    );
    
    return (
        <>
            <div className="flex justify-center p-5 h-full flex justify-center p-5 h-full overflow-x-hidden">
                <div className="flex flex-col w-full max-w-[95em] max-h-[52em] gap-5 ">
                    {/* STREAK TIER GUIDE */}
                    <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5 mt-5">
                        <h2 className="mb-4 text-[var(--green3)]">🌟 Streak Tier Guide</h2>
                        <p className="text-[var(--neutral3)] mb-4">Complete a streak for this many days to achieve the next tier and unlock new badges!</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            {[...STREAK_TIERS].reverse().map(tier => {
                                const TierBadgeComponent = getBadgeComponent(tier.days);
                                return (
                                    <div key={tier.name} className="flex flex-col items-center justify-start p-3 bg-[var(--green1)] rounded-xl min-h-32 shadow-md streak-badge">
                                        {/* Use the dynamic SVG component instead of emoji */}
                                        <TierBadgeComponent className="w-30 h-30 " />
                                        <h5 className="font-semibold text-center mt-0">{tier.name}</h5>
                                        <p className="text-sm text-[var(--neutral3)]">{tier.days} Days</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    
                    <h1>💰 Your Saving Statistics</h1>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
                        {/* OVERALL STATS */}
                        <div className="lg:col-span-4 bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                            <h2 className="mb-4 text-[var(--green3)]">Overall Savings Snapshot</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatItem 
                                    title="Total Saved" 
                                    value={formatCurrency(currentStats.total_saved_across_all)} 
                                />
                                <StatItem 
                                    title="Trackers With Streaks" 
                                    value={currentStats.trackers_with_streaks || 0} 
                                />
                                <StatItem 
                                    title="Trackers With Goals" 
                                    value={currentStats.trackers_with_goals || 0} 
                                />
                                <StatItem 
                                    title="Goals Progress" 
                                    value={formatPercent(currentStats.total_goal_progress_percent)} 
                                    unit=""
                                />
                            </div>
                        </div>
                    </div>

                    {/* STREAK & GOAL DETAILS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        
                        {/* STREAK WIDGETS */}
                        <div className="lg:col-span-2 flex flex-col gap-5">
                            <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                                <h2 className="mb-4 text-[var(--green3)]">Current Streak Status</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatItem 
                                        title="Highest Current Streak" 
                                        value={formatDays(currentStats.highest_current_streak_days)} 
                                    />
                                    <StatItem 
                                        title="Current Badge" 
                                        value={`${currentStreakBadge.name} ${currentStreakBadge.emoji}`}
                                    />
                                    <StatItem 
                                        title="Activated Today" 
                                        value={currentStats.activated_streaks_today || 0} 
                                    />
                                    <StatItem 
                                        title="Unactivated Today" 
                                        value={currentStats.unactivated_streaks_today || 0} 
                                    />
                                    <div className="col-span-2">
                                        <StatItem 
                                            title="Tracker with Highest Streak" 
                                            value={currentStats.highest_current_streak_tracker || 'N/A'} 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <StatItem 
                                            title="Total Saved Today" 
                                            value={formatCurrency(currentStats.total_saved_today)} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* GOAL WIDGET */}
                            <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                                <h2 className="mb-4 text-[var(--green3)]">Goal Tracking</h2>
                                <div className="grid grid-cols-3 gap-4">
                                    <StatItem 
                                        title="Total Goal Saved" 
                                        value={formatCurrency(currentStats.total_goal_saved)} 
                                    />
                                    <StatItem 
                                        title="Total Goal Target" 
                                        value={formatCurrency(currentStats.total_goal_amount)} 
                                    />
                                    <StatItem 
                                        title="Net Progress" 
                                        value={formatPercent(currentStats.total_goal_progress_percent)} 
                                    />
                                </div>
                            </div>
                            <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                                <h2 className="mb-4 text-[var(--green3)]">Saved by Period</h2>
                                <div className="flex flex-col gap-3">
                                    <StatItem 
                                        title="This Week" 
                                        value={formatCurrency(currentStats.total_saved_this_week)} 
                                    />
                                    <StatItem 
                                        title="This Month" 
                                        value={formatCurrency(currentStats.total_saved_this_month)} 
                                    />
                                    <StatItem 
                                        title="This Year" 
                                        value={formatCurrency(currentStats.total_saved_this_year)} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* PERSONAL HIGHS & TIME STATS */}
                        <div className="lg:col-span-1 flex flex-col gap-5">
                            <div className="bg-[var(--green0)] rounded-4xl shadow-xl p-5">
                                <h2 className="mb-4 text-[var(--green3)]">Personal Best</h2>
                                <div className="flex flex-col gap-3">
                                    <StatItem 
                                        title="Highest Streak (All-Time)" 
                                        value={formatDays(currentStats.personal_highest_streak_days)} 
                                    />
                                    <StatItem 
                                        title="Highest Streak Badge" 
                                        value={`${personalHighestBadge.name} ${personalHighestBadge.emoji}`} 
                                    />
                                    <StatItem 
                                        title="Highest Saved Amount" 
                                        value={formatCurrency(currentStats.highest_saved_amount)} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default StatisticsPage