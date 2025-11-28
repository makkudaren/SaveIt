// LoginForm.jsx
// -----------------------------------------------------------------------------
// This component handles user authentication for the SaveIt application.
// Core responsibilities:
// - Collect and validate login credentials
// - Use Supabase authentication to sign in the user
// - Display UI feedback on success or error
// - Redirect authenticated users to the dashboard
//
// The file includes documentation explaining logic decisions, corner cases,
// and UI state management to support future maintainers working with this code.
// -----------------------------------------------------------------------------

import SaveItLogo from "../assets/brand/SaveIt-Logo.png";
import UserIcon from "../assets/icons/email-outline.svg?react";
import PasswordIcon from "../assets/icons/lock-outline.svg?react";
import supabase from "../supabase-client";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginForm() {
    // Local UI states
    const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
    const [error, setError] = useState("");                  // Error message shown to user
    const [shake, setShake] = useState(false);               // Animation state for invalid login

    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // handleSubmit()
    // Main login handler triggered when the user submits the form.
    //
    // Steps:
    // 1. Prevent page reload
    // 2. Read email + password values from the form
    // 3. Attempt Supabase login (email/password strategy)
    // 4. Show appropriate feedback or redirect on success
    //
    // Future maintainers:
    // - Consider switching to controlled inputs for better React consistency
    // - Add analytics/logging for failed login attempts if needed
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear existing errors before login attempt

        // Direct DOM access for quick retrieval of inputs
        const email = document.getElementById("email-input").value;
        const password = document.getElementById("password-input").value;

        // ---------------------------------------------------------------------
        // SUPABASE AUTHENTICATION (Email + Password)
        //
        // signInWithPassword() is preferred over signIn() for clarity and explicitness.
        // Supabase handles token management internally.
        // ---------------------------------------------------------------------
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        // ---------------------------------------------------------------------
        // ERROR HANDLING
        // Shake animation + error message helps users identify invalid input
        // ---------------------------------------------------------------------
        if (error) {
            setError(error.message);
            setShake(true);
            setTimeout(() => setShake(false), 400);
            alert("ERROR?"); // Temporary debug alert. Safe to remove in stable release.
        } else {
            // On success: redirect to dashboard
            navigate("/dashboard");
        }
    };

    // -------------------------------------------------------------------------
    // UI / FORM LAYOUT
    // Includes:
    // - Branding
    // - Email and password fields
    // - Password visibility toggle
    // - Error message display
    // - Navigation to Registration page
    //
    // Future maintainers:
    // - Consider extracting repeated input blocks into smaller components
    // - Add loading indicators for better UX during login requests
    // -------------------------------------------------------------------------
    return (
        <>
            <div className="flex flex-col justify-center items-center bg-white h-auto w-auto p-10 rounded-4xl shadow-md shadow-xl">
                {/* APP BRANDING */}
                <img src={SaveItLogo} alt="SaveIt Logo" className="w-15 h-auto mb-0" />
                <h6>SaveIt</h6>
                <h5 className="py-2">Login to Account</h5>

                {/* MAIN LOGIN FORM */}
                <form id="login-form" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-3">

                        {/* ---------------- EMAIL FIELD ---------------- */}
                        <label className="pl-5" htmlFor="email">Email</label>
                        <div className="relative">
                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                            <input
                                className="w-85"
                                id="email-input"
                                type="text"
                                placeholder="Enter Email"
                                required
                            />
                        </div>

                        {/* ---------------- PASSWORD FIELD ---------------- */}
                        <label className="pl-5" htmlFor="password">Password</label>
                        <div className="relative">
                            <PasswordIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                            <input
                                className="w-full"
                                id="password-input"
                                type={showPassword ? "text" : "password"} // Toggle visibility
                                placeholder="Enter Password"
                                required
                            />
                        </div>

                        {/* ---------------- PASSWORD VISIBILITY TOGGLE ---------------- */}
                        <label className="flex flex-row items-center pl-4 gap-2 h-7">
                            <input
                                className="w-4 h-4 rounded-4xl text-xs"
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                            />
                            <small>Show Password</small>
                        </label>

                        {/* ---------------- ERROR MESSAGE DISPLAY ---------------- */}
                        {error && (
                            <div className={`flex justify-center text-red-500 ${shake ? "shake" : ""}`}>
                                {error}
                            </div>
                        )}

                        {/* ---------------- LOGIN BUTTON ---------------- */}
                        <button id="login-btn" type="submit">Login</button>

                        {/* ---------------- NAVIGATION: NO ACCOUNT? ---------------- */}
                        <label className="flex justify-center gap-2">
                            <small>Don't have an account?</small>
                            <small><Link to="/register" className="text-[var(--blue3)]">Register</Link></small>
                        </label>
                    </div>
                </form>
            </div>
        </>
    );
}

export default LoginForm;
