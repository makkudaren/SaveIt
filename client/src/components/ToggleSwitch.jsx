import React from "react";

function ToggleSwitch({ value, onChange }) {
    return (
        <div
            onClick={() => onChange(!value)}
            className={`
                w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300
                ${value ? "bg-green-500" : "bg-gray-300"}
            `}
        >
            <div
                className={`
                    w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300
                    ${value ? "translate-x-6" : "translate-x-0"}
                `}
            />
        </div>
    );
}

export default ToggleSwitch;
