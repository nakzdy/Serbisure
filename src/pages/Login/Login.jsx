import { useState } from "react";
import { Link } from "react-router-dom";
import { BrandingHeader, RegistrationFooter } from "../../components";
import { appName, systemInfo } from "../../data/system";
import { signInWithGoogle, logoutUser } from "../../firebase/auth";
import { getUserProfile } from "../../firebase/db";

function Login({ onLogin }) {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "Homeowner",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(""); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await onLogin(formData.email, formData.password, formData.role);

        if (!result.success) {
            // Map Firebase Auth error codes to user-friendly messages
            const errorMessages = {
                "auth/invalid-credential": "Invalid email or password.",
                "auth/user-not-found": "No account found with this email.",
                "auth/wrong-password": "Incorrect password.",
                "auth/too-many-requests": "Too many failed attempts. Please try again later.",
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/role-mismatch": "This account is not registered for the selected role.",
            };
            setError(errorMessages[result.error] || "Login failed. Please try again.");
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError("");
        setLoading(true);
        try {
            const result = await signInWithGoogle();
            const profile = await getUserProfile(result.user.uid);
            
            // If they don't have a profile setup, they shouldn't be logging in.
            if (!profile || !profile.role) {
                await logoutUser();
                setError("No account found for this Google email. Please register first.");
                setLoading(false);
                return;
            }
            // App.jsx will automatically handle the redirection since their profile exists.
        } catch (err) {
            console.error("Google Auth Error:", err);
            if (err.code === "auth/unauthorized-domain") {
                setError("This domain is not authorized for Google Sign-in. Please add it in Firebase Console.");
            } else if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
                setError("Google sign-in failed. Please try again.");
            }
            setLoading(false);
        }
    };

    return (
        <main className="page-wrapper">
            <BrandingHeader title={appName} />
            <section>
                <form onSubmit={handleSubmit}>
                    <h2 className="form-title">Login</h2>
                    <p className="form-subtitle">Access your SerbiSure account</p>

                    {error && (
                        <div style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            background: "rgba(252, 92, 101, 0.12)",
                            border: "1px solid rgba(252, 92, 101, 0.25)",
                            color: "#fc5c65",
                            fontSize: "13px",
                            fontWeight: 500
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="form-row">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-row">
                        <label>Login As</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                width: "100%", padding: "12px 16px", borderRadius: "12px",
                                border: "1px solid var(--input-border)", background: "var(--input-bg)",
                                color: "var(--text)", fontFamily: "inherit", fontSize: "15px",
                                marginBottom: "16px"
                            }}
                        >
                            <option value="Homeowner">Homeowner</option>
                            <option value="Service Worker">Service Worker</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="btn-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Signing in..." : "Log In"}
                        </button>
                        
                        <div style={{ display: "flex", alignItems: "center", textAlign: "center", color: "var(--text-muted)", fontSize: "12px", margin: "4px 0" }}>
                            <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--input-border)" }} />
                            <span style={{ padding: "0 10px" }}>OR</span>
                            <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--input-border)" }} />
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                                width: "100%", padding: "14px", borderRadius: "12px",
                                background: "var(--input-bg)", color: "var(--text)", 
                                border: "1px solid var(--input-border)",
                                fontSize: "15px", fontWeight: "600", cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M47.5 24.6c0-1.6-.1-3.2-.4-4.7H24.5v8.9h13c-.6 3-2.3 5.5-4.9 7.2v5.9h7.9c4.6-4.3 7-10.6 7-17.3z" fill="#4285F4"/>
                                <path d="M24.5 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-5.9c-2.1 1.4-4.9 2.2-8 2.2-6.1 0-11.3-4.1-13.2-9.7H3.1v6.1C7.1 42.7 15.2 48 24.5 48z" fill="#34A853"/>
                                <path d="M11.3 28.8c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5v-6.1H3.1C1.1 17.4 0 20.6 0 24.3s1.1 6.9 3.1 9.6l8.2-5.1z" fill="#FBBC04"/>
                                <path d="M24.5 9.6c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C36.4 2.5 30.9 0 24.5 0 15.2 0 7.1 5.3 3.1 13.1l8.2 6.1c1.9-5.6 7.1-9.6 13.2-9.6z" fill="#EA4335"/>
                            </svg>
                            Log in with Google
                        </button>
                    </div>

                    <p className="muted-footer" style={{ marginTop: "10px", color: "var(--text)", fontSize: "14px" }}>
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            style={{ color: "var(--accent)", cursor: "pointer", fontWeight: "600", textDecoration: "none" }}
                        >
                            Register here
                        </Link>
                    </p>
                </form>
            </section>
            <RegistrationFooter
                name={systemInfo.name}
                tagline={systemInfo.tagline}
                version={systemInfo.version}
            />
        </main>
    );
}

export default Login;