// CreateTrackerForm.jsx
// -----------------------------------------------------------------------------
// Modal form used for creating a new financial tracker inside the SaveIt system.
//
// Core Responsibilities:
// - Render form inputs for tracker information, goal settings,
//   streak automation, and contributor management.
// - Dynamically calculate required minimum daily contribution
//   or required time based on user input.
// - Automatically adjust dependent fields based on toggle state.
// - Provide a clean and maintainable UI for future expansions.
//
// NOTE:
// The function responsible for submitting tracker data to Supabase database
//       >>> is still under development and will be implemented soon. <<<
// This file currently focuses on front-end logic and form behavior.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import ToggleSwitch from "./ToggleSwitch";

function CreateTrackerForm({ show, onClose }) {
    // -------------------------------------------------------------------------
    // TOGGLE STATES
    // Controls which sections of the form are enabled.
    // -------------------------------------------------------------------------
    const [streakEnabled, setStreakEnabled] = useState(false);
    const [goalEnabled, setGoalEnabled] = useState(false);
    const [contributionEnabled, setContributionEnabled] = useState(false);

    // -------------------------------------------------------------------------
    // GOAL CALCULATION STATES
    // goalAmount      → User's target amount
    // minAmount       → Minimum daily contribution
    // goalDate        → Target completion date
    // result          → Computed text result
    // isError         → Controls color formatting of result display
    // -------------------------------------------------------------------------
    const [goalAmount, setGoalAmount] = useState("");
       const [minAmount, setMinAmount] = useState("");
    const [goalDate, setGoalDate] = useState("");
    const [result, setResult] = useState("");
    const [isError, setIsError] = useState(false);

    // -------------------------------------------------------------------------
    // CONTRIBUTOR MANAGEMENT
    // A list of usernames that will collaborate on this tracker.
    // Future expansion can include autocomplete or existing user lookup.
    // -------------------------------------------------------------------------
    const [contributors, setContributors] = useState([""]);

    // -------------------------------------------------------------------------
    // useEffect: Automatic Goal Calculator Logic
    //
    // Reactively calculates:
    // - Minimum daily savings required (if goal date provided)
    // - Number of days needed to finish a goal (if minimum amount provided)
    //
    // Triggers whenever the user interacts with:
    //   goalAmount, minAmount, goalDate, or the goal-enabled toggle.
    //
    // Includes full validation of user inputs.
    // -------------------------------------------------------------------------
    useEffect(() => {
        // If goal feature is disabled → reset calculated values
        if (!goalEnabled) {
            setResult("");
            setIsError(false);
            return;
        }

        const goal = parseFloat(goalAmount);

        // Validate goal amount
        if (!goal || goal <= 0) {
            setResult("");
            setIsError(false);
            return;
        }

        // --- CALCULATION USING MINIMUM DAILY AMOUNT ---
        if (minAmount) {
            const min = parseFloat(minAmount);

            // Validate minimum amount
            if (min <= 0) {
                setResult("Minimum amount must be greater than zero.");
                setIsError(true);
                return;
            }

            const daysNeeded = Math.ceil(goal / min);
            setResult(`${daysNeeded} days to reach goal`);
            setIsError(false);
            return;
        }

        // --- CALCULATION USING DEADLINE DATE ---
        if (goalDate) {
            const today = new Date();
            const userDate = new Date(goalDate);
            const diffTime = userDate - today;

            // Validate date
            if (diffTime <= 0) {
                setResult("Goal date must be in the future.");
                setIsError(true);
                return;
            }

            // Compute time difference
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const minPerDay = (goal / daysLeft).toFixed(2);

            setResult(`$${minPerDay} per day, ${daysLeft} days left`);
            setIsError(false);
            return;
        }

        // No result if no valid inputs
        setResult("");
        setIsError(false);
    }, [goalAmount, minAmount, goalDate, goalEnabled]);

    // -------------------------------------------------------------------------
    // Contributor Management Functions
    // addContributor()    → Adds a new empty username field
    // removeContributor() → Removes a username field unless only one remains
    // updateContributor() → Updates the username at a specific index
    // -------------------------------------------------------------------------

    const addContributor = () => {
        setContributors([...contributors, ""]);
    };

    const removeContributor = (index) => {
        if (contributors.length > 1) {
            setContributors(contributors.filter((_, i) => i !== index));
        }
    };

    const updateContributor = (index, value) => {
        const newContributors = [...contributors];
        newContributors[index] = value;
        setContributors(newContributors);
    };

    // Do not render if modal is closed
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-white p-8 w-[39em] h-[48em] rounded-3xl shadow-lg flex flex-col">

                {/* -------------------------------------------------------------
                    CLOSE BUTTON (Top Right)
                    ------------------------------------------------------------- */}
                <a onClick={onClose} className="close-icon absolute top-2 right-5">×</a>

                <h3 className="text-xl font-semibold text-center mb-4">Create Tracker</h3>

                {/* -------------------------------------------------------------
                    SCROLLABLE FORM SECTION
                    All content inside is scrollable except title and buttons.
                    ------------------------------------------------------------- */}
                <div className="flex-1 overflow-y-auto p-2">
                    <form id="create-tracker-form">

                        {/* MAIN FORM LAYOUT: LEFT + RIGHT SECTIONS */}
                        <div className="flex flex-row gap-5">

                            {/* -------------------------------------------------
                               LEFT SIDE: Tracker Info + Streak Settings
                               ------------------------------------------------- */}
                            <div className="//Left flex flex-col">
                                <h5>Tracker Information</h5>

                                <div className="flex flex-row gap-5 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <label>Tracker Name*</label>
                                        <input className="w-65 !h-10 !p-4 !rounded-xl" type="text" required />

                                        <label>Description</label>
                                        <textarea
                                            className="w-65 !h-25 !p-4 !rounded-xl bg-[var(--neutral0)] resize-none"
                                            placeholder="This tracker is for..."
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-row gap-5 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <label>Bank Name</label>
                                        <input className="w-65 !h-10 !p-4 !rounded-xl" type="text" />

                                        <label>Interest Rate</label>
                                        <input className="w-65 !h-10 !p-4 !rounded-xl" type="number" placeholder="%" />
                                    </div>
                                </div>

                                {/* Streak Feature */}
                                <div className="flex flex-row gap-2 mb-2 items-center">
                                    <h5>Tracker Streaks</h5>
                                    <ToggleSwitch value={streakEnabled} onChange={setStreakEnabled} />
                                </div>

                                {/* Streak Input (toggle-dependent UI) */}
                                <div className="flex flex-col gap-2">
                                    <label>Minimum Streak Amount</label>
                                    <input
                                        className="w-65 !h-10 !p-4 !rounded-xl"
                                        type="number"
                                        placeholder="$"
                                        disabled={!streakEnabled}
                                        style={{
                                            opacity: streakEnabled ? 1 : 0.4,
                                            cursor: streakEnabled ? "text" : "not-allowed",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* -------------------------------------------------
                               RIGHT SIDE: Goal Calculator + Contributors
                               ------------------------------------------------- */}
                            <div className="//Right flex flex-col">

                                {/* Goal Toggle */}
                                <div className="flex flex-row gap-2">
                                    <h5>Tracker Goal</h5>
                                    <ToggleSwitch value={goalEnabled} onChange={setGoalEnabled} />
                                </div>

                                {/* Goal Calculation Section */}
                                <div className="flex flex-col gap-2 mb-3">
                                    <label>Goal Amount</label>
                                    <input
                                        className="w-65 !h-10 !p-4 !rounded-xl"
                                        type="number"
                                        placeholder="$"
                                        disabled={!goalEnabled}
                                        style={{
                                            opacity: goalEnabled ? 1 : 0.4,
                                            cursor: goalEnabled ? "text" : "not-allowed",
                                        }}
                                        value={goalAmount}
                                        onChange={(e) => setGoalAmount(e.target.value)}
                                    />

                                    {/* Commitment Inputs (Mutually Exclusive Fields) */}
                                    <label>Enter Commitment</label>

                                    <div className="flex flex-row gap-3 w-65 items-center">
                                        {/* Minimum Amount Input */}
                                        <input
                                            className="w-full !h-10 !p-4 !rounded-xl"
                                            type="number"
                                            placeholder="$ Min"
                                            disabled={!goalEnabled || goalDate !== ""}
                                            style={{
                                                opacity: (!goalEnabled || goalDate) ? 0.4 : 1,
                                                cursor: (!goalEnabled || goalDate) ? "not-allowed" : "text",
                                            }}
                                            value={minAmount}
                                            onChange={(e) => {
                                                setMinAmount(e.target.value);
                                                setGoalDate("");
                                            }}
                                        />

                                        <h5>or</h5>

                                        {/* Date Input */}
                                        <input
                                            className="!w-30 !h-10 !p-4 !rounded-xl !text-xs text-[var(--neutral2)]"
                                            type="date"
                                            disabled={!goalEnabled || minAmount !== ""}
                                            style={{
                                                opacity: (!goalEnabled || minAmount) ? 0.4 : 1,
                                                cursor: (!goalEnabled || minAmount) ? "not-allowed" : "text",
                                            }}
                                            value={goalDate}
                                            onChange={(e) => {
                                                setGoalDate(e.target.value);
                                                setMinAmount("");
                                            }}
                                        />
                                    </div>

                                    {/* CALCULATION OUTPUT */}
                                    <div className="w-65">
                                        <h5
                                            className="!text-sm whitespace-normal"
                                            style={{ color: isError ? "var(--red3)" : "inherit" }}
                                        >
                                            Result: {result || " "}
                                        </h5>
                                    </div>
                                </div>

                                {/* Contributor Toggle */}
                                <div className="flex flex-row gap-2 mb-1">
                                    <h5>Tracker Contributor</h5>
                                    <ToggleSwitch value={contributionEnabled} onChange={setContributionEnabled} />
                                </div>

                                {/* Contributor Fields */}
                                <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hover">
                                    <div className="flex flex-col w-full h-65 pl-2 my-3 gap-1">
                                        <label>Enter Usernames</label>

                                        <ul className="flex flex-col gap-1">
                                            {contributors.map((contributor, index) => (
                                                <div key={index} className="flex flex-row items-center gap-2">
                                                    {/* Username Input */}
                                                    <input
                                                        className="w-[85%] !h-10 !p-4 !rounded-xl"
                                                        type="text"
                                                        placeholder="@"
                                                        disabled={!contributionEnabled}
                                                        style={{
                                                            opacity: contributionEnabled ? 1 : 0.4,
                                                            cursor: contributionEnabled ? "text" : "not-allowed",
                                                        }}
                                                        value={contributor}
                                                        onChange={(e) => updateContributor(index, e.target.value)}
                                                    />

                                                    {/* Remove Contributor Button */}
                                                    <a
                                                        className="close-icon !text-2xl !text-[var(--neutral2)]"
                                                        onClick={() =>
                                                            contributionEnabled && removeContributor(index)
                                                        }
                                                        style={{
                                                            cursor: contributionEnabled ? "pointer" : "not-allowed",
                                                            opacity: contributionEnabled ? 1 : 0.4,
                                                        }}
                                                    >
                                                        ×
                                                    </a>
                                                </div>
                                            ))}
                                        </ul>

                                        {/* Add Contributor Button */}
                                        <a
                                            className="!text-[var(--neutral2)]"
                                            onClick={contributionEnabled ? addContributor : undefined}
                                            style={{
                                                cursor: contributionEnabled ? "pointer" : "not-allowed",
                                                opacity: contributionEnabled ? 1 : 0.4,
                                            }}
                                        >
                                            add more
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* -------------------------------------------------------------
                    SUBMIT BUTTON (Supabase integration coming soon)
                    ------------------------------------------------------------- */}
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-3 bg-[var(--green0)] text-white rounded-xl"
                >
                    Create Tracker
                </button>
            </div>
        </div>
    );
}

export default CreateTrackerForm;
