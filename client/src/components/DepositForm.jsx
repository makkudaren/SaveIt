// DepositForm.jsx
// -----------------------------------------------------------------------------
// PRIMARY PURPOSE:
// Handles user deposits into a selected tracker and submits the deposit as a
// live backend transaction. The component receives a live tracker object,
// validates user input, and triggers a parent callback upon success or failure.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { 
    getCurrentUser, 
    getUserProfile, 
    processTrackerTransaction 
} from "../services/DatabaseControl";

// Component receives:
// - show: boolean flag to display or hide the modal
// - onClose: parent callback to close modal
// - onSuccess: parent callback to report transaction status
// - tracker: full tracker object supplied by parent (live data)
function DepositForm({ show, onClose, onSuccess, tracker }) {

    // User-input fields
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    // Username of the contributor performing the deposit
    const [contributorUsername, setContributorUsername] = useState("Loading...");

    // Loading indicator for transaction processing
    const [isProcessing, setIsProcessing] = useState(false);

    // Extract live tracker details
    const trackerName = tracker?.tracker_name || "N/A";
    const streakMinimum = tracker?.streak_min_amount || 0;

    // Display today's date in a readable format
    const dateToday = new Date().toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
    });

    // -------------------------------------------------------------------------
    // LOAD CURRENT USERNAME
    // Fetches the currently logged-in user's profile and sets contributor name.
    // -------------------------------------------------------------------------
    useEffect(() => {
        async function fetchUsername() {
            const userResult = await getCurrentUser();

            if (userResult.user) {
                const profileResult = await getUserProfile(userResult.user.id);

                if (profileResult.data?.username) {
                    setContributorUsername(profileResult.data.username);
                } else {
                    setContributorUsername("Unknown User");
                }
            }
        }

        fetchUsername();
    }, []);

    // Do not render if form is hidden or no tracker provided
    if (!show || !tracker) return null;

    // -------------------------------------------------------------------------
    // SUBMIT HANDLER — PROCESSES DEPOSIT TRANSACTION
    // Validates user input, submits to backend, resets fields, and notifies parent.
    // -------------------------------------------------------------------------
    async function submitTransaction(e) {
        e.preventDefault();

        const finalAmount = parseFloat(amount);
        if (isNaN(finalAmount) || finalAmount <= 0) {
            alert("Please enter a valid deposit amount.");
            return;
        }

        setIsProcessing(true);

        const result = await processTrackerTransaction({
            trackerId: tracker.id,
            type: "deposit",
            amount: finalAmount,
            note: note,
        });

        setIsProcessing(false);

        // Clear input fields after submission
        setAmount("");
        setNote("");

        // Report success or failure to parent component
        if (result.success) {
            onSuccess({
                success: true,
                message: "Deposit Successful!",
                trackerId: tracker.id
            });
        } else {
            onSuccess({
                success: false,
                message: result.error || "Deposit Failed due to an unknown error.",
                trackerId: tracker.id
            });
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-white p-8 px-15 w-auto h-auto rounded-3xl shadow-lg flex flex-col">

                {/* CLOSE BUTTON — Closes modal via parent callback */}
                <a onClick={onClose} className="close-icon absolute top-2 right-5">×</a>

                <h3 className="text-xl font-semibold text-center mb-4">Deposit</h3>

                {/* INPUT SECTION — Scrollable container for form fields */}
                <div className="flex-1 overflow-y-auto p-2">
                    <form onSubmit={submitTransaction}>
                        <div className="flex flex-col gap-5">

                            {/* TRACKER DETAILS — Displays target tracker name and settings */}
                            <div className="flex flex-col gap-1">
                                <h5>Tracker: {trackerName}</h5>

                                {/* Shows streak minimum only if streaks are enabled */}
                                {tracker.streak_enabled && (
                                    <label>Streak Minimum: ${streakMinimum}</label>
                                )}
                            </div>

                            {/* DEPOSIT AMOUNT INPUT */}
                            <div className="flex flex-col gap-1">
                                <label>Enter Amount</label>
                                <input
                                    className="!w-full !h-10 !p-4 !rounded-xl"
                                    type="number"
                                    placeholder="$"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>

                            {/* OPTIONAL NOTE / MESSAGE FIELD */}
                            <div className="flex flex-col gap-1">
                                <label>Optional Message</label>
                                <textarea
                                    className="!w-full !h-25 !p-4 !rounded-xl bg-[var(--neutral0)] resize-none"
                                    placeholder="Notes about this transaction..."
                                    rows={3}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>

                            {/* METADATA — Displays contributor identity and timestamp */}
                            <div className="flex flex-col gap-1 text-[var(--neutral3)]">
                                <label>Contributor: {contributorUsername}</label>
                                <label>Date: {dateToday}</label>
                            </div>

                        </div>
                    </form>
                </div>

                {/* SUBMIT BUTTON — Triggers deposit transaction */}
                <button
                    type="submit"
                    onClick={submitTransaction}
                    className="mt-4 w-full py-3 bg-[var(--green0)] text-white rounded-xl btn-3D"
                    disabled={isProcessing}
                >
                    {isProcessing ? "Processing..." : "Deposit"}
                </button>

            </div>
        </div>
    );
}

export default DepositForm;
