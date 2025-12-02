// TransactionHistory.jsx
// -----------------------------------------------------------------------------
// Modal component for displaying a tracker's transaction history.
// Fetches live transaction data when opened and renders a scrollable list.
// -----------------------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { getTrackerTransactions } from "../services/DatabaseControl";

// Expects: 
// - show: controls modal visibility
// - onClose: close handler
// - trackerId: used to retrieve transaction records
function TransactionHistory({ show, onClose, trackerId }) {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Loads history each time modal opens or trackerId changes
    useEffect(() => {
        if (!show || !trackerId) {
            setTransactions([]);
            return;
        }

        async function fetchHistory() {
            setIsLoading(true);
            const { data, error } = await getTrackerTransactions(trackerId);

            if (error) {
                console.error("Failed to fetch transaction history:", error);
                setTransactions([]);
            } else {
                setTransactions(data || []);
            }
            setIsLoading(false);
        }

        fetchHistory();
    }, [show, trackerId]);


    // Skip rendering if modal is not active or trackerId is missing
    if (!show || !trackerId) return null;

    // Formats timestamp into readable date + time for the UI
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return (
            date.toLocaleDateString("en-US", {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            }) +
            " " +
            date.toLocaleTimeString("en-US", {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).replace(' ', '')
        );
    };

    // Renders an amount with sign and color based on transaction type
    const formatAmount = (type, amount) => {
        const sign = type === 'deposit' ? '+' : '-';
        const colorClass =
            type === 'deposit'
                ? 'text-[var(--green3)]'
                : 'text-[var(--red3)]';

        return (
            <span className={colorClass}>
                {sign} ${parseFloat(amount).toFixed(2)}
            </span>
        );
    };


    // -------------------------------------------------------------------------
    // CONTENT RENDERING STATES
    // -------------------------------------------------------------------------
    let content;

    if (isLoading) {
        content = (
            <div className="text-center p-4 text-[var(--neutral3)]">
                Loading transaction history...
            </div>
        );

    } else if (transactions.length === 0) {
        content = (
            <div className="text-center p-4 text-[var(--neutral3)]">
                No transactions recorded yet.
            </div>
        );

    } else {
        // Scrollable list of transaction entries
        content = (
            <div className="overflow-y-auto h-[27em]">
                {transactions.map((t) => (
                    <div
                        key={t.id}
                        className="flex justify-between w-full h-12 border-b-1 border-[var(--neutral2)]"
                    >
                        {/* Amount (deposit/withdraw with color) */}
                        <div className="w-full flex justify-start items-center font-medium">
                            {formatAmount(t.type, t.amount)}
                        </div>

                        {/* Contributor username returned from joined profiles table */}
                        <div className="w-full flex justify-start items-center text-[var(--neutral3)]">
                            {t.profiles?.username || 'N/A'}
                        </div>

                        {/* Formatted timestamp */}
                        <div className="w-full flex justify-start items-center text-[var(--neutral3)]">
                            {formatDate(t.created_at)}
                        </div>

                        {/* Resulting balance after the transaction */}
                        <div className="w-full flex justify-start items-center font-semibold">
                            ${parseFloat(t.new_balance).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }


    // -------------------------------------------------------------------------
    // MODAL LAYOUT
    // -------------------------------------------------------------------------
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-white p-8 w-[50em] h-[35em] rounded-3xl shadow-lg flex flex-col items-start">

                {/* Close control */}
                <a onClick={onClose} className="close-icon absolute top-2 right-5">×</a>

                <h5 className="font-semibold text-center mb-4">Transaction History</h5>

                {/* Column headers */}
                <div className="flex flex-row justify-between w-full h-8 text-sm font-semibold border-b border-[var(--neutral2)] mb-2">
                    <div className="w-full flex justify-start items-center"><label>Amount</label></div>
                    <div className="w-full flex justify-start items-center"><label>Contributor</label></div>
                    <div className="w-full flex justify-start items-center"><label>Date</label></div>
                    <div className="w-full flex justify-start items-center"><label>New Balance</label></div>
                </div>

                {/* Dynamic content */}
                <div className="flex-1 w-full h-full">
                    {content}
                </div>
            </div>
        </div>
    );
}

export default TransactionHistory;
