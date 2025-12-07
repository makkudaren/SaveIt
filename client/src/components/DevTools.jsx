// DevTools.jsx
// -----------------------------------------------------------------------------
// DEVELOPER TESTING COMPONENT
// Provides a button to simulate advancing to the next day for streak testing.
// Only visible in development mode. Can be placed in any page component.
// -----------------------------------------------------------------------------

import { useState } from "react";
import { simulateNextDay } from "../services/DatabaseControl";

function DevTools() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [message, setMessage] = useState("");

    // Only show in development
    const isDev = import.meta.env.DEV;
    
    if (!isDev) return null;

    const handleSimulateNextDay = async () => {
        setIsSimulating(true);
        setMessage("Simulating next day...");

        const result = await simulateNextDay();

        if (result.success) {
            setMessage(`✓ Advanced to ${result.newDate}. Reload to see changes.`);
            
            // Auto-reload after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            setMessage(`✗ Error: ${result.error}`);
            setIsSimulating(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 bg-yellow-100 border-2 border-yellow-500 rounded-xl p-4 shadow-2xl max-w-xs">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <h5 className="text-yellow-900 font-bold">DEV MODE</h5>
            </div>
            
            <button
                onClick={handleSimulateNextDay}
                disabled={isSimulating}
                className="w-full !bg-yellow-500 !text-yellow-900 font-semibold py-2 px-4 rounded-lg hover:!bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {isSimulating ? "Simulating..." : "⏭️ Simulate Next Day"}
            </button>

            {message && (
                <p className="mt-2 text-sm text-yellow-900">
                    {message}
                </p>
            )}

            <p className="mt-2 text-xs text-yellow-800">
                This will advance streak_logs dates by 1 day for testing purposes.
            </p>
        </div>
    );
}

export default DevTools;