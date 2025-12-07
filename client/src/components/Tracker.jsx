// Tracker.jsx

import GlobeIcon from "../assets/icons/globe-outline.svg?react";
import EditIcon from "../assets/icons/edit-2-outline.svg?react";
import streakOnIcon from "../assets/icons/streak-on-indicator.png";
import streakOffIcon from "../assets/icons/streak-off-indicator.png";
import ExpandIcon from "../assets/icons/expand-outline.svg?react";
import TrashIcon from "../assets/icons/trash-outline.svg?react";
import SharedIcon from "../assets/icons/people-outline.svg?react";

import TransactionHistory from "./TransactionHistory";
import ModalTransaction from "./ModalTransaction";
import EditTrackerForm from "./EditTrackerForm";
import LoadingScreen from "./LoadingMode";
import WithdrawForm from "./WithdrawForm";
import DepositForm from "./DepositForm";
import Modal from "./Modal";

import { deleteTracker, getCurrentUserId, getTrackerTransactions } from "../services/DatabaseControl";
import { useState, useEffect} from "react";

function Tracker({ tracker, onTrackerChange, isTodayStreakActive  }) {
    // --- RENDER NULL STATE ---
    if (!tracker) {
        return (
            <div className="//TRACKER-FULL flex bg-[var(--green0)] p-5 gap-3 w-full h-77 rounded-4xl shadow-lg justify-center items-center">
                <h4 className="text-[var(--neutral3)]">Select a tracker below to view its full details.</h4>
            </div>
        );
    }
    
    // -------------------------------------------------------------------------
    // DYNAMIC VALUES FROM PROP
    // -------------------------------------------------------------------------
    const trackerName = tracker.tracker_name || "Untitled Tracker";
    const bankName = tracker.bank_name || "N/A";
    const interest = tracker.interest_rate || 0.0;
    const balance = tracker.balance || 0.0;
    const description = tracker.description || "No description provided.";

    
    
    // STREAK DATA
    const streakActive = tracker.streak_enabled;
    const streak = tracker.streak_days || 0;
    const streakMinimum = tracker.streak_min_amount || 0;
    
    // GOAL/PROGRESS DATA
    const goalEnabled = tracker.goal_enabled;
    const goalAmount = tracker.goal_amount || 0;
    const goalDate = tracker.goal_date;
    
    let progress = 0;
    if (goalEnabled && goalAmount > 0 && balance >= 0) {
        progress = Math.min(100, (balance / goalAmount) * 100);
    }
    const progressInt = Math.floor(progress);

    let daysLeft = null;
    if (goalEnabled && goalDate) {
        // Calculate days left
        const today = new Date();
        const targetDate = new Date(goalDate);
        const diffTime = targetDate - today;
        daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    // CSS classes for consistent layout when streak/goal is disabled:
    const streakFeatureClass = !streakActive ? "invisible" : "";
    const goalFeatureClass = !goalEnabled ? "invisible" : "";


    // -------------------------------------------------------------------------
    // MODAL STATE CONTROLLERS
    // -------------------------------------------------------------------------
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDepositForm, setShowDepositForm] = useState(false);
    const [showWithdrawForm, setShowWithdrawForm] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);

    // Recent Activity Section
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [isRecentLoading, setIsRecentLoading] = useState(true);
    
    // CRITICAL FOR IMMEDIATE UPDATE: Key that forces a re-fetch of recent activity
    const [transactionUpdateKey, setTransactionUpdateKey] = useState(0); 

    // -------------------------------------------------------------------------
    // USE EFFECT TO FETCH RECENT ACTIVITY
    // -------------------------------------------------------------------------
    useEffect(() => {
        // Only run if trackerId is available
        if (!tracker?.id) {
            setRecentTransactions([]);
            setIsRecentLoading(false);
            return;
        }

        async function fetchRecentActivity() {
            setIsRecentLoading(true);
            // Fetch only the last 4 transactions
            const { data, error } = await getTrackerTransactions(tracker.id, 4);

            if (error) {
                console.error("Failed to fetch recent transactions:", error);
                setRecentTransactions([]);
            } else {
                setRecentTransactions(data || []);
            }
            setIsRecentLoading(false);
        }

        fetchRecentActivity();
        
        // Dependency array: Re-fetch when tracker ID changes OR a new transaction occurs
    }, [tracker?.id, transactionUpdateKey]); 


    // -------------------------------------------------------------------------
    // HELPER FUNCTIONS for Formatting
    // -------------------------------------------------------------------------
    
    const formatAmount = (type, amount) => {
        const sign = type === 'deposit' ? '+' : '-';
        // Use a ternary to select color based on transaction type
        const colorClass = type === 'deposit' ? 'text-[var(--green3)]' : 'text-[var(--red3)]';
        return <span className={colorClass}>{sign} ${parseFloat(amount).toFixed(2)}</span>;
    };
    
    // UPDATED: To include time (e.g., "11/20 9:00 PM")
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: 'numeric', 
            day: 'numeric', 
            year: '2-digit'
        }) + " " + date.toLocaleTimeString("en-US", { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        }).replace(' ', ''); // Remove space before AM/PM
    };

    // -------------------------------------------------------------------------
    // RENDER: RECENT ACTIVITY SECTION CONTENT
    // -------------------------------------------------------------------------

    let recentActivityContent;
    if (isRecentLoading) {
        recentActivityContent = (
            <div className="flex justify-center items-center translate-y-20 scale-90 h-full //trans-smooth">
                <LoadingScreen text={"Loading Recent Activity..."}/>
            </div>
        );
    } else if (recentTransactions.length === 0) {
        recentActivityContent = (
            <div className="flex justify-center items-center h-full trans-smooth">
                <p className="text-[var(--neutral3)] my-5">No recent activity.</p>
            </div>
        );
    } else {
        // Map over the fetched transactions
        recentActivityContent = recentTransactions.map((t) => (
            // Replicate the original row layout (w-[90%] and h-12)
            <div key={t.id} className="trans-smooth flex justify-start w-[100%] h-12 border-b-1 border-[var(--neutral2)] last:border-b-0 mx-0">
                {/* AMOUNT */}
                <div className="w-full flex justify-start items-center font-medium text-sm">
                    {formatAmount(t.type, t.amount)}
                </div>
                {/* CONTRIBUTOR (assuming profiles table join for username) */}
                <div className="w-full flex justify-start items-center text-[var(--neutral3)] text-sm">
                    {t.profiles?.username || 'N/A'}
                </div>
                {/* DATE (UPDATED) */}
                <div className="w-full flex justify-start items-center text-[var(--neutral3)] text-sm">
                    {formatDate(t.created_at)}
                </div>
                {/* STATUS / TYPE */}
                <div className="w-full flex justify-start items-center text-[var(--neutral3)] text-sm">
                    {t.type.charAt(0).toUpperCase() + t.type.slice(1)} {/* Capitalize type (Deposit/Withdraw) */}
                </div>
            </div>
        ));
    }

    // -------------------------------------------------------------------------
    // DELETE LOGIC
    // -------------------------------------------------------------------------
    const handleDeleteTracker = async () => {
        if (!tracker || !tracker.id) return;

        const result = await deleteTracker(tracker.id);
        
        if (result.success) {
            console.log(`Tracker ${tracker.id} deleted successfully.`);
            setShowDeleteModal(false);
            // Notify parent component (likely containing the list) to refresh/clear selection
            if (onTrackerChange) {
                onTrackerChange({ action: "delete", trackerId: tracker.id }); 
            }
        } else {
            console.error("Failed to delete tracker:", result.error);
        }
    };

    const [currentUserId, setCurrentUserId] = useState(null);
    useEffect(() => {
        // Fetch the current user ID once
        async function fetchUserId() {
            const userId = await getCurrentUserId();
            setCurrentUserId(userId);
        }
        fetchUserId();
    }, []);
    const isOwner = tracker && currentUserId === tracker.owner_id;

    // Tracks the type of transaction & tracker involved for the success modal.
    const [transactionConfig, setTransactionConfig] = useState({
        type: "",
        status: "",
        trackerName: trackerName
    });

    return (
        <>
            {/* -----------------------------------------------------------------
                MODAL COMPONENTS (Ensure they receive necessary dynamic data)
                ----------------------------------------------------------------- */}

            <TransactionHistory
                show={showTransactionHistory}
                trackerId={tracker.id} // Pass the tracker ID
                onClose={() => setShowTransactionHistory(false)}
            />

            {isOwner && (
            <EditTrackerForm
                show={showEditForm}
                onClose={() => setShowEditForm(false)}
                tracker={tracker}
                onSuccess={() => {
                    setShowEditForm(false);
                    if (onTrackerChange) {
                        onTrackerChange({ action: "update", trackerId: tracker.id });
                    }
                }}
            />)}

            <DepositForm
                show={showDepositForm}
                onClose={() => setShowDepositForm(false)}
                tracker={tracker}
                onSuccess={(result) => {
                    // Close deposit modal
                    setShowDepositForm(false);

                    // Configure transaction modal
                    setTransactionConfig({
                        type: "deposit",
                        // Set status based on the transaction result
                        status: result.success ? "success" : "failed",
                        // Pass error message for display if needed
                        message: result.message, 
                        trackerName
                    });

                    // Re-fetch data if successful
                    if (result.success) {
                        // 1. Force the parent component to re-fetch tracker balance/details
                        if (onTrackerChange) {
                            onTrackerChange({ action: "update", trackerId: tracker.id }); 
                        }
                        // 2. Force the local Recent Activity section to re-fetch transactions
                        setTransactionUpdateKey(prev => prev + 1); 
                    }

                    setShowTransactionModal(true);
                }}
            />

            <WithdrawForm
                show={showWithdrawForm}
                onClose={() => setShowWithdrawForm(false)}
                tracker={tracker}
                onSuccess={(result) => {
                    setShowWithdrawForm(false);
                    setTransactionConfig({
                        type: "withdraw",
                        status: result.success ? "success" : "failed",
                        message: result.message, 
                        trackerName
                    });

                    // Re-fetch data if successful
                    if (result.success) {
                        // 1. Force the parent component to re-fetch tracker balance/details
                        if (onTrackerChange) {
                            onTrackerChange({ action: "update", trackerId: tracker.id }); 
                        }
                        // 2. Force the local Recent Activity section to re-fetch transactions
                        setTransactionUpdateKey(prev => prev + 1); 
                    }

                    setShowTransactionModal(true);
                }}
            />

            <Modal 
                show={showDeleteModal}
                title={`Delete ${trackerName}?`}
                message="Are you sure you want to delete this tracker? This action cannot be undone."
                onConfirm={handleDeleteTracker}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Delete"
            />

            <ModalTransaction
                show={showTransactionModal}
                type={transactionConfig.type}
                status={transactionConfig.status}
                trackerName={transactionConfig.trackerName}
                transactionMessage={transactionConfig.message} 
                onClose={() => setShowTransactionModal(false)}
            />

            {/* -----------------------------------------------------------------
                MAIN TRACKER UI DISPLAY
                ----------------------------------------------------------------- */}
            <div className="//TRACKER-FULL flex bg-[var(--green0)] p-5 gap-3 w-full h-auto rounded-4xl shadow-lg ">
                <div className="bg-[var(--green0)] w-full h-full">

                    {/* TITLE + EDIT BUTTON (DYNAMIC) */}
                    <div className="flex justify-between">
                        <h4>{trackerName}</h4>
                        {isOwner && (
                        <div className="flex flex-row justify-start items-center gap-3">
                            <a
                                href="#"
                                onClick={() => setShowEditForm(true)}
                                className="!text-[var(--neutral3)] p-0 !bg-transparent hover:border-0 flex items-center"
                            >
                                <EditIcon className="w-5 h-5 fill-[var(--neutral3)]" />
                                Edit Details
                            </a>
                            <a
                                href="#"
                                onClick={() => setShowDeleteModal(true)}
                                className="!text-[var(--red3)] p-0 !bg-transparent hover:border-0 flex items-center"
                            >
                                <TrashIcon className="w-5 h-5 fill-[var(--red3)]" />
                                Delete
                            </a>


                        </div>)}
                        {!isOwner && (
                        <div className="flex flex-row justify-start items-center gap-3">
                            <p className="flex gap-2 !text-[var(--neutral3)] p-0 !bg-transparent hover:border-0 flex items-center">
                                <SharedIcon className="w-5 h-5 fill-[var(--neutral3)]" />
                                Shared Tracker
                            </p>
                        </div>)}
                    </div>

                    {/* BANK INFORMATION (DYNAMIC) */}
                    <div className="flex gap-2 items-center justify-start text-[var(--neutral3)]">
                        <GlobeIcon className="w-8 h-8 fill-[var(--neutral3)]" />
                        <h5 className="pr-3">{bankName}</h5>
                        <h5>Interest Rate: {interest}% PA</h5>
                    </div>

                    {/* BALANCE (DYNAMIC) */}
                    <div className="flex gap-2 items-center justify-start">
                        <h1>
                            ${balance.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </h1>
                    </div>

                    {/* DESCRIPTION + ACTION BUTTONS (DYNAMIC DESCRIPTION) */}
                    <div className="flex gap-2 items-center justify-between ">
                        <div className="overflow-y-scroll overflow-x-hidden scrollbar-hover scroll-smooth">
                            <div className="w-full h-20 text-[var(--neutral3)]">
                                <h5>{description}</h5>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="!h-12 w-30 btn-3D"
                                onClick={() => setShowDepositForm(true)}
                            >
                                Deposit
                            </button>

                            <button className="!h-12 w-30 btn-3D"
                                onClick={() => setShowWithdrawForm(true)}
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>

                    {/* STREAK + PROGRESS INFORMATION (CONDITIONAL RENDERING) */}
                    {/* The outer div maintains the full height/space of this row */}
                    <div className="flex py-2 gap-2 items-center justify-between ">
                        
                        {/* STREAK DAYS (Now uses invisible) */}
                        <div className={`flex items-center gap-2 ${streakFeatureClass}`}>
                            <img
                                src={isTodayStreakActive ? streakOnIcon : streakOffIcon}
                                className="w-6 h-6"
                            />
                            <h5
                                className={isTodayStreakActive ? "text-[var(--green3)]" : "text-[var(--neutral3)]"}
                            >
                                {streak} {streak === 1 ? 'day' : 'days'}
                            </h5>
                        </div>
                        
                        
                        {/* STREAK MINIMUM (Now uses invisible and was missing the class) */}
                        <div className={`flex items-center gap-2 text-[var(--neutral3)] ${streakFeatureClass}`}>
                            <h5>Streak Minimum: ${streakMinimum}</h5>
                        </div>

                        {/* DAYS LEFT (GOAL) (Now uses invisible) */}
                        <div className={`flex items-center gap-2 text-[var(--neutral3)] ${goalFeatureClass}`}>
                            <h5>Goal: ${goalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                {daysLeft !== null && ` (${daysLeft}d)`}</h5>
                        </div>

                        {/* PROGRESS PERCENTAGE (GOAL) (Now uses invisible) */}
                        <div className={`flex items-center gap-2 text-[var(--neutral3)] ${goalFeatureClass}`}>
                            <h5>{progressInt}%</h5>
                        </div>
                    </div>

                    {/* PROGRESS BAR (CONDITIONAL RENDERING) (Now uses invisible) */}
                    <div className={`w-full h-2.5 bg-[var(--neutral1)] rounded-full ${goalFeatureClass}`}>
                        <div
                            className="h-full bg-[var(--green3)] rounded-full transition-all duration-300"
                            style={{ width: `${progressInt}%` }}
                        ></div>
                    </div>
                </div>

                {/* RIGHT SECTION — RECENT ACTIVITY (DYNAMIC) */}
                <div className="bg-[var(--green0)] mx-2 p-5 pb-10 w-full h-full shadow-lg rounded-3xl">
                    <a  
                        className=" flex flex-row justify-between"
                        href="#"
                        onClick={() => setShowTransactionHistory(true)}>
                        {/* DYNAMIC COUNT */}
                        <h5>Recent Activity ({recentTransactions.length})</h5>
                        <ExpandIcon className="w-7 h-7 fill-[var(--neutral3)] hover:scale-110"/>
                    </a>    

                    <div className="w-full h-full overflow-auto">
                        <div className=" w-170 h-40">
                            {/* FETCH FROM THE DATABASE */}
                            <h5 className="font-semibold text-center mb-4">Transaction History</h5>
                            <div className="flex-1 w-[99%] trans-smooth">
                                {/* HEADER ROW */}
                                <div className="flex flex-row justify-between w-[100%] h-8 ">
                                    <div className="w-full flex justify-start items-center"><label>Amount</label></div>
                                    <div className="w-full flex justify-start items-center"><label>Contributor</label></div>
                                    <div className="w-full flex justify-start items-center"><label>Date</label></div>
                                    <div className="w-full flex justify-start items-center"><label>Status</label></div>
                                </div>
                                <div className="bg-[var(--neutral2)] w-[100%] h-0.5 "></div>
                                
                                {/* DYNAMIC TRANSACTION DATA ROWS */}
                                {recentActivityContent}
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Tracker;