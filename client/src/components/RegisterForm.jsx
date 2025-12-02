// RegisterForm.jsx
// -----------------------------------------------------------------------------
// PRIMARY PURPOSE:
// Provides the user registration interface. Handles username availability
// checks, password confirmation, error feedback animations, and account
// creation through backend services.
// Redirects the user to login after successful registration.
// -----------------------------------------------------------------------------

import { useState } from "react";
import SaveItLogo from "../assets/brand/SaveIt-Logo.png";
import EmailIcon from "../assets/icons/email-outline.svg?react";
import UsernameIcon from "../assets/icons/at-outline.svg?react";
import PasswordIcon from "../assets/icons/lock-outline.svg?react";
import ConfirmIcon from "../assets/icons/checkmark-circle-outline.svg?react";
import { Link, useNavigate } from "react-router-dom";

// BACKEND SERVICES (USERNAME CHECK + ACCOUNT CREATION)
import { checkUsernameExists, registerUser } from "../services/DatabaseControl";

function RegisterForm() {

    // Stores password fields for comparison and submission
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Error message and shake animation trigger
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);

    // Loading state for registration button
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // HANDLE REGISTRATION SUBMISSION
    // Validates password match, checks username availability, attempts account
    // registration, and provides animated error feedback when needed.
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        const username = document.getElementById("username-input").value.trim();
        const email = document.getElementById("email-input").value;

        // 1. VALIDATE PASSWORD MATCH
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }

        setError("");
        setLoading(true);

        // 2. CHECK USERNAME AVAILABILITY USING BACKEND RPC
        const { data: existingUser } = await checkUsernameExists(username);

        if (existingUser) {
            setLoading(false);
            setError("Username is already taken.");
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }

        // 3. REGISTER NEW USER ACCOUNT (AUTH + PROFILE INSERT)
        const { error, profileError } = await registerUser(email, password, username);

        if (error) {
            setLoading(false);
            setError(error.message);
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }

        if (profileError) {
            console.log("Profile insert error:", profileError);
        }

        setLoading(false);
        alert("Account created! Please verify your email before logging in.");
        navigate("/login");
    };

    return (
        <div className="flex flex-col justify-center items-center bg-white h-auto w-auto p-10 rounded-4xl shadow-md shadow-xl">

            {/* BRAND LOGO + TITLE */}
            <img src={SaveItLogo} alt="SaveIt Logo" className="w-15 h-auto mb-0" />
            <h6>SaveIt</h6>
            <h5 className="py-2">Register Account</h5>

            {/* REGISTRATION FORM */}
            <form id="login-form" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3 justify-center">

                    {/* PERSONAL INFORMATION SECTION */}
                    <label className="pl-5">Personal Information</label>

                    {/* USERNAME INPUT */}
                    <div className="relative">
                        <UsernameIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                        <input
                            id="username-input"
                            className="w-85"
                            type="text"
                            placeholder="Register Username"
                            required
                        />
                    </div>

                    {/* EMAIL INPUT */}
                    <div className="relative">
                        <EmailIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                        <input
                            id="email-input"
                            className="w-85"
                            type="email"
                            placeholder="Register Email"
                            required
                        />
                    </div>

                    {/* PASSWORD CREATION SECTION */}
                    <label className="pl-5">Password Creation</label>

                    {/* PASSWORD INPUT */}
                    <div className="relative">
                        <PasswordIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                        <input
                            className="w-85"
                            id="password-input"
                            type="password"
                            placeholder="Enter Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* CONFIRM PASSWORD INPUT */}
                    <div className="relative">
                        <ConfirmIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                        <input
                            className="w-85"
                            id="confirm-password-input"
                            type="password"
                            placeholder="Confirm Password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    {/* ERROR FEEDBACK BLOCK */}
                    {error && (
                        <div className={`flex justify-center text-red-500 text-center px-4 ${shake ? "shake" : ""}`}>
                            <small className="break-words max-w-full">{error}</small>
                        </div>
                    )}

                    {/* TERMS ACCEPTANCE CHECKBOX */}
                    <label className="flex flex-row items-center pl-4 gap-2 h-7">
                        <input className="w-4 h-4" type="checkbox" required />
                        <small>
                            I agree to{" "}
                            <Link to="/terms-and-conditions" className="text-[var(--blue3)]">
                                Terms and Conditions
                            </Link>
                        </small>
                    </label>

                    {/* SUBMIT BUTTON */}
                    <button id="login-btn" type="submit">
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>

                    {/* LOGIN LINK */}
                    <label className="flex justify-center gap-2">
                        <small>Already have an account?</small>
                        <small>
                            <Link to="/login" className="text-[var(--blue3)]">
                                Log In
                            </Link>
                        </small>
                    </label>

                </div>
            </form>
        </div>
    );
}

export default RegisterForm;
