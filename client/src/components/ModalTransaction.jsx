// ModalTransaction.jsx - UPDATED FOR CUSTOM ERROR MESSAGES
// -----------------------------------------------------------------------------
// PRIMARY FUNCTION:
// This component displays a transaction result modal.
// -----------------------------------------------------------------------------

import React from "react";
import CheckIcon from "../assets/icons/checkmark-circle-outline.svg?react"; 
import ErrorIcon from "../assets/icons/alert-circle-outline.svg?react"; 

// NEW PROP: transactionMessage is used for custom failure messages
function ModalTransaction({ show, type, status, trackerName, onClose, transactionMessage }) {
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

    // Use the custom message if provided, otherwise fall back to a generic one
    const failSubMsg = transactionMessage && !isSuccess 
        ? transactionMessage 
        : "Something went wrong. Please try again."; 

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

                {/* SUB MESSAGE (Will display custom error here) */}
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

FAILED DISPLAY WITH CUSTOM MESSAGE:
<ModalTransaction
    show={show}
    type="withdraw"
    status="failed"
    trackerName="LandBank Account"
    transactionMessage="Insufficient funds. Current balance is $50.00" // NEW
    onClose={() => setShow(false)}
/>
----------------------------------------------------------------------------- */