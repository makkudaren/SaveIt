// GoalCalculator.jsx
// -----------------------------------------------------------------------------
// Standalone goal calculator modal used for financial planning.
//
// PURPOSE:
// Unlike the CreateTrackerForm and EditTrackerForm versions,
// this component is NOT tied to any specific tracker.
// It functions as an independent utility tool that users can open and use
// ANYTIME for calculating timelines or required daily contributions.
//
// It shares the same goal-calculation logic as the tracker forms, but does not
// modify or read any tracker data. It exists purely for user convenience.
// -----------------------------------------------------------------------------
// Core Features:
// - Accepts a target goal amount
// - Allows user to choose: minimum daily contribution OR deadline date
// - Dynamically computes days needed OR required daily savings
// - Provides inline validation and error messages
// - Resets all values upon closing the modal
//
// NOTE: This is intentionally separate from creation/editing forms to ensure
// the user can freely experiment and plan without affecting existing trackers.
// -----------------------------------------------------------------------------

import React, { useState } from "react";

function GoalCalculator({ show, onClose }) {

    // -------------------------------------------------------------------------
    // INPUT STATES
    // These are independent values used ONLY for planning purposes.
    // -------------------------------------------------------------------------
    const [goalAmount, setGoalAmount] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [goalDate, setGoalDate] = useState("");
    const [result, setResult] = useState("");
    const [isError, setIsError] = useState(false);

    // Do not render if modal closed
    if (!show) return null;

    // -------------------------------------------------------------------------
    // resetAll()
    // Clears all fields whenever the calculator is closed.
    //
    // Helps keep user experience clean by avoiding leftover values
    // from previous calculations.
    // -------------------------------------------------------------------------
    function resetAll() {
        setGoalAmount("");
        setMinAmount("");
        setGoalDate("");
        setResult("");
        setIsError(false);
    }

    // -------------------------------------------------------------------------
    // handleCalculate()
    // Main computation logic triggered when user clicks "Calculate"
    // OR presses the Enter key.
    //
    // Follows the same decision tree used in tracker goal calculators:
    //   - If user enters minimum contribution → compute days needed
    //   - If user enters deadline date → compute minimum contribution required
    //   - If neither is provided → show warning
    //
    // This logic is intentionally very similar to Create/Edit forms
    // to maintain consistency across user experience.
    // -------------------------------------------------------------------------
    function handleCalculate(e) {
        if (e) e.preventDefault(); // Enables Enter key form submission

        const goal = parseFloat(goalAmount);

        // Validate goal amount
        if (!goal || goal <= 0) {
            setResult("Please enter a valid goal amount.");
            setIsError(true);
            return;
        }

        // --- CALCULATION USING MIN AMOUNT ---
        if (minAmount) {
            const min = parseFloat(minAmount);
            if (min <= 0) {
                setResult("Minimum amount must be greater than zero.");
                setIsError(true);
                return;
            }

            const daysNeeded = Math.ceil(goal / min);
            setResult(`You need ${daysNeeded} days to reach your goal.`);
            setIsError(false);
            return;
        }

        // --- CALCULATION USING A FUTURE DATE ---
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

            setResult(
                `You have ${daysLeft} days left. Save $${minPerDay} per day to reach your goal.`
            );
            setIsError(false);
            return;
        }

        // If user provided neither min amount nor date
        setResult("Please enter either a minimum amount or a date.");
        setIsError(true);
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-[var(--green0)] p-8 w-auto h-auto rounded-3xl shadow-lg flex flex-col">

                {/* -----------------------------------------------------------------
                   CLOSE BUTTON
                   Resets calculator values AND closes modal.
                   ----------------------------------------------------------------- */}
                <a
                    onClick={() => { resetAll(); onClose(); }}
                    className="close-icon absolute top-2 right-5"
                >
                    ×
                </a>

                <h3 className="text-xl font-semibold text-center mb-4">
                    Goal Calculator
                </h3>

                {/* -----------------------------------------------------------------
                   FORM WRAPPER
                   Wrapping the inputs in a form allows:
                   - Auto submission via Enter key
                   - Cleaner validation flow
                   ----------------------------------------------------------------- */}
                <form onSubmit={handleCalculate}>

                    <div className="flex flex-row gap-5">

                        {/* LEFT COLUMN (Result + Inputs) */}
                        <div className="flex flex-col gap-5">

                            {/* -------------------------------------------------------------
                                RESULT BOX
                                Shows dynamic output depending on user calculation.
                                ------------------------------------------------------------- */}
                            <div className="bg-[var(--green0)] h-20 w-80 rounded-xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)] flex items-center p-5">
                                <h5
                                    className="!text-lg"
                                    style={{ color: isError ? "var(--red3)" : "var(--neutral2)" }}
                                >
                                    Result: {result || " "}
                                </h5>
                            </div>

                            {/* -------------------------------------------------------------
                                INPUT SECTION
                                Allows user to enter:
                                - goal amount
                                - min amount OR date
                                ------------------------------------------------------------- */}
                            <div className="flex flex-col gap-3">

                                <label>Goal Amount</label>
                                <input
                                    className="w-full !h-10 !p-4 !rounded-xl !bg-[var(--green0)] shadow-sm"
                                    type="number"
                                    placeholder="$"
                                    value={goalAmount}
                                    onChange={(e) => setGoalAmount(e.target.value)}
                                    required
                                />

                                <label>Enter Commitment</label>

                                <div className="flex flex-row gap-3 w-80 items-center">

                                    {/* MINIMUM AMOUNT FIELD */}
                                    <input
                                        className={`w-full !h-10 !p-4 !rounded-xl shadow-sm transition
                                            ${goalDate ? "opacity-40 !bg-[var(--green0)]" : "!bg-[var(--green0)]"}`}
                                        type="number"
                                        placeholder="$ Min"
                                        value={minAmount}
                                        onChange={(e) => {
                                            setMinAmount(e.target.value);
                                            setGoalDate(""); // disable date input
                                        }}
                                    />

                                    <h5>or</h5>

                                    {/* GOAL DATE FIELD */}
                                    <input
                                        className={`w-full !h-10 !p-4 !rounded-xl shadow-sm transition text-[var(--neutral2)]
                                            ${minAmount ? "opacity-40 !bg-[var(--green0)]" : "!bg-[var(--green0)]"}`}
                                        type="date"
                                        value={goalDate}
                                        onChange={(e) => {
                                            setGoalDate(e.target.value);
                                            setMinAmount(""); // disable min amount input
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUBMIT BUTTON — triggers handleCalculate */}
                    <button
                        type="submit"  // Enables Enter key support
                        className="mt-4 w-full py-3 bg-[var(--green0)] text-white rounded-xl btn-3D"
                    >
                        Calculate
                    </button>
                </form>
            </div>
        </div>
    );
}

export default GoalCalculator;
