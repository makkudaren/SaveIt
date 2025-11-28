// ModalTransaction.jsx
// -----------------------------------------------------------------------------
// PRIMARY FUNCTION:
// This component displays a **transaction result modal** after a Deposit or
// Withdraw action. It is triggered by the parent tracker view (Tracker.jsx)
// immediately after DepositForm or WithdrawForm calls onSuccess().
//
// It provides clear feedback to the user through:
//   - Dynamic title (Deposit / Withdraw)
//   - Success or error icon
//   - Contextual messages (e.g., "Deposit Successful!")
//   - Tracker name reference
//
// CURRENT STATE (LEGACY VERSION):
// - Displays UI feedback only.
// - Does NOT reflect actual database results yet.
// - Success/failed state is entirely controlled by props coming from the parent.
//
// FUTURE IMPLEMENTATION:
// - Integrate with backend validation once Supabase transactions are functional.
// - Expand to support multiple error types (insufficient funds, unauthorized,
//   connection failure, validation errors, etc.).
// - Could be extended to auto-close after a timer.
// - Could also include transaction ID once backend generates one.
//
//
// Display-only modal; no business logic is processed here.
// -----------------------------------------------------------------------------

import React from "react";
import CheckIcon from "../assets/icons/checkmark-circle-outline.svg?react"; 
import ErrorIcon from "../assets/icons/alert-circle-outline.svg?react"; 

function ModalTransaction({ show, type, status, trackerName, onClose }) {
    // Prevent modal from rendering unless activated
    if (!show) return null;

    // -------------------------------------------------------------------------
    // LOGIC: Determine modal state
    // -------------------------------------------------------------------------
    const isDeposit = type === "deposit";      // Deposit or Withdraw
    const isSuccess = status === "success";    // Success or Failed

    // Title displayed at the top of the modal
    const title = isDeposit ? "Deposit" : "Withdraw";

    // SUCCESS messages
    const successMainMsg = isDeposit
        ? "Deposit Successful!"
        : "Withdraw Successful!";

    const successSubMsg = isDeposit
        ? "Streak Updated!"
        : "Balance Updated!";

    // FAILED messages
    const failMainMsg = isDeposit
        ? "Deposit Failed!"
        : "Withdraw Failed!";

    const failSubMsg = "Something went wrong. Please try again.";

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">

            {/* MAIN MODAL WRAPPER */}
            <div className="bg-white p-8 w-[22em] rounded-3xl shadow-xl flex flex-col items-center gap-4 relative">

                {/* CLOSE BUTTON */}
                <a onClick={onClose} className="close-icon absolute top-2 right-5">×</a>

                {/* TITLE */}
                <h2 className="text-[1.6rem] font-semibold">{title}</h2>

                {/* TRACKER NAME LABEL */}
                <p className="text-[var(--neutral2)] text-center text-sm">
                    Tracker: {trackerName}
                </p>

                {/* STATUS ICON — Success (green) or Error (red) */}
                <div className="w-28 h-28 flex justify-center items-center">
                    {isSuccess ? (
                        <CheckIcon className="w-full h-full fill-[var(--green3)]" />
                    ) : (
                        <ErrorIcon className="w-full h-full fill-[var(--red3)]" />
                    )}
                </div>

                {/* MAIN MESSAGE */}
                <p className="font-medium text-lg text-center">
                    {isSuccess ? successMainMsg : failMainMsg}
                </p>

                {/* SUB MESSAGE */}
                <p className="text-[var(--neutral2)] text-center">
                    {isSuccess ? successSubMsg : failSubMsg}
                </p>
            </div>
        </div>
    );
}

export default ModalTransaction;

/* -----------------------------------------------------------------------------
USAGE EXAMPLES (FOR DOCUMENTATION):

SUCCESS DISPLAY:
<ModalTransaction
    show={show}
    type="deposit"
    status="success"
    trackerName="Insurance Pru Life UK"
    onClose={() => setShow(false)}
/>

FAILED DISPLAY:
<ModalTransaction
    show={show}
    type="withdraw"
    status="failed"
    trackerName="LandBank Account"
    onClose={() => setShow(false)}
/>

NOTES:
- These examples are meant for developers integrating this component.
- 'type' and 'status' values should come from real transaction logic once database
  operations are implemented in DepositForm, WithdrawForm, and Tracker.jsx.
----------------------------------------------------------------------------- */
