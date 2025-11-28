// EditTrackerForm.jsx
// -----------------------------------------------------------------------------
// Modal form used for editing an existing tracker within the SaveIt system.
//
// IMPORTANT:
// This form is intentionally similar to CreateTrackerForm, but serves a different
// purpose — it is designed *specifically for editing*. When opened, fields will
// eventually be pre-filled based on the tracker selected from the user's list.
//
// NOTE FOR FUTURE DEVELOPMENT:
// - Prefetching and loading existing tracker values (name, streak toggle, goal,
//   contributors, etc.) is still IN PROGRESS.
// - Updating edited tracker data and saving changes to Supabase is also pending.
//
// This version currently focuses on UI behavior, toggles, validation, and
// dynamic calculations, ensuring strong maintainability.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import ToggleSwitch from "./ToggleSwitch";

function EditTrackerForm({ show, onClose }) {

    // -------------------------------------------------------------------------
    // Toggle States
    // Used to enable/disable streaks, goals, or contributors for the tracker.
    //
    // In the final version:
    // These will be set automatically based on the selected tracker.
    // -------------------------------------------------------------------------
    const [streakEnabled, setStreakEnabled] = useState(false);
    const [goalEnabled, setGoalEnabled] = useState(false);
    const [contributionEnabled, setContributionEnabled] = useState(false);

    // -------------------------------------------------------------------------
    // Goal Calculator States
    //
    // These values will be PRE-FILLED based on existing tracker data.
    // Currently initialized as empty; implementation is coming soon.
    // -------------------------------------------------------------------------
    const [goalAmount, setGoalAmount] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [goalDate, setGoalDate] = useState("");
    const [result, setResult] = useState("");
    const [isError, setIsError] = useState(false);

    // -------------------------------------------------------------------------
    // Contributor List
    // Represents all usernames who contribute to this tracker.
    //
    // Will also be populated automatically later, based on the selected tracker.
    // -------------------------------------------------------------------------
    const [contributors, setContributors] = useState([""]);

    // -------------------------------------------------------------------------
    // Goal Calculation Logic (Dynamic Computation)
    //
    // Reactively computes:
    // - required minimum per day (if deadline provided)
    // - number of days needed (if minimum amount provided)
    //
    // Identical to CreateTrackerForm but adapted for the editing context.
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!goalEnabled) {
            setResult("");
            setIsError(false);
            return;
        }

        const goal = parseFloat(goalAmount);

        if (!goal || goal <= 0) {
            setResult("");
            setIsError(false);
            return;
        }

        // MINIMUM AMOUNT CALCULATION
        if (minAmount) {
            const min = parseFloat(minAmount);
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

        // DATE CALCULATION
        if (goalDate) {
            const today = new Date();
            const userDate = new Date(goalDate);
            const diffTime = userDate - today;

            if (diffTime <= 0) {
                setResult("Goal date must be in the future.");
                setIsError(true);
                return;
            }

            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const minPerDay = (goal / daysLeft).toFixed(2);

            setResult(`$${minPerDay} per day, ${daysLeft} days left`);
            setIsError(false);
            return;
        }

        setResult("");
        setIsError(false);
    }, [goalAmount, minAmount, goalDate, goalEnabled]);

    // -------------------------------------------------------------------------
    // Contributor Management Functions
    //
    // These work identically to CreateTrackerForm.
    // Future version will:
    // - Populate contributors automatically when editing begins
    // - Remove or add contributors and update Supabase on save
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
        const updated = [...contributors];
        updated[index] = value;
        setContributors(updated);
    };

    // Prevent rendering when modal is closed
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-white p-8 w-[39em] h-[48em] rounded-3xl shadow-lg flex flex-col">

                {/* CLOSE BUTTON */}
                <a onClick={onClose} className="close-icon absolute top-2 right-5">×</a>

                <h3 className="text-xl font-semibold text-center mb-4">Edit Tracker</h3>

                {/* -------------------------------------------------------------
                    SCROLLABLE FORM SECTION
                    ------------------------------------------------------------- */}
                <div className="flex-1 overflow-y-auto p-2">
                    <form id="edit-tracker-form">
                        <div className="flex flex-row gap-5">

                            {/* -------------------------------------------------
                                LEFT SIDE: Tracker Info + Streak Settings
                                Values will be pre-filled in final version.
                                ------------------------------------------------- */}
                            <div className="//Left flex flex-col">
                                <h5>Tracker Information</h5>

                                {/* TRACKER NAME + DESCRIPTION */}
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

                                {/* BANK & INTEREST */}
                                <div className="flex flex-row gap-5 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <label>Bank Name</label>
                                        <input className="w-65 !h-10 !p-4 !rounded-xl" type="text" />

                                        <label>Interest Rate</label>
                                        <input className="w-65 !h-10 !p-4 !rounded-xl" type="number" placeholder="%" />
                                    </div>
                                </div>

                                {/* STREAKS */}
                                <div className="flex flex-row items-center gap-2 mb-2">
                                    <h5>Tracker Streaks</h5>
                                    <ToggleSwitch value={streakEnabled} onChange={setStreakEnabled} />
                                </div>

                                {/* MINIMUM STREAK AMOUNT */}
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

                                {/* GOAL TOGGLE */}
                                <div className="flex flex-row gap-2">
                                    <h5>Tracker Goal</h5>
                                    <ToggleSwitch value={goalEnabled} onChange={setGoalEnabled} />
                                </div>

                                {/* GOAL INPUTS */}
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

                                    <label>Enter Commitment</label>
                                    <div className="flex flex-row gap-3 w-65 items-center">

                                        {/* MINIMUM AMOUNT */}
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

                                        {/* DATE INPUT */}
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

                                    {/* CALCULATION RESULT */}
                                    <div className="w-65">
                                        <h5
                                            className="!text-sm whitespace-normal"
                                            style={{
                                                color: isError ? "var(--red3)" : "inherit",
                                            }}
                                        >
                                            Result: {result || " "}
                                        </h5>
                                    </div>
                                </div>

                                {/* CONTRIBUTOR TOGGLE */}
                                <div className="flex flex-row gap-2 mb-1">
                                    <h5>Tracker Contributor</h5>
                                    <ToggleSwitch value={contributionEnabled} onChange={setContributionEnabled} />
                                </div>

                                {/* CONTRIBUTOR LIST */}
                                <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hover">
                                    <div className="flex flex-col w-full h-65 pl-2 my-3 gap-1">

                                        <label>Enter Usernames</label>

                                        <ul className="flex flex-col gap-1">
                                            {contributors.map((contributor, index) => (
                                                <div key={index} className="flex flex-row items-center gap-2">

                                                    {/* USERNAME FIELD */}
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

                                                    {/* REMOVE BUTTON */}
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

                                        {/* ADD MORE BUTTON */}
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
                    SAVE BUTTON
                    (Updating tracker in Supabase will be implemented soon)
                    ------------------------------------------------------------- */}
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-3 bg-[var(--green0)] text-white rounded-xl"
                >
                    Edit Tracker
                </button>
            </div>
        </div>
    );
}

export default EditTrackerForm;
