// EditTrackerForm.jsx
// -----------------------------------------------------------------------------
// Modal component for updating an existing tracker in the SaveIt system.
//
// NOTE:
// This form is structurally similar to CreateTrackerForm, but it is dedicated
// specifically to editing. When opened, the form fields are pre-populated using
// the tracker object provided by the caller.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import ToggleSwitch from "./ToggleSwitch";
import LoadingScreen from "./LoadingMode";
import { updateTracker, getTrackerContributors } from "../services/DatabaseControl";

// Receives: show (boolean), onClose handler, tracker object, and success callback.
function EditTrackerForm({ show, onClose, tracker, onSuccess }) { 

    // -------------------------------------------------------------------------
    // FORM FIELD STATES
    // -------------------------------------------------------------------------
    // Initialized empty; actual values are loaded when the modal opens.
    const [trackerName, setTrackerName] = useState("");
    const [description, setDescription] = useState("");
    const [bankName, setBankName] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [streakMinAmount, setStreakMinAmount] = useState("");
    
    // -------------------------------------------------------------------------
    // FEATURE TOGGLE STATES
    // -------------------------------------------------------------------------
    const [streakEnabled, setStreakEnabled] = useState(false);
    const [goalEnabled, setGoalEnabled] = useState(false);
       const [contributionEnabled, setContributionEnabled] = useState(false);

    // -------------------------------------------------------------------------
    // GOAL CALCULATOR STATES
    // -------------------------------------------------------------------------
    const [goalAmount, setGoalAmount] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [goalDate, setGoalDate] = useState("");
    const [result, setResult] = useState("");
    const [isError, setIsError] = useState(false);

    // -------------------------------------------------------------------------
    // CONTRIBUTOR STATE
    // -------------------------------------------------------------------------
    // Will hold usernames of collaborators tied to this tracker.
    const [contributors, setContributors] = useState([""]);
    
    // -------------------------------------------------------------------------
    // SUBMISSION + LOADING STATES
    // -------------------------------------------------------------------------
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // -------------------------------------------------------------------------
    // 1. Load data when modal opens and pre-fill form values
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!show || !tracker) {
            setIsLoading(false);
            return;
        }

        const loadTrackerData = async () => {
            setIsLoading(true);
            setSubmitError("");

            // Preload basic tracker fields
            setTrackerName(tracker.tracker_name || "");
            setDescription(tracker.description || "");
            setBankName(tracker.bank_name || "");
            setInterestRate(tracker.interest_rate?.toString() || "");

            // Preload streak values
            setStreakEnabled(tracker.streak_enabled || false);
            setStreakMinAmount(tracker.streak_min_amount?.toString() || "");

            // Preload goal values
            setGoalEnabled(tracker.goal_enabled || false);
            setGoalAmount(tracker.goal_amount?.toString() || "");
            setMinAmount(tracker.min_daily_amount?.toString() || "");
            setGoalDate(tracker.goal_date || "");

            // Load contributors from database
            const { data, error } = await getTrackerContributors(tracker.id);

            if (error) {
                console.error("Error fetching contributors:", error);
                setContributionEnabled(false);
                setContributors([""]);
            } else {
                const usernames = data.map(c => c.username);

                if (usernames.length > 0) {
                    setContributionEnabled(true);
                    setContributors(usernames);
                } else {
                    setContributionEnabled(false);
                    setContributors([""]);
                }
            }

            setIsLoading(false);
        };

        loadTrackerData();

        // Reset calculator state when switching trackers
        setResult("");
        setIsError(false);

    }, [show, tracker]);

    // -------------------------------------------------------------------------
    // 2. Goal Calculation Logic
    // Mirrors CreateTrackerForm logic and reacts to goal input changes.
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

        // Calculation by minimum daily amount
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

        // Calculation by target date
        if (goalDate) {
            const today = new Date();
            const userDate = new Date(goalDate);
            const diff = userDate - today;

            if (diff <= 0) {
                setResult("Goal date must be in the future.");
                setIsError(true);
                return;
            }

            const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
            const minPerDay = (goal / daysLeft).toFixed(2);
            setResult(`$${minPerDay} per day, ${daysLeft} days left`);
            setIsError(false);
            return;
        }

        // No inputs → clear result
        setResult("");
        setIsError(false);
    }, [goalAmount, minAmount, goalDate, goalEnabled]);


    // -------------------------------------------------------------------------
    // 3. Contributor List Handlers
    // Identical logic used in CreateTrackerForm.
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

    // -------------------------------------------------------------------------
    // 4. Validation before submitting update request
    // -------------------------------------------------------------------------
    const validateForm = () => {
        if (!trackerName.trim()) {
            setSubmitError("Tracker name is required.");
            return false;
        }

        if (streakEnabled && (!streakMinAmount || parseFloat(streakMinAmount) <= 0)) {
            setSubmitError("Please enter a valid minimum streak amount.");
            return false;
        }

        if (goalEnabled) {
            if (!goalAmount || parseFloat(goalAmount) <= 0) {
                setSubmitError("Please enter a valid goal amount.");
                return false;
            }

            if (!minAmount && !goalDate) {
                setSubmitError("Please enter either a minimum daily amount or a goal date.");
                return false;
            }

            if (isError) {
                setSubmitError("Please fix the goal calculation errors.");
                return false;
            }
        }

        if (contributionEnabled) {
            const valid = contributors.filter(c => c.trim() !== "");
            if (valid.length === 0) {
                setSubmitError("Please add at least one contributor or disable contributors.");
                return false;
            }
        }

        setSubmitError("");
        return true;
    };


    // -------------------------------------------------------------------------
    // 5. Handle update submission and send data to database
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!tracker?.id) {
            setSubmitError("Tracker data not loaded. Cannot save.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const trackerData = {
                trackerId: tracker.id,
                trackerName: trackerName.trim(),
                description: description.trim() || null,
                bankName: bankName.trim() || null,
                interestRate: interestRate ? parseFloat(interestRate) : null,
                streakEnabled,
                streakMinAmount: streakEnabled ? parseFloat(streakMinAmount) : null,
                goalEnabled,
                goalAmount: goalEnabled ? parseFloat(goalAmount) : null,
                minDailyAmount: goalEnabled && minAmount ? parseFloat(minAmount) : null,
                goalDate: goalEnabled && goalDate ? goalDate : null,
                contributors: contributionEnabled ? contributors.filter(c => c.trim() !== "") : []
            };

            const response = await updateTracker(trackerData);

            if (response.success) {
                onSuccess();
            } else {
                setSubmitError(response.error || "Failed to update tracker. Please try again.");
            }
        } catch (error) {
            console.error("Error updating tracker:", error);
            setSubmitError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Prevent rendering before data is ready
    if (!show || !tracker) return null;

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="bg-white p-8 w-[39em] h-[48em] rounded-3xl shadow-lg flex justify-center items-center">
                    <LoadingScreen text={"Loading Tracker Data..."}/>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-white p-8 w-[39em] h-[48em] rounded-3xl shadow-lg flex flex-col">

                {/* CLOSE BUTTON */}
                <a onClick={onClose} className="close-icon absolute top-2 right-5">×</a>

                <h3 className="text-xl font-semibold text-center mb-4">Edit Tracker</h3>
                
                {/* ERROR MESSAGE DISPLAY */}
                {submitError && (
                    <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                        {submitError}
                    </div>
                )}


                {/* -------------------------------------------------------------
                    SCROLLABLE FORM SECTION
                    ------------------------------------------------------------- */}
                <div className="flex-1 overflow-y-auto p-2">
                    <form id="edit-tracker-form" onSubmit={handleSubmit}>
                        <div className="flex flex-row gap-5">

                            {/* -------------------------------------------------
                                LEFT SIDE: Tracker Info + Streak Settings
                                ------------------------------------------------- */}
                            <div className="//Left flex flex-col">
                                <h5>Tracker Information</h5>

                                {/* TRACKER NAME + DESCRIPTION */}
                                <div className="flex flex-row gap-5 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <label>Tracker Name*</label>
                                        <input 
                                            className="w-65 !h-10 !p-4 !rounded-xl" 
                                            type="text" 
                                            required 
                                            value={trackerName}
                                            onChange={(e) => setTrackerName(e.target.value)}
                                            disabled={isSubmitting}
                                        />

                                        <label>Description</label>
                                        <textarea
                                            className="w-65 !h-25 !p-4 !rounded-xl bg-[var(--neutral0)] resize-none"
                                            placeholder="This tracker is for..."
                                            rows={3}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* BANK & INTEREST */}
                                <div className="flex flex-row gap-5 mb-2">
                                    <div className="flex flex-col gap-2">
                                        <label>Bank Name</label>
                                        <input 
                                            className="w-65 !h-10 !p-4 !rounded-xl" 
                                            type="text" 
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            disabled={isSubmitting}
                                        />

                                        <label>Interest Rate</label>
                                        <input 
                                            className="w-65 !h-10 !p-4 !rounded-xl" 
                                            type="number" 
                                            placeholder="%" 
                                            value={interestRate}
                                            onChange={(e) => setInterestRate(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                {/* STREAKS */}
                                <div className="flex flex-row items-center gap-2 mb-2">
                                    <h5>Tracker Streaks</h5>
                                    <ToggleSwitch 
                                        value={streakEnabled} 
                                        onChange={setStreakEnabled} 
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* MINIMUM STREAK AMOUNT */}
                                <div className="flex flex-col gap-2">
                                    <label>Minimum Streak Amount</label>
                                    <input
                                        className="w-65 !h-10 !p-4 !rounded-xl"
                                        type="number"
                                        placeholder="$"
                                        value={streakMinAmount}
                                        onChange={(e) => setStreakMinAmount(e.target.value)}
                                        disabled={!streakEnabled || isSubmitting}
                                        style={{
                                            opacity: streakEnabled && !isSubmitting ? 1 : 0.4,
                                            cursor: streakEnabled && !isSubmitting ? "text" : "not-allowed",
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
                                    <ToggleSwitch 
                                        value={goalEnabled} 
                                        onChange={setGoalEnabled} 
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* GOAL INPUTS */}
                                <div className="flex flex-col gap-2 mb-3">
                                    <label>Goal Amount</label>
                                    <input
                                        className="w-65 !h-10 !p-4 !rounded-xl"
                                        type="number"
                                        placeholder="$"
                                        disabled={!goalEnabled || isSubmitting}
                                        style={{
                                            opacity: goalEnabled && !isSubmitting ? 1 : 0.4,
                                            cursor: goalEnabled && !isSubmitting ? "text" : "not-allowed",
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
                                            disabled={!goalEnabled || goalDate !== "" || isSubmitting}
                                            style={{
                                                opacity: (!goalEnabled || goalDate || isSubmitting) ? 0.4 : 1,
                                                cursor: (!goalEnabled || goalDate || isSubmitting) ? "not-allowed" : "text",
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
                                            disabled={!goalEnabled || minAmount !== "" || isSubmitting}
                                            style={{
                                                opacity: (!goalEnabled || minAmount || isSubmitting) ? 0.4 : 1,
                                                cursor: (!goalEnabled || minAmount || isSubmitting) ? "not-allowed" : "text",
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
                                    <ToggleSwitch 
                                        value={contributionEnabled} 
                                        onChange={setContributionEnabled}
                                        disabled={isSubmitting}
                                    />
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
                                                        disabled={!contributionEnabled || isSubmitting}
                                                        style={{
                                                            opacity: contributionEnabled && !isSubmitting ? 1 : 0.4,
                                                            cursor: contributionEnabled && !isSubmitting ? "text" : "not-allowed",
                                                        }}
                                                        value={contributor}
                                                        onChange={(e) => updateContributor(index, e.target.value)}
                                                    />

                                                    {/* REMOVE BUTTON */}
                                                    <a
                                                        className="close-icon !text-2xl !text-[var(--neutral2)]"
                                                        onClick={() =>
                                                            contributionEnabled && !isSubmitting && removeContributor(index)
                                                        }
                                                        style={{
                                                            cursor: contributionEnabled && !isSubmitting ? "pointer" : "not-allowed",
                                                            opacity: contributionEnabled && !isSubmitting ? 1 : 0.4,
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
                                            onClick={contributionEnabled && !isSubmitting ? addContributor : undefined}
                                            style={{
                                                cursor: contributionEnabled && !isSubmitting ? "pointer" : "not-allowed",
                                                opacity: contributionEnabled && !isSubmitting ? 1 : 0.4,
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
                    ------------------------------------------------------------- */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="mt-4 w-full py-3 bg-[var(--green0)] text-white rounded-xl btn-3D"
                    style={{
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        opacity: isSubmitting ? 0.6 : 1
                    }}
                >
                    {isSubmitting ? "Saving Changes..." : "Edit Tracker"}
                </button>
            </div>
        </div>
    );
}

export default EditTrackerForm;