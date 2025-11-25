import SaveItLogo from "../assets/brand/SaveIt-Logo.png";
import UserIcon from "../assets/icons/email-outline.svg?react";
import PasswordIcon from "../assets/icons/lock-outline.svg?react";
import supabase from "../supabase-client";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;

    // SUPABASE LOGIN
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
        });

        if (error) {
            setError(error.message);
            setShake(true);
            setTimeout(() => setShake(false), 400);
            alert("ERROR?")
        } else {
            navigate("/dashboard");
            
        }
    };


    return (
        <>
            <div className="flex flex-col justify-center items-center bg-white h-auto w-auto p-10 rounded-4xl shadow-md shadow-xl">
                <img src={SaveItLogo} alt="SaveIt Logo" className="w-15 h-auto mb-0" />
                <h6>SaveIt</h6>
                <h5 className="py-2">Login to Account</h5>

                <form id="login-form" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-3">
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

                        <label className="pl-5" htmlFor="password">Password</label>
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

                        <label className="flex flex-row items-center pl-4 gap-2 h-7">
                            <input
                                className="w-4 h-4 rounded-4xl text-xs"
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                            />
                            <small>Show Password</small>
                        </label>

                        {/* ERROR MESSAGE */}
                        {error && (
                            <div className={`flex justify-center text-red-500 ${shake ? "shake" : ""}`}>
                                {error}
                            </div>
                        )}

                        <button id="login-btn" type="submit">Login</button>

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
