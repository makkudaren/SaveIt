// WithdrawForm.jsx
// -----------------------------------------------------------------------------
// PRIMARY FUNCTION:
// This component displays the withdrawal modal for a selected tracker.  
// It allows the user to enter a withdrawal amount, add an optional note, and
// confirm the transaction. Once submitted, the parent component (Tracker.jsx)
// receives an onSuccess callback to trigger the success modal.
//
// CURRENT STATE (LEGACY / STATIC VERSION):
// - All tracker values (name, balance, contributor, date) are hardcoded.
//   These will later be replaced by real database values once Supabase
//   integration is implemented.
// - No validation or database update is performed at the moment.
// - The modal is fully functional visually and behaviorally for UI testing.
//
// FUTURE IMPLEMENTATION:
// - Fetch actual tracker data from Supabase: tracker name, balance,
//   authenticated contributor, and real-time date.
// - Validate that withdrawal amount does not exceed the balance.
// - Record transaction into a "transactions" table.
// - Update tracker balance accordingly.
// - Trigger re-fetch to update frontend state.
//
// ARCHITECTURE:
// The WithdrawForm modal is triggered by the parent tracker component.
// It serves only as a UI layer; business logic and database operations will
// be implemented when the backend layer is connected.
// -----------------------------------------------------------------------------

function WithdrawForm({ show, onClose, onSuccess }) {

    // -------------------------------------------------------------------------
    // STATIC PLACEHOLDER VALUES
    // These exist for UI prototyping and will be replaced by real data.
    // -------------------------------------------------------------------------
    const trackerName = "Insurance PRU Life UK";
    const trackerBalance = 500;
    const trackerContributor = "Name";    // Future: mapping to actual account owner
    const dateToday = "October 6, 2025";   // Future: auto-generate from system date

    // Prevent modal from rendering unless active
    if (!show) return null;

    // -------------------------------------------------------------------------
    // SUBMIT HANDLER
    // Currently only triggers success callback.
    // In future:
    //    - Validate withdrawal
    //    - Insert into database
    //    - Update tracker balance
    //    - Log activity for transaction history
    // -------------------------------------------------------------------------
    function submitTransaction(e) {
        e.preventDefault();
        onSuccess(); // Notifies Tracker.jsx to open success modal
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-white p-8 px-15 w-auto h-auto rounded-3xl shadow-lg flex flex-col">

                {/* CLOSE BUTTON */}
                <a onClick={onClose} className="close-icon absolute top-2 right-5">×</a>

                {/* TITLE */}
                <h3 className="text-xl font-semibold text-center mb-4">Withdraw</h3>

                {/* SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto p-2">
                    <form id="withdraw-form">
                        <div className="flex flex-col gap-5">

                            {/* TRACKER INFO */}
                            <div className="flex flex-col gap-1">
                                <h5>Tracker: {trackerName}</h5>
                                <label>Tracker Balance: ${trackerBalance}</label>
                            </div>

                            {/* AMOUNT INPUT */}
                            <div className="flex flex-col gap-1">
                                <label>Enter Amount</label>
                                <input
                                    className="!w-full !h-10 !p-4 !rounded-xl"
                                    type="number"
                                    placeholder="$"
                                    required
                                />
                            </div>

                            {/* OPTIONAL MESSAGE */}
                            <div className="flex flex-col gap-1">
                                <label>Optional Message</label>
                                <textarea
                                    className="!w-full !h-25 !p-4 !rounded-xl bg-[var(--neutral0)] resize-none"
                                    placeholder="Notes about this transaction..."
                                    rows={3}
                                />
                            </div>

                            {/* TRANSACTION METADATA */}
                            <div className="flex flex-col gap-1">
                                <label>Contributor: {trackerContributor}</label>
                                <label>Date: {dateToday}</label>
                            </div>
                        </div>
                    </form>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                    onClick={submitTransaction}
                    className="mt-4 w-full py-3 bg-[var(--green0)] text-white rounded-xl"
                >
                    Withdraw
                </button>

            </div>
        </div>
    );
}

export default WithdrawForm;
