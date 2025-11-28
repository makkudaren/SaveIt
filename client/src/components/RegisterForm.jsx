// RegisterForm.jsx
// -----------------------------------------------------------------------------
// This component handles client-side registration logic, including:
// - Username availability check
// - Supabase authentication sign-up
// - Profile insertion into the "profiles" table
// - Basic form validation and UI feedback
//
// This file includes defensive checks, inline documentation, and
// clear explanations of important steps to support future maintainers.
// -----------------------------------------------------------------------------

import { useState } from "react";
import SaveItLogo from "../assets/brand/SaveIt-Logo.png";
import EmailIcon from "../assets/icons/email-outline.svg?react";
import UsernameIcon from "../assets/icons/at-outline.svg?react";
import PasswordIcon from "../assets/icons/lock-outline.svg?react";
import ConfirmIcon from "../assets/icons/checkmark-circle-outline.svg?react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabase-client";

function RegisterForm() {
    // Form field states
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI feedback + validation states
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false); // triggers shake animation on error
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // handleSubmit()
    // Main submit handler for the registration form.
    //
    // Steps:
    // 1. Validate password match
    // 2. Check username availability in "profiles"
    // 3. Create Supabase user account
    // 4. Insert profile record linked to the new user
    //
    // This ensures that authentication and profile data stay consistent.
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Accessing DOM input values — acceptable for quick reads but ideally
        // replaced with controlled inputs in future refactors.
        const username = document.getElementById("username-input").value.trim();
        const email = document.getElementById("email-input").value;

        // ---------------------------------------------------------------------
        // PASSWORD VALIDATION
        // Basic safety check ensuring the user doesn't mistype passwords.
        // ---------------------------------------------------------------------
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }

        setError("");
        setLoading(true);

        // ---------------------------------------------------------------------
        // CHECK IF USERNAME ALREADY EXISTS
        // This prevents duplicate usernames and improves user experience.
        // maybeSingle() returns null instead of throwing an error.
        // ---------------------------------------------------------------------
        const { data: existingUser, error: usernameError } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", username)
            .maybeSingle();

        if (existingUser) {
            setLoading(false);
            setError("Username is already taken.");
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }

        // ---------------------------------------------------------------------
        // CREATE USER USING SUPABASE AUTH
        // This registers the user using email + password.
        // Supabase automatically sends verification email (if configured).
        // ---------------------------------------------------------------------
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            setLoading(false);
            setError(signUpError.message);
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }

        // Extract authenticated user reference
        const user = data.user;
        if (!user) {
            setLoading(false);
            setError("Signup failed. Try again.");
            return;
        }

        // ---------------------------------------------------------------------
        // INSERT USER PROFILE
        // We use the user's auth ID as the primary key to ensure
        // 1:1 relation between authentication credentials and profile metadata.
        // ---------------------------------------------------------------------
        const { error: profileError } = await supabase
            .from("profiles")
            .insert({
                id: user.id,
                username: username,
            });

        if (profileError) {
            // No UI error shown because account *did* get created.
            // Printed for debugging and future maintainers.
            console.log("Profile insert error:", profileError);
        }

        // ---------------------------------------------------------------------
        // FINAL FEEDBACK + REDIRECT
        // Ensures smooth onboarding and next step clarity.
        // ---------------------------------------------------------------------
        setLoading(false);
        alert("Account created! Please verify your email before logging in.");
        navigate("/login");
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center bg-white h-auto w-auto p-10 rounded-4xl shadow-md shadow-xl">

                {/* BRANDING HEADER */}
                <img src={SaveItLogo} alt="SaveIt Logo" className="w-15 h-auto mb-0" />
                <h6>SaveIt</h6>
                <h5 className="py-2">Register Account</h5>

                {/* MAIN REGISTRATION FORM */}
                <form id="login-form" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-3">
                        
                        {/* ---------------- USERNAME FIELD ---------------- */}
                        <label className="pl-5" htmlFor="email">Personal Information</label>
                        <div className="relative">
                            <UsernameIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                            <input className="w-85" id="username-input" type="username" placeholder="Register Username" required />
                        </div>

                        {/* ---------------- EMAIL FIELD ---------------- */}
                        <div className="relative">
                            <EmailIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                            <input className="w-85" id="email-input" type="email" placeholder="Register Email" required />
                        </div>

                        {/* ---------------- PASSWORD FIELD ---------------- */}
                        <label className="pl-5" htmlFor="password">Password Creation</label>
                        <div className="relative">
                            <PasswordIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                            <input
                                className="w-full"
                                id="password-input"
                                type="password"
                                placeholder="Enter Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* ---------------- CONFIRM PASSWORD FIELD ---------------- */}
                        <div className="relative w-full">
                            <ConfirmIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                            <input
                                className="w-full"
                                id="confirm-password-input"
                                type="password"
                                placeholder="Confirm Password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {/* ---------------- ERROR MESSAGE DISPLAY ---------------- */}
                        {error && (
                            <div className={`flex justify-center text-red-500 ${shake ? "shake" : ""}`}>
                                {error}
                            </div>
                        )}

                        {/* ---------------- TERMS & CONDITIONS ---------------- */}
                        <label className="flex flex-row items-center pl-4 gap-2 h-7">
                            <input className="w-4 h-4 rounded-4xl text-xs" type="checkbox" required />
                            <small>
                                I agree to <Link to="/terms-and-conditions" className="text-[var(--blue3)]">Terms and Conditions</Link>
                            </small>
                        </label>

                        {/* ---------------- SUBMIT BUTTON ---------------- */}
                        <button id="login-btn" type="submit">
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>

                        {/* ---------------- ALREADY HAVE ACCOUNT? ---------------- */}
                        <label className="flex justify-center gap-2">
                            <small>Already have an account?</small>
                            <small><Link to="/login" className="text-[var(--blue3)]">Log In</Link></small>
                        </label>
                    </div>
                </form>
            </div>
        </>
    );
}

export default RegisterForm;
