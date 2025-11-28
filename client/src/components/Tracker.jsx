// Tracker.jsx
// -----------------------------------------------------------------------------
// PRIMARY ROLE:
// This component renders the full details view of a single tracker.
// Currently it uses static placeholder values, but is designed to be connected
// to dynamic Supabase data fetching in the future.
//
// This view appears inside the "Trackers" page and functions as the main
// dashboard for each individual tracker, allowing the user to:
//   - View tracker basic info (name, bank, interest rate)
//   - View financial data (current balance, description)
//   - Perform actions: Deposit, Withdraw, Edit Details
//   - View streak info (active streak, minimum, days left)
//   - View progress bar
//   - Display recent activity (transaction history) — PENDING
//   - Trigger modals: EditTrackerForm, DepositForm, WithdrawForm,
//     and transaction confirmation modal
//
// ARCHITECTURE:
// This component coordinates multiple child modal components and manages state
// transitions between them:
//
//      Tracker
//       ├─ EditTrackerForm (edit details modal)
//       ├─ DepositForm (deposit modal)
//       ├─ WithdrawForm (withdraw modal)
//       └─ ModalTransaction (final success modal)
//
// FUTURE IMPLEMENTATION:
// Database integration will replace static values with:
//    - Tracker metadata (name, bank, interest, etc.)
//    - Balance (sum of deposits - withdrawals)
//    - Streak system values
//    - Progress calculation
//    - Transaction history list
//
// This component is the most important UI piece for tracker management.
// -----------------------------------------------------------------------------

import GlobeIcon from "../assets/icons/globe-outline.svg?react";
import EditIcon from "../assets/icons/edit-2-outline.svg?react";
import streakOnIcon from "../assets/icons/streak-on-indicator.png";
import streakOffIcon from "../assets/icons/streak-off-indicator.png";

import EditTrackerForm from "./EditTrackerForm";
import ModalTransaction from "./ModalTransaction";
import DepositForm from "./DepositForm";
import WithdrawForm from "./WithdrawForm";

import { useState } from "react";

