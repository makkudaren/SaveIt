// TrackersPage.jsx
// -----------------------------------------------------------------------------
// PRIMARY FUNCTION:
// Management hub for all user trackers. This page provides:
//    • Full tracker list (grid view)
//    • Detailed view of the chosen tracker
//    • Create Tracker Form modal
//    • Goal Calculator modal
//    • Search, sort, and filter utilities (UI-ready)
// -----------------------------------------------------------------------------
// DATA BEHAVIOR:
//    • Fetches trackers for the authenticated user
//    • Auto-selects a tracker based on navigation intent or first result
//    • Re-fetches data when trackers are updated (create/edit/delete)
// -----------------------------------------------------------------------------

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Tracker from "../components/Tracker";
import TrackerCard from "../components/TrackerCard";
import CreateTrackerForm from "../components/CreateTrackerForm";
import GoalCalculator from "../components/GoalCalculator";
import LoadingScreen from "../components/LoadingMode";

import GlobeIcon from "../assets/icons/globe-outline.svg?react";
import EditIcon from "../assets/icons/edit-2-outline.svg?react";
import streakOnIcon from "../assets/icons/streak-on-indicator.png";
import streakOffIcon from "../assets/icons/streak-off-indicator.png";
import ExpandIcon from "../assets/icons/expand-outline.svg?react";
import TrashIcon from "../assets/icons/trash-outline.svg?react";
import SharedIcon from "../assets/icons/people-outline.svg?react";

import SearchIcon from "../assets/icons/search-outline.svg?react";
import CalculatorIcon from "../assets/icons/calculator-filled.svg?react";

// Database Services
import { getUserTrackers, getCurrentUser } from "../services/DatabaseControl";


// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------
function TrackersPage() {

    // Modal visibility states
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showGoalCalculator, setShowGoalCalculator] = useState(false);

    // Trackers and selection states
    const [trackers, setTrackers] = useState([]);
    const [selectedTracker, setSelectedTracker] = useState(null);

    // Loading state
    const [loading, setLoading] = useState(true);

    // Key to re-trigger data fetching whenever a tracker is updated
    const [trackerUpdateKey, setTrackerUpdateKey] = useState(0);

    // Retrieve navigation-based tracker selection (optional)
    const location = useLocation();
    const selectedTrackerId = location.state?.selectedTrackerId;


    // -----------------------------------------------------------------------------
    // DATA FETCHING — runs on first load and whenever trackers change
    // -----------------------------------------------------------------------------
    useEffect(() => {
        async function fetchTrackers() {
            setLoading(true);

            // 1. Validate logged-in user
            const { user, error: userError } = await getCurrentUser();
            if (userError || !user) {
                console.error("Failed to fetch user:", userError);
                setTrackers([]);
                setSelectedTracker(null);
                setLoading(false);
                return;
            }

            const userId = user.id;

            // 2. Fetch user's trackers
            const { data, error } = await getUserTrackers(userId);

            if (error) {
                console.error("Error fetching trackers:", error);
                setTrackers([]);
            } else {
                setTrackers(data || []);

                // HANDLE SELECTION CORRECTION
                if (selectedTracker) {
                    const updated = data.find(t => t.id === selectedTracker.id);
                    setSelectedTracker(updated || data[0] || null);
                } else {
                    if (data.length > 0) {
                        if (selectedTrackerId) {
                            const match = data.find(t => t.id === selectedTrackerId);
                            setSelectedTracker(match || data[0]);
                        } else {
                            setSelectedTracker(data[0]);
                        }
                    } else {
                        setSelectedTracker(null);
                    }
                }
            }

            setLoading(false);
        }

        fetchTrackers();
    }, [trackerUpdateKey]); // Re-fetch on update


    // -----------------------------------------------------------------------------
    // HANDLERS
    // -----------------------------------------------------------------------------

    // Selecting a tracker updates the panel on the left
    const handleTrackerSelect = (tracker) => {
        setSelectedTracker(tracker);
    };

    // Called whenever TrackerCard or Tracker reports a change
    const handleTrackerChange = (changeInfo) => {
        console.log("Tracker updated:", changeInfo);
        setTrackerUpdateKey(prev => prev + 1); // Force re-fetch
    };

    function SkeletonTracker(){
        return(
            <>
                <div className="//TRACKER-FULL flex bg-[var(--neutral0)] p-5 gap-3 w-[100%] h-77 rounded-4xl shadow-lg animate-pulse">
                    <div className="bg-[var(--neutral0)] w-full h-full">
                        {/* TITLE + EDIT BUTTON SKELETON */}
                        <div className="flex justify-between items-center">
                            <div className="h-6 w-32 bg-[var(--neutral1)] rounded"></div>
                            <div className="flex flex-row justify-start items-center gap-3">
                                <div className="h-5 w-20 bg-[var(--neutral1)] rounded"></div>
                            </div>
                        </div>

                        {/* BANK INFORMATION SKELETON */}
                        <div className="flex gap-2 items-center justify-start mt-2">
                            <div className="w-8 h-8 bg-[var(--neutral1)] rounded-full"></div>
                            <div className="h-5 w-24 bg-[var(--neutral1)] rounded"></div>
                            <div className="h-5 w-40 bg-[var(--neutral1)] rounded"></div>
                        </div>

                        {/* BALANCE SKELETON */}
                        <div className="flex gap-2 items-center justify-start mt-4">
                            <div className="h-10 w-48 bg-[var(--neutral1)] rounded"></div>
                        </div>

                        {/* DESCRIPTION + ACTION BUTTONS SKELETON */}
                        <div className="flex gap-2 items-end justify-between mt-4">
                            <div className="overflow-hidden">
                                <div className="w-60 h-20 space-y-2">
                                    <div className="h-4 w-full bg-[var(--neutral1)] rounded"></div>
                                    <div className="h-4 w-5/6 bg-[var(--neutral1)] rounded"></div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="!h-12 w-30 bg-[var(--neutral1)] rounded-xl"></div>
                                <div className="!h-12 w-30 bg-[var(--neutral1)] rounded-xl"></div>
                            </div>
                        </div>

                        {/* STREAK + PROGRESS INFORMATION SKELETON */}
                        <div className="flex py-4 gap-2 items-center justify-between ">

                            {/* STREAK DAYS SKELETON */}
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-4 bg-[var(--neutral1)] rounded-full"></div>
                                <div className="h-4 w-20 bg-[var(--neutral1)] rounded"></div>
                            </div>

                            {/* STREAK MINIMUM SKELETON */}
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-32 bg-[var(--neutral1)] rounded"></div>
                            </div>

                            {/* DAYS LEFT (GOAL) SKELETON */}
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-24 bg-[var(--neutral1)] rounded"></div>
                            </div>

                            {/* PROGRESS PERCENTAGE (GOAL) SKELETON */}
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-12 bg-[var(--neutral1)] rounded"></div>
                            </div>
                        </div>

                        {/* PROGRESS BAR SKELETON */}
                        <div className="w-full h-2.5 bg-[var(--neutral1)] rounded-full">
                            <div className="h-full w-2/5 bg-[var(--neutral1)] rounded-full"></div>
                        </div>
                    </div>

                    {/* RIGHT SECTION — RECENT ACTIVITY SKELETON */}
                    <div className="bg-[var(--neutral0)] mx-2 p-5 pb-10 w-full h-[90%]shadow-lg rounded-3xl">
                        <div className="flex flex-row justify-between items-center">
                            <div className="h-5 w-36 bg-[var(--neutral1)] rounded"></div>
                            <div className="w-7 h-7 bg-[var(--neutral1)] rounded-full"></div>
                        </div>

                        <div className="w-full h-full overflow-hidden mt-4">
                            <div className=" w-170 h-40">
                                <div className="w-[99%]">
                                    {/* HEADER ROW SKELETON */}
                                    <div className="flex flex-row justify-between w-[100%] h-8 mt-2">
                                        <div className="w-full flex justify-start items-center h-3 w-16 bg-[var(--neutral1)] rounded"></div>
                                        <div className="w-full flex justify-start items-center h-3 w-20 bg-[var(--neutral1)] rounded"></div>
                                        <div className="w-full flex justify-start items-center h-3 w-12 bg-[var(--neutral1)] rounded"></div>
                                        <div className="w-full flex justify-start items-center h-3 w-16 bg-[var(--neutral1)] rounded"></div>
                                    </div>
                                    <div className="bg-[var(--neutral1)] w-[100%] h-0.5 mt-2"></div>

                                    {/* DYNAMIC TRANSACTION DATA ROWS SKELETON */}
                                    <div className="mt-4 space-y-2">
                                        <div className="flex flex-row justify-between w-full">
                                            <div className="w-full flex justify-start items-center h-2 w-10 bg-[var(--neutral1)] rounded"></div>
                                            <div className="w-full flex justify-start items-center h-2 w-16 bg-[var(--neutral1)] rounded"></div>
                                            <div className="w-full flex justify-start items-center h-2 w-10 bg-[var(--neutral1)] rounded"></div>
                                            <div className="w-full flex justify-start items-center h-2 w-12 bg-[var(--neutral1)] rounded"></div>
                                        </div>
                                        <div className="flex flex-row justify-between w-full">
                                            <div className="w-full flex justify-start items-center h-2 w-12 bg-[var(--neutral1)] rounded"></div>
                                            <div className="w-full flex justify-start items-center h-2 w-18 bg-[var(--neutral1)] rounded"></div>
                                            <div className="w-full flex justify-start items-center h-2 w-8 bg-[var(--neutral1)] rounded"></div>
                                            <div className="w-full flex justify-start items-center h-2 w-10 bg-[var(--neutral1)] rounded"></div>
                                        </div>
                                        <div className="flex flex-row justify-between w-full">
                                            <div className="w-full flex justify-start items-center h-2 w-8 bg-[var(--neutral1)] rounded"></div>
                                            <div className="w-full flex justify-start items-center h-2 w-14 bg-[var(--neutral1)] rounded"></div>
                                            <div className="w-full flex justify-start items-center h-2 w-12 bg-[var(--neutral1)] rounded"></div>
                                            <div className="w-full flex justify-start items-center h-2 w-8 bg-[var(--neutral1)] rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                        
            </>
        )
    }

    function SkeletonTrackerCard() {
        return(
            <>
                {/* -----------------------------------------------------------------
                    TRACKER CARD UI SKELETON
                ----------------------------------------------------------------- */}
                <div className="pl-2 snap-start transition-all animate-pulse">
                    {/* The main card container maintains the fixed dimensions (w-80 h-50) */}
                    <div
                        className={`mb-5 relative flex flex-col justify-between min-w-80 min-h-50 max-w-80 max-h-50 w-80 h-50 bg-[var(--neutral0)] rounded-4xl shadow-lg p-5`}
                    >
                        {/* POP-UP MENU BUTTON SKELETON */}
                        <div className="absolute top-5 right-5">
                            <div
                                className="!w-9 !h-9 !rounded-full !bg-[var(--neutral1)] flex items-center justify-center shadow"
                            >
                                {/* Placeholder for MoreIcon */}
                                <div className="w-5 h-5 bg-[var(--neutral1)] rounded-full"></div>
                            </div>
                                            
                            {/* We don't render the menu itself during the skeleton state */}
                        </div>

                        {/* -----------------------------------------------------------------
                            TRACKER CONTENT DISPLAY SKELETON
                        ----------------------------------------------------------------- */}
                                        
                        {/* Placeholder to push content down from the menu button area */}
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
            </>
        )
    }


    // -----------------------------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------------------------
    return (
        <>
            {/* MODALS ------------------------------------------------------------- */}

            <CreateTrackerForm
                show={showCreateForm}
                onClose={() => setShowCreateForm(false)}
                onSuccess={handleTrackerChange}
            />

            <GoalCalculator
                show={showGoalCalculator}
                onClose={() => setShowGoalCalculator(false)}
            />

            {/* MAIN PAGE ---------------------------------------------------------- */}
            <div className="flex justify-center p-5 h-full">
                <div className="flex flex-col w-full max-w-[95em] max-h-[55em] gap-5">

                    {/* LARGE TRACKER DETAIL PANEL */}
                    {loading ?
                        (SkeletonTracker()):(
                        <Tracker 
                            tracker={selectedTracker}
                            onTrackerChange={handleTrackerChange}
                        />)
                    }
                    
                    {/* CONTROLS ROW ------------------------------------------------ */}
                    <div className="w-full h-auto flex justify-between">

                        {/* LEFT: CREATE / FILTER / SORT */}
                        <div className="flex gap-3">
                            <button
                                className="w-40 shadow-lg btn-3D"
                                onClick={() => setShowCreateForm(true)}
                            >
                                Add Tracker
                            </button>

                            <button className="w-40 !bg-[var(--green0)] !text-[var(--neutral3)] shadow-lg btn-3D">
                                Filter Type
                            </button>

                            <button className="w-40 !bg-[var(--green0)] !text-[var(--neutral3)] shadow-lg btn-3D">
                                Sort
                            </button>
                        </div>

                        {/* RIGHT: CALCULATOR + SEARCH */}
                        <div className="flex gap-3">
                            <button
                                className="w-15 !bg-[var(--green0)] !text-[var(--neutral3)] !pb-3 shadow-lg flex items-center justify-center btn-3D"
                                onClick={() => setShowGoalCalculator(true)}
                            >
                                <CalculatorIcon className="h-auto w-8 fill-[var(--neutral2)]" />
                            </button>

                            {/* SEARCH FIELD */}
                            <div className="relative">
                                <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                                <input
                                    id="tracker-search"
                                    type="text"
                                    placeholder="Search Tracker"
                                    required
                                    className="w-85 !bg-[var(--neutral0)] shadow-lg pl-14"
                                />
                            </div>
                        </div>

                    </div>


                    {/* TRACKER CARD GRID ------------------------------------------- */}
                    <div className={`w-full h-110 ${loading ? 'overflow-y-hidden' : 'overflow-y-auto'} overflow-x-hidden scrollbar-hover scroll-smooth`}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
                            {loading ? (
                                    <>
                                        <SkeletonTrackerCard /><SkeletonTrackerCard /><SkeletonTrackerCard /><SkeletonTrackerCard />
                                        <SkeletonTrackerCard /><SkeletonTrackerCard /><SkeletonTrackerCard /><SkeletonTrackerCard />
                                    </>
                                ) :
                                (  
                                    <>
                                        {trackers.length > 0 ? (
                                            trackers.map(t => (
                                                <TrackerCard
                                                    key={t.id}
                                                    tracker={t}
                                                    onCardClick={handleTrackerSelect}
                                                    onTrackerUpdated={handleTrackerChange}
                                                />
                                            ))
                                        ) : (
                                            <p className="col-span-4 p-5 text-lg text-[var(--neutral3)]">
                                                No trackers found. Click “Add Tracker” to create one.
                                            </p>
                                        )}
                                    </>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TrackersPage;
