// CreateTrackerForm.jsx
// -----------------------------------------------------------------------------
// Modal component responsible for creating a new savings tracker.
//
// High-level Responsibilities:
// - Display all configurable tracker options (base info, streaks, goals,
//   and contributors).
// - Enable or disable sections based on user toggles.
// - Auto-compute goal-related values when goal inputs change.
// - Validate all inputs before allowing submission.
// - Submit the finalized tracker object to the backend service.
// - Reset all form state on close or after successful submission.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { createTracker } from "../services/DatabaseControl";
import ToggleSwitch from "./ToggleSwitch";

// Updated: added onSuccess callback support for parent refresh
function CreateTrackerForm({ show, onClose, onSuccess }) {

    // -------------------------------------------------------------------------
    // FEATURE TOGGLE STATES
    // Controls whether streaks, goals, or contributors sections are active.
    // -------------------------------------------------------------------------
    const [streakEnabled, setStreakEnabled] = useState(false);
    const [goalEnabled, setGoalEnabled] = useState(false);
    const [contributionEnabled, setContributionEnabled] = useState(false);

    // -------------------------------------------------------------------------
    // BASE TRACKER FIELDS
    // Raw user input that describes the tracker itself.
    // -------------------------------------------------------------------------
    const [trackerName, setTrackerName] = useState("");
    const [description, setDescription] = useState("");
       const [bankName, setBankName] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [streakMinAmount, setStreakMinAmount] = useState("");

    // -------------------------------------------------------------------------
    // GOAL CALCULATION FIELDS
    // Stores goal configuration and computed output text.
    // result = human-readable feedback used to guide the user.
    // isError = flags invalid combinations so submission can be blocked.
    // -------------------------------------------------------------------------
    const [goalAmount, setGoalAmount] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [goalDate, setGoalDate] = useState("");
    const [result, setResult] = useState("");
    const [isError, setIsError] = useState(false);

    // -------------------------------------------------------------------------
    // CONTRIBUTOR LIST
    // List of usernames. Always holds at least one empty string to render input.
    // -------------------------------------------------------------------------
    const [contributors, setContributors] = useState([""]);

    // -------------------------------------------------------------------------
    // SUBMISSION STATUS & ERROR MESSAGE
    // Used to disable UI during submission and display validation/server errors.
    // -------------------------------------------------------------------------
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // -------------------------------------------------------------------------
    // EFFECT: Automatic goal calculation
    //
    // Recalculates the summary text whenever any goal-related input changes.
    // Two calculation modes:
    // - User gives min daily amount → compute days needed.
    // - User gives goal date → compute required daily amount.
    //
    // If goal is disabled or inputs are invalid, the result resets.
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

        // Mode 1: Daily minimum → compute days required
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

        // Mode 2: Goal date → compute required daily minimum
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

        // No computation possible yet
        setResult("");
        setIsError(false);
    }, [goalAmount, minAmount, goalDate, goalEnabled]);

    // -------------------------------------------------------------------------
    // CONTRIBUTOR MANIPULATION HELPERS
    // Adding/removing/updating entries in the contributors list.
    // -------------------------------------------------------------------------
    const addContributor = () => {
        setContributors([...contributors, ""]);
    };

    const removeContributor = (index) => {
        // Ensure at least one input remains to avoid an empty UI state.
        if (contributors.length > 1) {
            setContributors(contributors.filter((_, i) => i !== index));
        }
    };

    const updateContributor = (index, value) => {
        const newContributors = [...contributors];
        newContributors[index] = value;
        setContributors(newContributors);
    };

    // -------------------------------------------------------------------------
    // FORM RESET
    // Clears all fields back to initial defaults. Called when closing the modal
    // or after a successful submission.
    // -------------------------------------------------------------------------
    const resetForm = () => {
        setTrackerName("");
        setDescription("");
        setBankName("");
        setInterestRate("");
        setStreakEnabled(false);
        setStreakMinAmount("");
        setGoalEnabled(false);
        setGoalAmount("");
        setMinAmount("");
        setGoalDate("");
        setContributionEnabled(false);
        setContributors([""]);
        setResult("");
        setIsError(false);
        setSubmitError("");
    };

    // -------------------------------------------------------------------------
    // FORM VALIDATION
    // Performs synchronous validation before sending data to backend.
    // - Ensures required fields are filled.
    // - Ensures values make sense given enabled features.
    // - Blocks submission when goal calculation reports errors.
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

            // At least one goal input must be chosen
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
            const validContributors = contributors.filter(c => c.trim() !== "");
            if (validContributors.length === 0) {
                setSubmitError("Please add at least one contributor or disable contributors.");
                return false;
            }
        }

        setSubmitError("");
        return true;
    };

    // -------------------------------------------------------------------------
    // SUBMISSION HANDLER
    // Prepares the payload, sends it to the backend, and handles response.
    // On success: resets form, closes modal, and notifies parent via onSuccess.
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const trackerData = {
                trackerName: trackerName.trim(),
                description: description.trim() || null,
                bankName: bankName.trim() || null,
                interestRate: interestRate ? parseFloat(interestRate) : null,
                streakEnabled,
                streakMinAmount: streakEnabled && streakMinAmount ? parseFloat(streakMinAmount) : null,
                goalEnabled,
                goalAmount: goalEnabled && goalAmount ? parseFloat(goalAmount) : null,
                minDailyAmount: goalEnabled && minAmount ? parseFloat(minAmount) : null,
                goalDate: goalEnabled && goalDate ? goalDate : null,
                contributors: contributionEnabled ? contributors.filter(c => c.trim() !== "") : []
            };

            const response = await createTracker(trackerData);

            if (response.success) {
                resetForm();
                onClose();

                // Notify parent so it can refresh tracker list
                if (onSuccess) {
                    onSuccess({ action: "create", trackerId: response.trackerId });
                }
            } else {
                setSubmitError(response.error || "Failed to create tracker. Please try again.");
            }
        } catch (error) {
            console.error("Error creating tracker:", error);
            setSubmitError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // -------------------------------------------------------------------------
    // CLOSE HANDLER
    // Prevents closing while submission is in progress; otherwise resets form.
    // -------------------------------------------------------------------------
    const handleClose = () => {
        if (!isSubmitting) {
            resetForm();
            onClose();
        }
    };

    // Do not render anything when modal is hidden.
    if (!show) return null;
    
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-white p-8 w-[39em] h-[48em] rounded-3xl shadow-lg flex flex-col">

                {/* CLOSE BUTTON */}
                <a 
                    onClick={handleClose} 
                    className="close-icon absolute top-2 right-5"
                    style={{ cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.5 : 1 }}
                >
                    ×
                </a>

                <h3 className="text-xl font-semibold text-center mb-4">Create Tracker</h3>

                {/* ERROR MESSAGE DISPLAY */}
                {submitError && (
                    <div className="mb-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
                        {submitError}
                    </div>
                )}

                {/* SCROLLABLE FORM SECTION */}
                <div className="flex-1 overflow-y-auto p-2">
                    <form id="create-tracker-form" onSubmit={handleSubmit}>

                        <div className="flex flex-row gap-5">

                            {/* LEFT SIDE */}
                            <div className="//Left flex flex-col">
                                <h5>Tracker Information</h5>

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

                                {/* Streak Feature */}
                                <div className="flex flex-row gap-2 mb-2 items-center">
                                    <h5>Tracker Streaks</h5>
                                    <ToggleSwitch 
                                        value={streakEnabled} 
                                        onChange={setStreakEnabled}
                                        disabled={isSubmitting}
                                    />
                                </div>

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

                            {/* RIGHT SIDE */}
                            <div className="//Right flex flex-col">

                                {/* Goal Toggle */}
                                <div className="flex flex-row gap-2">
                                    <h5>Tracker Goal</h5>
                                    <ToggleSwitch 
                                        value={goalEnabled} 
                                        onChange={setGoalEnabled}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Goal Calculation Section */}
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
                                    <ToggleSwitch 
                                        value={contributionEnabled} 
                                        onChange={setContributionEnabled}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Contributor Fields */}
                                <div className="flex flex-col gap-2 overflow-y-auto scrollbar-hover">
                                    <div className="flex flex-col w-full h-65 pl-2 my-3 gap-1">
                                        <label>Enter Usernames</label>

                                        <ul className="flex flex-col gap-1">
                                            {contributors.map((contributor, index) => (
                                                <div key={index} className="flex flex-row items-center gap-2">
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

                {/* SUBMIT BUTTON */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="mt-4 w-full py-3 bg-[var(--green0)] text-white rounded-xl"
                    style={{
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        opacity: isSubmitting ? 0.6 : 1
                    }}
                >
                    {isSubmitting ? "Creating..." : "Create Tracker"}
                </button>
            </div>
        </div>
    );
}

export default CreateTrackerForm;