function Tracker() {

    // -------------------------------------------------------------------------
    // STATIC PLACEHOLDERS
    // These will later be replaced with dynamic values from Supabase.
    // Currently needed for UI demonstration and local testing.
    // -------------------------------------------------------------------------
    const trackerName = "Insurance Pru Life UK";
    const bankName = "Pru Life UK";
    const interest = 3.4;
    const balance = 113253.67;
    const description = "For my future expenses and insurance.";
    const streakMinimum = 20;
    const daysLeft = 45;
    const streak = 67;
    const progress = 90;
    const streakActive = true;
    const recentActivity = 2;

    // -------------------------------------------------------------------------
    // MODAL STATE CONTROLLERS
    // The Tracker view manages FOUR major modals:
    //    1. EditTrackerForm
    //    2. DepositForm
    //    3. WithdrawForm
    //    4. ModalTransaction (final success feedback)
    // -------------------------------------------------------------------------
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDepositForm, setShowDepositForm] = useState(false);
    const [showWithdrawForm, setShowWithdrawForm] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);

    // Tracks the type of transaction & tracker involved for the success modal.
    const [transactionConfig, setTransactionConfig] = useState({
        type: "",
        status: "",
        trackerName: trackerName
    });

    return (
        <>
            {/* -----------------------------------------------------------------
               FINAL FEEDBACK MODAL (Deposit/Withdraw success)
               ----------------------------------------------------------------- */}
            <ModalTransaction
                show={showTransactionModal}
                type={transactionConfig.type}
                status={transactionConfig.status}
                trackerName={transactionConfig.trackerName}
                onClose={() => setShowTransactionModal(false)}
            />

            {/* EDIT TRACKER DETAILS MODAL */}
            <EditTrackerForm
                show={showEditForm}
                onClose={() => setShowEditForm(false)}
            />

            {/* DEPOSIT FORM */}
            <DepositForm
                show={showDepositForm}
                onClose={() => setShowDepositForm(false)}
                onSuccess={() => {
                    // Close deposit modal
                    setShowDepositForm(false);

                    // Configure transaction success modal
                    setTransactionConfig({
                        type: "deposit",
                        status: "success",
                        trackerName
                    });

                    setShowTransactionModal(true);
                }}
            />

            {/* WITHDRAW FORM */}
            <WithdrawForm
                show={showWithdrawForm}
                onClose={() => setShowWithdrawForm(false)}
                onSuccess={() => {
                    setShowWithdrawForm(false);
                    setTransactionConfig({
                        type: "withdraw",
                        status: "success",
                        trackerName
                    });
                    setShowTransactionModal(true);
                }}
            />

            {/* -----------------------------------------------------------------
               MAIN TRACKER UI DISPLAY
               Contains entire tracker summary, details, actions, and streak data.
               ----------------------------------------------------------------- */}
            <div className="//TRACKER-FULL flex bg-[var(--green0)] p-5 gap-3 w-full h-auto rounded-4xl shadow-lg ">
                <div className="bg-[var(--green0)] w-full h-full">

                    {/* TITLE + EDIT BUTTON */}
                    <div className="flex justify-between">
                        <h4>{trackerName}</h4>

                        <div className="flex flex-row justify-start items-center">
                            <a
                                href="#"
                                onClick={() => setShowEditForm(true)}
                                className="!text-[var(--neutral3)] p-0 !bg-transparent hover:border-0 flex items-center"
                            >
                                <EditIcon className="w-5 h-5 fill-[var(--neutral3)]" />
                                Edit Details
                            </a>
                        </div>
                    </div>

                    {/* BANK INFORMATION */}
                    <div className="flex gap-2 items-center justify-start text-[var(--neutral3)]">
                        <GlobeIcon className="w-8 h-8 fill-[var(--neutral3)]" />
                        <h5 className="pr-3">{bankName}</h5>
                        <h5>Interest Rate: {interest}% PA</h5>
                    </div>

                    {/* BALANCE */}
                    <div className="flex gap-2 items-center justify-start">
                        <h1>
                            ${balance.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </h1>
                    </div>

                    {/* DESCRIPTION + ACTION BUTTONS */}
                    <div className="flex gap-2 items-center justify-between ">
                        <div className="overflow-y-auto overflow-x-hidden scrollbar-hover scroll-smooth">
                            <div className="w-full h-20 text-[var(--neutral3)]">
                                <h5>{description}</h5>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="!h-12 w-30"
                                onClick={() => setShowDepositForm(true)}
                            >
                                Deposit
                            </button>

                            <button className="!h-12 w-30"
                                onClick={() => setShowWithdrawForm(true)}
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>

                    {/* STREAK + PROGRESS INFORMATION */}
                    <div className="flex py-2 gap-2 items-center justify-between ">
                        <div className="flex items-center gap-2">
                            <img
                                src={streakActive ? streakOnIcon : streakOffIcon}
                                className="w-6 h-6"
                            />
                            <h5
                                className={`${
                                    streakActive
                                        ? "text-[var(--green3)]"
                                        : "text-[var(--neutral3)]"
                                }`}
                            >
                                {streak} days
                            </h5>
                        </div>

                        <div className="flex items-center gap-2 text-[var(--neutral3)]">
                            <h5>Streak Minimum: ${streakMinimum}</h5>
                        </div>

                        <div className="flex items-center gap-2 text-[var(--neutral3)]">
                            <h5>Days Left: {daysLeft} days</h5>
                        </div>

                        <div className="flex items-center gap-2 text-[var(--neutral3)]">
                            <h5>{progress}%</h5>
                        </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="w-full h-2 bg-[var(--neutral1)] rounded-full">
                        <div
                            className="h-2 bg-[var(--green3)] rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* RIGHT SECTION — RECENT ACTIVITY (Pending implementation) */}
                <div className="bg-[var(--green0)] mx-2 p-5 w-full h-full shadow-lg rounded-3xl">
                    <a>
                        <h5>Recent Activity ({recentActivity})</h5>
                    </a>

                    {/* In the future:
                         - Render transaction list
                         - Show deposits, withdrawals, streak updates
                         - Pagination if needed */}
                </div>
            </div>
        </>
    );
}

export default Tracker;
