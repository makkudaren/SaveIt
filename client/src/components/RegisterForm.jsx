import { useState } from "react";
import SaveItLogo from "../assets/brand/SaveIt-Logo.png";
import EmailIcon from "../assets/icons/email-outline.svg?react";
import UsernameIcon from "../assets/icons/at-outline.svg?react";
import PasswordIcon from "../assets/icons/lock-outline.svg?react";
import ConfirmIcon from "../assets/icons/checkmark-circle-outline.svg?react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabase-client";

function RegisterForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const username = document.getElementById("username-input").value.trim();
        const email = document.getElementById("email-input").value;

        // Password match check
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setShake(true);
            setTimeout(() => setShake(false), 400);
            return;
        }

        setError("");
        setLoading(true);

        // 1. CHECK IF USERNAME EXISTS
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

        // 2. SUPABASE SIGN UP
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

        const user = data.user;
        if (!user) {
            setLoading(false);
            setError("Signup failed. Try again.");
            return;
        }

    // 3. INSERT PROFILE WITH USERNAME
    const { error: profileError } = await supabase
        .from("profiles")
        .insert({
            id: user.id,
            username: username,
        });

    if (profileError) {
        console.log("Profile insert error:", profileError);
    }

    setLoading(false);
    alert("Account created! Please verify your email before logging in.");
    navigate("/login");
};


    return (
        <>
            <div className="flex flex-col justify-center items-center bg-white h-auto w-auto p-10 rounded-4xl shadow-md shadow-xl">
                <img src={SaveItLogo} alt="SaveIt Logo" className="w-15 h-auto mb-0" />
                <h6>SaveIt</h6>
                <h5 className="py-2">Register Account</h5>

                <form id="login-form" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-3">
                        
                        {/* USERNAME */}
                        <label className="pl-5" htmlFor="email">Personal Information</label>
                        <div className="relative">
                            <UsernameIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                            <input className="w-85" id="username-input" type="username" placeholder="Register Username" required />
                        </div>

                        {/* EMAIL */}
                        <div className="relative">
                            <EmailIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 fill-[var(--neutral2)]" />
                            <input className="w-85" id="email-input" type="email" placeholder="Register Email" required />
                        </div>

                        {/* PASSWORD */}
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

                        {/* CONFIRM PASSWORD */}
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

                        {/* ERROR MESSAGE */}
                        {error && (
                            <div className={`flex justify-center text-red-500 ${shake ? "shake" : ""}`}>
                                {error}
                            </div>
                        )}

                        {/* TERMS */}
                        <label className="flex flex-row items-center pl-4 gap-2 h-7">
                            <input className="w-4 h-4 rounded-4xl text-xs" type="checkbox" required />
                            <small>
                                I agree to <Link to="/terms-and-conditions" className="text-[var(--blue3)]">Terms and Conditions</Link>
                            </small>
                        </label>

                        <button id="login-btn" type="submit">
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>

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
