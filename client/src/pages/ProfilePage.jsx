import { useState, useEffect } from "react";
import { getCurrentUser, getUserProfile, getUserSavingsStatistics, getStreakBadge } from "../services/DatabaseControl";
import LoadingScreen from "../components/LoadingMode";
import ProfileIcon from "../assets/icons/person-outline.svg?react";
import TrophyIcon from "../assets/icons/award-outline.svg?react";
import ChartIcon from "../assets/icons/trending-up-outline.svg?react"; // New icon for metrics

// --- Helpers for Formatting (Reusing logic from StatisticsPage) ---
const formatCurrency = (amount) => {
    return parseFloat(amount || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const calculateRank = (totalSaved) => {
    // Scaling for a "rank" feel. Rank 10 at $1,000, Rank 50 at $50,000
    const rank = Math.floor(Math.sqrt(totalSaved / 100)) + 1;
    const nextRankThreshold = (rank * rank) * 100; // Savings needed for next rank
    return {
        currentRank: rank,
        progress: totalSaved,
        nextRankThreshold: nextRankThreshold,
        progressPercent: Math.min(100, (totalSaved / nextRankThreshold) * 100)
    };
};

// Rank and Progress Bar Component
const RankWidget = ({ rank, progress, nextRankThreshold, progressPercent }) => (
    <div className="p-4 bg-[var(--green1)] rounded-2xl shadow-inner border border-[var(--green2)]">
        <div className="flex justify-between items-center mb-1">
            <h3 className="font-extrabold text-[var(--green3)]">Rank {rank}</h3>
            <h5 className="text-[var(--neutral3)] text-sm">Savings: ${formatCurrency(progress)} / ${formatCurrency(nextRankThreshold)}</h5>
        </div>
        <div className="w-full bg-[var(--neutral2)] rounded-full h-4 shadow-inner">
            <div 
                className="bg-[var(--green3)] h-4 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
            ></div>
        </div>
        <h5 className="text-center text-xs mt-1 font-semibold text-[var(--neutral3)]">
            Overall Savings Progress to Next Rank
        </h5>
    </div>
);

// Stat Score Component
const MetricScore = ({ label, value, colorClass = 'text-[var(--green3)]', icon = '' }) => (
    <div className="flex justify-between p-3 bg-[var(--green1)] rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <h5 className="text-[var(--neutral3)] flex items-center gap-2">{icon} {label}</h5>
        <h3 className={`font-bold ${colorClass}`}>{value}</h3>
    </div>
);


// -----------------------------------------------------------------------------
// SKELETON COMPONENTS
// -----------------------------------------------------------------------------

// Skeleton for a single MetricScore item
function SkeletonMetricScore() {
    return (
        <div className="flex justify-between p-3 bg-[var(--green1)] rounded-xl shadow-sm animate-pulse">
            {/* Label Placeholder */}
            <div className="h-5 w-3/5 bg-[var(--neutral1)] rounded"></div>
            {/* Value Placeholder */}
            <div className="h-6 w-1/4 bg-[var(--neutral1)] rounded"></div>
        </div>
    );
}

// Skeleton for the Rank Widget
function SkeletonRankWidget() {
    return (
        <div className="p-4 bg-[var(--green1)] rounded-2xl shadow-inner border border-[var(--green2)] animate-pulse">
            <div className="flex justify-between items-center mb-2">
                {/* Rank Title Placeholder */}
                <div className="h-7 w-24 bg-[var(--neutral1)] rounded-lg"></div>
                {/* Savings/Threshold Placeholder */}
                <div className="h-4 w-1/3 bg-[var(--neutral1)] rounded"></div>
            </div>
            {/* Progress Bar Placeholder */}
            <div className="w-full bg-[var(--neutral1)] rounded-full h-4 shadow-inner">
                <div className="bg-[var(--neutral1)] h-4 rounded-full w-2/3"></div>
            </div>
            {/* Footer Text Placeholder */}
            <div className="h-4 w-3/4 bg-[var(--neutral1)] rounded mx-auto mt-2"></div>
        </div>
    );
}

// Main Skeleton Page
function SkeletonProfilePage() {
    return (
        <div className="flex justify-center p-5 h-full">
            <div className="flex flex-col w-full max-w-[95em] max-h-[55em] gap-5">
                {/* Page Title Placeholder */}
                <div className="m-8 ml-3 h-20 w-120 bg-[var(--neutral1)] rounded-4xl mb-2 animate-pulse"></div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* LEFT COLUMN SKELETON */}
                    <div className="lg:col-span-1 flex flex-col gap-6 bg-[var(--green0)] p-8 rounded-4xl shadow-lg">

                        {/* ACCOUNT CARD SKELETON */}
                        <div className="flex items-center gap-5 border-b pb-4 border-[var(--green1)] animate-pulse">
                            {/* Icon Placeholder */}
                            <div className="w-16 h-16 bg-[var(--neutral1)] rounded-full"></div>
                            <div>
                                {/* Username Placeholder */}
                                <div className="h-7 w-40 bg-[var(--neutral1)] rounded-lg mb-2"></div>
                                {/* Member Since Placeholder */}
                                <div className="h-4 w-32 bg-[var(--neutral1)] rounded"></div>
                            </div>
                        </div>

                        {/* STREAK ACHIEVEMENT TILE SKELETON */}
                        <div className="p-4 bg-[var(--green1)] rounded-2xl shadow-md flex flex-col gap-3 h-full animate-pulse">
                            {/* Header Placeholder */}
                            <div className="h-5 w-3/4 bg-[var(--neutral1)] rounded mb-3"></div>
                            
                            <div className="flex flex-col justify-between items-center h-full">
                                <div className="w-full h-auto flex flex-row justify-start items-center gap-5">
                                    {/* Trophy/Icon Placeholder (large) */}
                                    <div className="w-16 h-16 bg-[var(--neutral1)] rounded-full my-3"></div>
                                    {/* Badge Name Placeholder */}
                                    <div className="h-8 w-2/3 bg-[var(--neutral1)] rounded-lg mb-5"></div>
                                </div>
                                <div className="w-full h-auto">
                                    <div className="text-right w-full">
                                        {/* Record Streak Label Placeholder */}
                                        <div className="h-4 w-1/3 bg-[var(--neutral1)] rounded ml-auto mb-1"></div>
                                        {/* Record Streak Value Placeholder */}
                                        <div className="h-5 w-1/4 bg-[var(--neutral1)] rounded ml-auto"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN SKELETON */}
                    <div className="lg:col-span-2 flex flex-col gap-6 bg-[var(--green0)] p-8 rounded-4xl shadow-lg">
                        
                         {/* SAVINGS RANK & PROGRESS WIDGET SKELETON */}
                         <SkeletonRankWidget />
                        
                        {/* PERFORMANCE METRICS LIST SKELETON */}
                        <div>
                            {/* Metrics Header Placeholder */}
                            <div className="h-6 w-1/3 bg-[var(--neutral1)] rounded pb-2 mb-3"></div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <SkeletonMetricScore />
                                <SkeletonMetricScore />
                                <SkeletonMetricScore />
                                <SkeletonMetricScore />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
function ProfilePage(){
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadProfileData() {
            setLoading(true);
            const { user, error: userError } = await getCurrentUser();
            
            if (userError || !user) {
                setError("User not logged in or session expired.");
                setLoading(false);
                return;
            }

            const [profileResult, statsResult] = await Promise.all([
                getUserProfile(user.id),
                getUserSavingsStatistics(user.id)
            ]);

            if (profileResult.error || statsResult.error) {
                setError("Failed to load profile or statistics.");
            } else {
                setProfile(profileResult.data);
                setStats(statsResult.data);
            }
            setLoading(false);
        }
        loadProfileData();
    }, []);

    if (loading) {
        // RENDER SKELETON WHEN LOADING
        return <SkeletonProfilePage />;
    }

    if (error) {
        return <div className="flex justify-center p-5 text-red-500">Error: {error}</div>;
    }

    const { currentRank, progress, nextRankThreshold, progressPercent } = calculateRank(stats?.total_saved_across_all || 0);
    const personalHighestBadge = getStreakBadge(stats?.personal_highest_streak_days || 0);

    return (
        <>
            <div className="flex justify-center p-5 h-full">
                {/* Main container uses full width up to 95em, matching other pages */}
                <div className="flex flex-col w-full max-w-[95em] max-h-[55em] gap-5">
                    <h1 className="text-[var(--green3)]">Account Overview</h1>
                    
                    {/* Content is split into two columns on large screens */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        
                        {/* LEFT COLUMN: Account Info, Rank, Achievement (Uses 1 column on Lg screens) */}
                        <div className="lg:col-span-1 flex flex-col gap-6 bg-[var(--green0)] p-8 rounded-4xl shadow-lg">

                            {/* 👤 ACCOUNT CARD */}
                            <div className="flex items-center gap-5 border-b pb-4 border-[var(--green1)]">
                                <ProfileIcon className="w-16 h-16 fill-[var(--green3)] bg-[var(--green1)] p-2 rounded-full shadow-md" />
                                <div>
                                    <h1 className="text-[var(--green3)] mb-0">
                                        {profile?.username || "Savings User"}
                                    </h1>
                                    <p className="text-[var(--neutral3)]">
                                        Member Since: {new Date(profile?.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* 🏆 STREAK ACHIEVEMENT TILE */}
                            <div className="p-4 bg-[var(--green1)] rounded-2xl shadow-md flex flex-col gap-3 h-full">
                                <h4 className="text-[var(--neutral3)] mb-1">Highest Streak Achievement:</h4>
                                <div className="flex flex-col justify-between items-center h-full">
                                    <div className="w-full h-auto flex flex-col items-center">
                                        <h3 className="text-[var(--green3)] w-full font-extrabold flex items-center gap-2">
                                            <TrophyIcon className="w-20 h-20 fill-current"/>
                                            {personalHighestBadge.name}
                                        </h3>
                                    </div>
                                    <div className="w-full h-auto">
                                        <div className="text-right w-full">
                                            <h5 className="text-[var(--neutral3)]">Record Streak:</h5>
                                            <h5 className="font-semibold text-[var(--green3)]">{stats?.personal_highest_streak_days || 0} Days</h5>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Performance Metrics & Rank Widget (Uses 2 columns on Lg screens) */}
                        <div className="lg:col-span-2 flex flex-col gap-6 bg-[var(--green0)] p-8 rounded-4xl shadow-lg">
                            
                             {/* 📈 SAVINGS RANK & PROGRESS WIDGET */}
                             <RankWidget 
                                rank={currentRank} 
                                progress={progress}
                                nextRankThreshold={nextRankThreshold}
                                progressPercent={progressPercent}
                            />
                            
                            {/* 🔥 PERFORMANCE METRICS LIST */}
                            <div>
                                <h3 className="text-[var(--green3)] border-b border-[var(--green2)] pb-2 mb-3 flex items-center gap-2">
                                    <ChartIcon className="w-5 h-5 fill-current"/>
                                    Performance Metrics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <MetricScore 
                                        label="Total Cumulative Savings" 
                                        value={`$${formatCurrency(stats?.total_saved_across_all)}`}
                                        colorClass='text-[var(--green3)]'
                                        icon="✅"
                                    />
                                    <MetricScore 
                                        label="Highest Single Transaction" 
                                        value={`$${formatCurrency(stats?.highest_saved_amount)}`}
                                        colorClass='text-[var(--red3)]'
                                        icon="💲"
                                    />
                                    <MetricScore 
                                        label="Trackers with Active Streaks" 
                                        value={stats?.trackers_with_streaks || 0}
                                        colorClass='text-[var(--green3)]'
                                        icon="🔥"
                                    />
                                    <MetricScore 
                                        label="Goals Achieved (Completion Ratio)" 
                                        value={`${stats?.goals_completed || 0} / ${stats?.trackers_with_goals || 0}`}
                                        colorClass='text-[var(--green3)]'
                                        icon="🎯"
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
export default ProfilePage