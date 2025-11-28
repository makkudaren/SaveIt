// DepositForm.jsx
// -----------------------------------------------------------------------------
// PRIMARY FUNCTION:
// This modal component allows users to deposit money into a selected tracker.
// Users can enter an amount, add an optional note, and confirm the deposit.
// Submission triggers the onSuccess callback, which the parent component
// (Tracker.jsx) uses to display a success confirmation modal.
//
// CURRENT STATE (LEGACY / STATIC IMPLEMENTATION):
// - All values (tracker name, streak minimum, contributor, date) are static
//   placeholders used only for UI demonstration.
// - This UI is fully functional visually but does not yet interact with
//   any backend database or update actual tracker values.
//
// FUTURE IMPLEMENTATION PLAN:
// 1. Replace static values with live tracker data from Supabase.
// 2. Validate user input (e.g., amount must be > 0).
// 3. Insert deposit record into the "transactions" table.
// 4. Update tracker balance in Supabase.
// 5. Re-fetch tracker details to update the interface.
// 6. Extend support for multi-contributors once collaboration is implemented.
//
// ARCHITECTURE CONTEXT:
// DepositForm is purely a presentational layer.  
// Business logic will be implemented later in the data-access layer once
// backend integration begins. It communicates with Tracker.jsx only through
// show/onClose/onSuccess props.
// -----------------------------------------------------------------------------

function DepositForm({ show, onClose, onSuccess }) {

    // -------------------------------------------------------------------------
    // STATIC PLACEHOLDER VALUES
    // These exist for prototyping and UI testing.
    // Future versions will receive these via props or Supabase fetch.
    // -------------------------------------------------------------------------
    const trackerName = "Insurance PRU Life UK";
    const streakMinimum = 20;
    const trackerContributor = "Name";       // Future: dynamic from logged-in user
    const dateToday = "October 6, 2025";     // Future: generated from system time

    // If modal should not be displayed, do not render anything
    if (!show) return null;

    // -------------------------------------------------------------------------
    // SUBMIT HANDLER
    // Temporarily triggers success callback only.
    // Full logic will include:
    //  - amount validation
    //  - DB insertion (Supabase)
    //  - updating tracker balance
    //  - reloading UI state
    // -------------------------------------------------------------------------
    function submitTransaction(e) {
        e.preventDefault();
        onSuccess(); // parent handles the success modal
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="relative bg-white p-8 px-15 w-auto h-auto rounded-3xl shadow-lg flex flex-col">

                {/* CLOSE BUTTON */}
                <a onClick={onClose} className="close-icon absolute top-2 right-5">×</a>

                <h3 className="text-xl font-semibold text-center mb-4">Deposit</h3>

                {/* SCROLLABLE INPUT SECTION */}
                <div className="flex-1 overflow-y-auto p-2">
                    <form>
                        <div className="flex flex-col gap-5">

                            {/* TRACKER INFORMATION */}
                            <div className="flex flex-col gap-1">
                                <h5>Tracker: {trackerName}</h5>
                                <label>Streak Minimum: ${streakMinimum}</label>
                            </div>

                            {/* ENTER AMOUNT */}
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

                            {/* METADATA */}
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
                    Deposit
                </button>

            </div>
        </div>
    );
}

export default DepositForm;
