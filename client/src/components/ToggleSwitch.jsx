// ToggleSwitch.jsx
// -----------------------------------------------------------------------------
// Reusable toggle switch component.
// Accepts a boolean `value` and triggers `onChange` with the inverted value
// whenever the switch is clicked.
// -----------------------------------------------------------------------------

import React from "react";

function ToggleSwitch({ value, onChange }) {
    return (
        <div
            // Clicking the wrapper flips the boolean value
            onClick={() => onChange(!value)}
            className={`
                w-12 h-6 flex items-center rounded-full p-1 cursor-pointer 
                transition-all duration-300
                ${value ? "bg-green-500" : "bg-gray-300"}  // Dynamic background color
            `}
        >
            {/* Circular toggle knob */}
            <div
                className={`
                    w-4 h-4 bg-white rounded-full shadow-md transform
                    transition-all duration-300
                    ${value ? "translate-x-6" : "translate-x-0"}  // Slide animation
                `}
            />
        </div>
    );
}

export default ToggleSwitch;
