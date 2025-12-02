// PopoverTrackerMenu.jsx
// -----------------------------------------------------------------------------
// Reusable popover menu component for tracker actions.
// Provides two optional callbacks: onView and onDelete.
// Handles its own open/close state and closes automatically when clicking
// outside the popover.
// -----------------------------------------------------------------------------

import { useState, useRef, useEffect } from "react";

export default function PopoverTrackerMenu({ onView, onDelete }) {
  const [open, setOpen] = useState(false);       // Controls visibility of popover
  const popRef = useRef();                       // Reference to wrapper for outside-click detection

  // ---------------------------------------------------------------------------
  // When user clicks anywhere outside the menu, automatically close the popover
  // ---------------------------------------------------------------------------
  useEffect(() => {
    function handleClickOutside(e) {
      if (popRef.current && !popRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={popRef} className="relative inline-block">

      {/* Trigger button that toggles the popover */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-lg hover:bg-neutral-200"
      >
        ⋮
      </button>

      {/* -----------------------------------------------------------------------
           Popover container — positioned relative to trigger button.
           Appears only when `open` is true.
         ----------------------------------------------------------------------- */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 
            w-36 rounded-xl bg-white border border-neutral-200 shadow-lg
            flex flex-col overflow-hidden
            animate-in fade-in zoom-in duration-150
          "
        >
          {/* VIEW ACTION ------------------------------------------------------- */}
          <button
            onClick={() => {
              setOpen(false);
              onView?.();         // Executes only if provided
            }}
            className="text-left px-4 py-2 hover:bg-neutral-100"
          >
            View
          </button>

          {/* DELETE ACTION ----------------------------------------------------- */}
          <button
            onClick={() => {
              setOpen(false);
              onDelete?.();       // Executes only if provided
            }}
            className="text-left px-4 py-2 text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
