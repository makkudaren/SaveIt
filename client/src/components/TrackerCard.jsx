// TrackerCard.jsx
// -----------------------------------------------------------------------------
// PRIMARY PURPOSE:
// A reusable UI component that displays an individual financial tracker.
// Handles contextual click behavior (dashboard vs trackers page), edit/delete
// actions, ownership-based permissions, progress indicator, streak display,
// and card-level navigation.
//
// Also manages pop-up menu visibility, outside-click closing, and modal forms.
// -----------------------------------------------------------------------------

import { useState, useRef, useEffect } from "react";
import MoreIcon from "../assets/icons/more-vertical-outline.svg?react";
import StreakOnIcon from "../assets/icons/streak-on-indicator.png";
import StreakOffIcon from "../assets/icons/streak-off-indicator.png";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import EditTrackerForm from "./EditTrackerForm";
import { deleteTracker, getCurrentUserId } from "../services/DatabaseControl";

// NEW PROP: isDashboardContext → suppresses main click for dashboard widgets.
function TrackerCard({ tracker, onCardClick, onTrackerUpdated, isTodayStreakActive, isDashboardContext = false }) {

    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // TRACKER DATA EXTRACTION (Safe defaults)
    // -------------------------------------------------------------------------
    const bankName = tracker.tracker_name || "Untitled Tracker";
    const balance = tracker.balance || 0;
    const streakDays = tracker.streak_days || 0;
    const streakActive = tracker.streak_enabled;
    const goalEnabled = tracker.goal_enabled;
    const goalAmount = tracker.goal_amount || 0;

    // Progress calculation (0–100)
    let progress = 0;
    if (goalEnabled && goalAmount > 0 && balance >= 0) {
        progress = Math.min(100, (balance / goalAmount) * 100);
    }
    const progressInt = Math.floor(progress);

    // -------------------------------------------------------------------------
    // POP-UP MENU + MODALS + PERMISSION LOGIC
    // -------------------------------------------------------------------------
    const [showMenu, setShowMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const menuRef = useRef(null); // Used to detect outside clicks

    const [currentUserId, setCurrentUserId] = useState(null);
    const isOwner = currentUserId === tracker.owner_id;

    // Fetch current user ID on mount
    useEffect(() => {
        async function fetchUserId() {
            const userId = await getCurrentUserId();
            setCurrentUserId(userId);
        }
        fetchUserId();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && showMenu && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        }

        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    // -------------------------------------------------------------------------
    // CARD VIEW ACTION (Reusable)
    // - Navigates to Trackers page
    // - Executes parent's click handler for selection sync
    // -------------------------------------------------------------------------
    const handleViewTracker = () => {
        navigate("/trackers", { state: { selectedTrackerId: tracker.id } });

        if (onCardClick) {
            onCardClick(tracker);
        }
    };

    // -------------------------------------------------------------------------
    // DELETE TRACKER ACTION
    // -------------------------------------------------------------------------
    const handleDeleteTracker = async () => {
        if (!tracker || !tracker.id) return;

        const result = await deleteTracker(tracker.id);

        if (result.success) {
            console.log(`Tracker ${tracker.id} deleted successfully.`);
            setShowDeleteModal(false);

            if (onTrackerUpdated) {
                onTrackerUpdated({ action: "delete", trackerId: tracker.id });
            }
        } else {
            console.error("Failed to delete tracker:", result.error);
        }
    };

    // -------------------------------------------------------------------------
    // BALANCE FORMATTER (Converts big numbers → M/B shorthand)
    // -------------------------------------------------------------------------
    function formatBalance(value) {
        if (typeof value !== "number" || isNaN(value)) {
            return "N/A";
        }
        if (value >= 1_000_000_000) {
            return (value / 1_000_000_000).toFixed(2).replace(/\.00$/, "") + "B";
        }
        if (value >= 1_000_000) {
            return (value / 1_000_000).toFixed(2).replace(/\.00$/, "") + "M";
        }

        return value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Conditional CSS helpers
    const streakClass = streakActive ? "" : "invisible";
    const goalClass = goalEnabled ? "" : "invisible";

    // Card click behavior changes depending on location
    const mainCardClickHandler = isDashboardContext ? undefined : handleViewTracker;
    const cursorClass = isDashboardContext ? "cursor-default" : "cursor-pointer";

    return (
        <>
            {/* -----------------------------------------------------------------
                EDIT MODAL
            ----------------------------------------------------------------- */}
            <EditTrackerForm
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                tracker={tracker}
                onSuccess={() => {
                    setShowEditModal(false);
                    if (onTrackerUpdated) {
                        onTrackerUpdated({ action: "update", trackerId: tracker.id });
                    }
                }}
            />

            {/* -----------------------------------------------------------------
                DELETE CONFIRMATION MODAL
            ----------------------------------------------------------------- */}
            <Modal
                show={showDeleteModal}
                title={`Delete ${bankName}?`}
                message="Are you sure you want to delete this tracker? This action cannot be undone."
                onConfirm={handleDeleteTracker}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Delete"
            />

            {/* -----------------------------------------------------------------
                TRACKER CARD UI
            ----------------------------------------------------------------- */}
            <div className="pl-2 snap-start transition-all">
                <div
                    className={`mb-5 relative flex flex-col justify-between min-w-80 min-h-50 max-w-80 max-h-50 w-80 h-50 bg-[var(--neutral0)] rounded-4xl shadow-lg p-5 panel ${cursorClass}`}
                    onClick={mainCardClickHandler}
                >

                    {/* POP-UP MENU BUTTON + WRAPPER */}
                    <div ref={menuRef} className="absolute top-5 right-5">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu((prev) => !prev);
                            }}
                            className="!w-9 !h-9 !rounded-full !bg-[var(--green3)] flex items-center justify-center shadow hover:opacity-80 transition "
                        >
                            <MoreIcon className="w-9 h-9 fill-[var(--neutral0)]" />
                        </button>

                        {showMenu && (
                            <div
                                className="
                                    absolute right-0 top-2 mt-2
                                    w-32 bg-white border border-neutral-200 shadow-lg
                                    rounded-xl flex flex-col overflow-hidden z-50 p-1 gap-1
                                "
                            >
                                {/* VIEW OPTION */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        setShowMenu(false);
                                        handleViewTracker();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            setShowMenu(false);
                                            handleViewTracker();
                                        }
                                    }}
                                    className="flex justify-center text-md hover:bg-[var(--neutral1)] text-[var(--neutral3)] w-full text-left p-2 rounded-xl"
                                >
                                    View
                                </div>

                                {/* OWNER-ONLY CONTROLS */}
                                {isOwner && (
                                    <>
                                        {/* EDIT OPTION */}
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => {
                                                setShowMenu(false);
                                                setShowEditModal(true);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    setShowMenu(false);
                                                    setShowEditModal(true);
                                                }
                                            }}
                                            className="flex justify-center text-md hover:bg-[var(--neutral1)] text-[var(--neutral3)] w-full text-left p-2 rounded-xl"
                                        >
                                            Edit
                                        </div>

                                        {/* DELETE OPTION */}
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => {
                                                setShowMenu(false);
                                                setShowDeleteModal(true);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    setShowMenu(false);
                                                    setShowDeleteModal(true);
                                                }
                                            }}
                                            className="flex justify-center text-md hover:bg-[var(--neutral1)] hover:text-[var(--red3)] text-[var(--neutral3)] w-full text-left p-2 rounded-xl"
                                        >
                                            Delete
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* -----------------------------------------------------------------
                        TRACKER CONTENT DISPLAY
                    ----------------------------------------------------------------- */}
                    <h5 className="truncate pr-10">{bankName}</h5>
                    <h2 className="mt-3">${formatBalance(balance)}</h2>

                    {/* STREAK DISPLAY */}
                    <h5 className={`text-[var(--green3)] flex items-center gap-2 ${streakClass}`}>
                        <img
                            src={isTodayStreakActive ? StreakOnIcon : StreakOffIcon}
                            className="w-6 h-6"
                        />
                        <span className={isTodayStreakActive ? "text-[var(--green3)]" : "text-[var(--neutral3)]"}>
                            {streakDays} {streakDays === 1 ? 'day' : 'days'}
                        </span>
                    </h5>

                    {/* GOAL PROGRESS BAR */}
                    <div className={`flex flex-col justify-end w-full ${goalClass}`}>
                        <div className="flex justify-end w-full">
                            <h5>{progressInt}%</h5>
                        </div>

                        <div className="w-full h-2.5 bg-[var(--neutral1)] rounded-full">
                            <div
                                className="h-full bg-[var(--green3)] rounded-full transition-all duration-300"
                                style={{ width: `${progressInt}%` }}
                            ></div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default TrackerCard;
