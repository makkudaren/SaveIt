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


    // -----------------------------------------------------------------------------
    // LOADING STATE
    // -----------------------------------------------------------------------------
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <h1>Loading Trackers...</h1>
            </div>
        );
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
                    <Tracker 
                        tracker={selectedTracker}
                        onTrackerChange={handleTrackerChange}
                    />

                    {/* CONTROLS ROW ------------------------------------------------ */}
                    <div className="w-full h-auto flex justify-between">

                        {/* LEFT: CREATE / FILTER / SORT */}
                        <div className="flex gap-3">
                            <button
                                className="w-40 shadow-lg"
                                onClick={() => setShowCreateForm(true)}
                            >
                                Add Tracker
                            </button>

                            <button className="w-40 !bg-[var(--green0)] !text-[var(--neutral3)] shadow-lg">
                                Filter Type
                            </button>

                            <button className="w-40 !bg-[var(--green0)] !text-[var(--neutral3)] shadow-lg">
                                Sort
                            </button>
                        </div>

                        {/* RIGHT: CALCULATOR + SEARCH */}
                        <div className="flex gap-3">
                            <button
                                className="w-15 !bg-[var(--green0)] !text-[var(--neutral3)] shadow-lg flex items-center justify-center"
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
                    <div className="w-full h-110 overflow-y-auto overflow-x-hidden scrollbar-hover scroll-smooth">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">

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

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default TrackersPage;
