// LoginForm.jsx
// -----------------------------------------------------------------------------
// PRIMARY PURPOSE:
// Provides the login UI and handles user authentication through the backend.
// Includes password visibility toggling, error feedback with shake animation,
// and redirects authenticated users to the dashboard.
// -----------------------------------------------------------------------------

import SaveItLogo from "../assets/brand/SaveIt-Logo.png";
import UserIcon from "../assets/icons/email-outline.svg?react";
import PasswordIcon from "../assets/icons/lock-outline.svg?react";
import { loginUser } from "../services/DatabaseControl";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginForm() {

    // Toggle for displaying password in plain text
    const [showPassword, setShowPassword] = useState(false);

    // Holds backend login error messages
    const [error, setError] = useState("");

    // Controls shake animation when login fails
    const [shake, setShake] = useState(false);

    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // HANDLE LOGIN SUBMISSION
    // Collects input values, calls authentication RPC, and shows error feedback.
    // On success, navigates to the dashboard.
    // -------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const email = document.getElementById("email-input").value;
        const password = document.getElementById("password-input").value;

        const { data, error } = await loginUser(email, password);

        if (error) {
            setError(error.message);
            setShake(true);

            // Shake animation lasts briefly for visual feedback
            setTimeout(() => setShake(false), 400);
        } else {
            navigate("/dashboard");
        }
    };

    return (
        <>
            {/* LOGIN CARD CONTAINER */}
            <div className="flex flex-col justify-center items-center bg-white h-auto w-auto p-10 rounded-4xl shadow-md shadow-xl">

                {/* BRAND LOGO + TITLE */}
                <img src={SaveItLogo} alt="SaveIt Logo" className="w-15 h-auto mb-0" />
                <h6>SaveIt</h6>
                <h5 className="py-2">Login to Account</h5>

                {/* LOGIN FORM */}
                <form id="login-form" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-3">

                        {/* EMAIL INPUT FIELD */}
                        <label className="pl-5">Email</label>
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

                        {/* PASSWORD INPUT FIELD */}
                        <label className="pl-5">Password</label>
                        <div className="relative">
                            <PasswordIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                            <input
                                className="w-full"
                                id="password-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                required
                            />
                        </div>

                        {/* SHOW PASSWORD TOGGLE */}
                        <label className="flex flex-row items-center pl-4 gap-2 h-7">
                            <input
                                className="w-4 h-4 rounded-4xl text-xs"
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                            />
                            <small>Show Password</small>
                        </label>

                        {/* ERROR FEEDBACK BLOCK */}
                        {error && (
                            <div className={`flex justify-center text-red-500 ${shake ? "shake" : ""}`}>
                                {error}
                            </div>
                        )}

                        {/* SUBMIT BUTTON */}
                        <button id="login-btn" type="submit">
                            Login
                        </button>

                        {/* SIGN-UP LINK */}
                        <label className="flex justify-center gap-2">
                            <small>Don't have an account?</small>
                            <small>
                                <Link to="/register" className="text-[var(--blue3)]">
                                    Register
                                </Link>
                            </small>
                        </label>
                    </div>
                </form>
            </div>
        </>
    );
}

export default LoginForm;
