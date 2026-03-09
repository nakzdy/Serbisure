import { useState } from "react";
import { Link } from "react-router-dom";
import { BrandingHeader, RegistrationFooter } from "../../components";
import { appName, systemInfo } from "../../data/system";

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
            };
            setError(errorMessages[result.error] || "Login failed. Please try again.");
        }
        setLoading(false);
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

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? "Signing in..." : "Log In"}
                    </button>

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