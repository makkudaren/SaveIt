// WithdrawForm.jsx
// -----------------------------------------------------------------------------
// PRIMARY PURPOSE:
// Handles user withdrawals from a selected tracker and submits a live backend
// transaction. Includes client-side validation, user lookup, and status
// reporting back to the parent component.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { 
    getCurrentUser, 
    getUserProfile, 
    processTrackerTransaction 
} from "../services/DatabaseControl";

// Component receives:
// - show: controls visibility of the modal
// - onClose: parent callback to close modal
// - onSuccess: parent callback that receives transaction outcome
// - tracker: full tracker object with live balance and configuration
function WithdrawForm({ show, onClose, onSuccess, tracker }) {

    // User-input fields
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");

    // Username of the contributor performing the withdrawal
    const [contributorUsername, setContributorUsername] = useState("Loading...");

    // Loading state for transaction submission
    const [isProcessing, setIsProcessing] = useState(false);

    // Extract relevant tracker details
    const trackerName = tracker?.tracker_name || "N/A";
    const trackerBalance = tracker?.balance || 0;

    // Display today's date in human-friendly format
    const dateToday = new Date().toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
    });

    // -------------------------------------------------------------------------
    // LOAD CURRENT USERNAME
    // Retrieves logged-in user's profile to display contributor information.
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

    // Do not render modal if not visible or tracker data missing
    if (!show || !tracker) return null;

    // -------------------------------------------------------------------------
    // SUBMIT HANDLER — PROCESSES WITHDRAWAL TRANSACTION
    // Validates amount, checks balance locally, sends request to backend RPC.
    // Resets fields and notifies parent of transaction result.
    // -------------------------------------------------------------------------
    async function submitTransaction(e) {
        e.preventDefault();

        const finalAmount = parseFloat(amount);
        if (isNaN(finalAmount) || finalAmount <= 0) {
            alert("Please enter a valid withdrawal amount.");
            return;
        }

        // Local validation to avoid unnecessary RPC calls
        if (finalAmount > trackerBalance) {
            alert(`Withdrawal amount ($${finalAmount}) exceeds current balance ($${trackerBalance}).`);
            return;
        }

        setIsProcessing(true);

        const result = await processTrackerTransaction({
            trackerId: tracker.id,
            type: "withdraw",
            amount: finalAmount,
            note: note,
        });

        setIsProcessing(false);

        // Reset input fields after submission
        setAmount("");
        setNote("");

        // Notify parent of success or failure
        if (result.success) {
            onSuccess({
                success: true,
                message: "Withdrawal Successful!",
                trackerId: tracker.id
            });
        } else {
            onSuccess({
                success: false,
                // Provide a cleaner message when backend returns technical text
                message: result.error.includes("Insufficient funds") 
                    ? "Withdrawal Failed: Insufficient funds." 
                    : result.error,
                trackerId: tracker.id
            });
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-white p-8 px-15 w-auto h-auto rounded-3xl shadow-lg flex flex-col">

                {/* CLOSE BUTTON — Closes modal through parent callback */}
                <a onClick={onClose} className="close-icon absolute top-2 right-5">×</a>

                {/* MODAL TITLE */}
                <h3 className="text-xl font-semibold text-center mb-4">Withdraw</h3>

                {/* SCROLLABLE INPUT SECTION */}
                <div className="flex-1 overflow-y-auto p-2">
                    <form onSubmit={submitTransaction}>
                        <div className="flex flex-col gap-5">

                            {/* TRACKER DETAILS — Shows target tracker and live balance */}
                            <div className="flex flex-col gap-1">
                                <h5>Tracker: {trackerName}</h5>
                                <label>Tracker Balance: ${trackerBalance.toLocaleString()}</label>
                            </div>

                            {/* WITHDRAWAL AMOUNT INPUT */}
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
                                    max={trackerBalance} // UI hint for upper limit
                                />
                            </div>

                            {/* OPTIONAL NOTE FIELD */}
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

                            {/* TRANSACTION METADATA — User + Timestamp */}
                            <div className="flex flex-col gap-1 text-[var(--neutral3)]">
                                <label>Contributor: {contributorUsername}</label>
                                <label>Date: {dateToday}</label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* SUBMIT BUTTON — Triggers backend withdrawal process */}
                <button
                    type="submit"
                    onClick={submitTransaction}
                    className="mt-4 w-full py-3 bg-[var(--green0)] text-white rounded-xl"
                    disabled={isProcessing}
                >
                    {isProcessing ? "Processing..." : "Withdraw"}
                </button>

            </div>
        </div>
    );
}

export default WithdrawForm;
