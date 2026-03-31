import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithGoogle, logoutUser } from "../../firebase/auth";
import { getUserProfile } from "../../firebase/db";
import "./RegistrationForm.css";

const STEPS = ["Account", "Profile", "Confirm"];

function PasswordStrength({ password }) {
    const getStrength = (p) => {
        if (!p) return { level: 0, label: "", color: "" };
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        if (score <= 1) return { level: 1, label: "Weak", color: "#fc5c65" };
        if (score === 2) return { level: 2, label: "Fair", color: "#f9ca24" };
        if (score === 3) return { level: 3, label: "Good", color: "#6ab04c" };
        return { level: 4, label: "Strong", color: "#638cff" };
    };
    const { level, label, color } = getStrength(password);
    if (!password) return null;
    return (
        <div className="reg-strength">
            <div className="reg-strength-bars">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className="reg-strength-bar"
                        style={{ background: i <= level ? color : "rgba(255,255,255,0.1)" }}
                    />
                ))}
            </div>
            <span style={{ color, fontSize: "12px", fontWeight: 600 }}>{label}</span>
        </div>
    );
}

function FloatingInput({ id, label, type = "text", value, onChange, name, required, children }) {
    const [focused, setFocused] = useState(false);
    const isLifted = focused || value;
    return (
        <div className={`reg-field ${isLifted ? "lifted" : ""} ${focused ? "focused" : ""}`}>
            <label className="reg-label" htmlFor={id}>{label}</label>
            {children || (
                <input
                    id={id}
                    className="reg-input"
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required={required}
                    autoComplete="off"
                />
            )}
        </div>
    );
}

function StepIndicator({ current, total }) {
    return (
        <div className="reg-steps">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className={`reg-step-dot ${i < current ? "done" : i === current ? "active" : ""}`}>
                    {i < current ? "✓" : i + 1}
                </div>
            ))}
            <div className="reg-steps-track">
                <div className="reg-steps-fill" style={{ width: `${(current / (total - 1)) * 100}%` }} />
            </div>
        </div>
    );
}

function RegistrationForm({ title, subtitle, roles, skills, onRegister, onGoogleComplete, onValidateStart, onValidateEnd }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", role: roles[0], skill: skills[0]
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleUser, setGoogleUser] = useState(null); // holds Google result before role pick
    const [googleRole, setGoogleRole] = useState(roles[0]);
    const [googleSkill, setGoogleSkill] = useState(skills[0]);

    async function handleGoogleSignIn() {
        if (onValidateStart) onValidateStart();
        setGoogleLoading(true);
        setError("");
        try {
            const result = await signInWithGoogle();
            
            // Check if profile already exists in DB to prevent "re-registering"
            const profile = await getUserProfile(result.user.uid);
            if (profile && profile.role) {
                await logoutUser(); // Sign out right away
                setError("This Google account is already registered. Please go to Login.");
                setGoogleLoading(false);
                if (onValidateEnd) onValidateEnd();
                return;
            }

            // Don't save yet — show role picker first
            setGoogleUser(result.user);
        } catch (err) {
            console.error("Google Auth Error:", err);
            const googleErrorMessages = {
                "auth/popup-closed-by-user": null, // silent
                "auth/cancelled-popup-request": null, // silent
                "auth/unauthorized-domain": "This domain is not authorized for Google Sign-in. Please add it in Firebase Console.",
                "auth/account-exists-with-different-credential": "This email is already registered with email & password. Please sign in using your password instead.",
                "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
                "auth/user-disabled": "This account has been disabled. Please contact support.",
                "auth/popup-blocked": "Popup was blocked by your browser. Please allow popups and try again.",
            };
            const msg = googleErrorMessages[err.code];
            if (msg !== null) {
                setError(msg || "Google sign-in failed. Please try again.");
            }
        }
        if (onValidateEnd) onValidateEnd();
        setGoogleLoading(false);
    }

    async function handleGoogleRoleConfirm() {
        setLoading(true);
        setError("");
        const result = await onGoogleComplete(googleUser, googleRole, googleSkill);
        if (result && !result.success) {
            setError("Failed to save your profile. Please try again.");
        }
        setLoading(false);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    }

    function handleNext(e) {
        e.preventDefault();
        setError("");
        if (step === 0) {
            if (!formData.email) return setError("Please enter your email address.");
            if (!/\S+@\S+\.\S+/.test(formData.email)) return setError("Enter a valid email address.");
            if (!formData.password || formData.password.length < 6) return setError("Password must be at least 6 characters.");
        }
        if (step === 1) {
            if (!formData.name) return setError("Please enter your full name.");
        }
        setStep(s => s + 1);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");
        const result = await onRegister(formData.email, formData.role, formData.name, formData.password, formData.skill);
        if (result.success) {
            setSubmitted(true);
        } else {
            const msgs = {
                "auth/email-already-in-use": "This email is already registered.",
                "auth/weak-password": "Password must be at least 6 characters.",
                "auth/invalid-email": "Please enter a valid email address.",
            };
            setError(msgs[result.error] || "Registration failed. Please try again.");
        }
        setLoading(false);
    }

    if (submitted) {
        return (
            <div className="reg-wrapper">
                <div className="reg-card reg-success-card">
                    <div className="reg-success-icon">✓</div>
                    <h2 className="reg-title">You're all set!</h2>
                    <p className="reg-subtitle">Welcome to SerbiSure, <strong>{formData.name}</strong>!<br />Your account has been created successfully.</p>
                    <Link to="/login" className="reg-btn">Go to Login</Link>
                </div>
            </div>
        );
    }

    // After Google sign-in — show role picker before saving
    if (googleUser) {
        return (
            <div className="reg-wrapper">
                <div className="reg-card">
                    <div className="reg-header">
                        {googleUser.photoURL && (
                            <img src={googleUser.photoURL} alt="avatar" className="reg-google-avatar" />
                        )}
                        <h2 className="reg-title">One more step!</h2>
                        <p className="reg-subtitle">
                            Hi <strong>{googleUser.displayName}</strong>! How will you use SerbiSure?
                        </p>
                    </div>

                    {error && <div className="reg-error">{error}</div>}

                    <div className="reg-role-picker">
                        {roles.map((r) => (
                            <button
                                key={r}
                                type="button"
                                className={`reg-role-card ${googleRole === r ? "selected" : ""}`}
                                onClick={() => setGoogleRole(r)}
                            >
                                <span className="reg-role-icon">
                                    {r === "Service Worker" ? "🔧" : "🏠"}
                                </span>
                                <strong>{r}</strong>
                                <span className="reg-role-desc">
                                    {r === "Service Worker"
                                        ? "I offer domestic services"
                                        : "I am looking to hire a worker"}
                                </span>
                            </button>
                        ))}
                    </div>

                    {googleRole === "Service Worker" && (
                        <div className="reg-field lifted" style={{ marginTop: "4px" }}>
                            <label className="reg-label" htmlFor="gskill">Primary skill</label>
                            <select
                                id="gskill"
                                className="reg-input reg-select"
                                value={googleSkill}
                                onChange={e => setGoogleSkill(e.target.value)}
                            >
                                {skills.map((s, i) => <option key={i} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}

                    <button
                        type="button"
                        className="reg-btn"
                        onClick={handleGoogleRoleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Continue →"}
                    </button>

                    <p className="reg-footer">
                        Wrong account?{" "}
                        <button
                            type="button"
                            className="reg-link"
                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}
                            onClick={() => setGoogleUser(null)}
                        >
                            Go back
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="reg-wrapper">
            <div className="reg-card">
                {/* Header */}
                <div className="reg-header">
                    <div className="reg-logo">S</div>
                    <h2 className="reg-title">{title}</h2>
                    <p className="reg-subtitle">{subtitle}</p>
                </div>

                {/* Step indicator */}
                <StepIndicator current={step} total={STEPS.length} />
                <p className="reg-step-label">Step {step + 1} of {STEPS.length} — <strong>{STEPS[step]}</strong></p>

                {/* Google Sign-in — only on step 0 */}
                {step === 0 && (
                    <>
                        <button
                            type="button"
                            className="reg-google-btn"
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M47.5 24.6c0-1.6-.1-3.2-.4-4.7H24.5v8.9h13c-.6 3-2.3 5.5-4.9 7.2v5.9h7.9c4.6-4.3 7-10.6 7-17.3z" fill="#4285F4"/>
                                <path d="M24.5 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-5.9c-2.1 1.4-4.9 2.2-8 2.2-6.1 0-11.3-4.1-13.2-9.7H3.1v6.1C7.1 42.7 15.2 48 24.5 48z" fill="#34A853"/>
                                <path d="M11.3 28.8c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5v-6.1H3.1C1.1 17.4 0 20.6 0 24.3s1.1 6.9 3.1 9.6l8.2-5.1z" fill="#FBBC04"/>
                                <path d="M24.5 9.6c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C36.4 2.5 30.9 0 24.5 0 15.2 0 7.1 5.3 3.1 13.1l8.2 6.1c1.9-5.6 7.1-9.6 13.2-9.6z" fill="#EA4335"/>
                            </svg>
                            {googleLoading ? "Connecting..." : "Continue with Google"}
                        </button>
                        <div className="reg-divider">
                            <span>or register with email</span>
                        </div>
                    </>
                )}

                {/* Error */}
                {error && <div className="reg-error">{error}</div>}

                {/* STEP 0 — Account Credentials */}
                {step === 0 && (
                    <form onSubmit={handleNext} className="reg-form">
                        <FloatingInput id="email" label="Email address" type="email" name="email" value={formData.email} onChange={handleChange} required />
                        <FloatingInput id="password" label="Create a password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required>
                            <div className="reg-pw-wrapper">
                                <input
                                    id="password"
                                    className="reg-input"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                                <button type="button" className="reg-pw-toggle" onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </FloatingInput>
                        <PasswordStrength password={formData.password} />
                        <button type="submit" className="reg-btn">Next →</button>
                    </form>
                )}

                {/* STEP 1 — Profile Info */}
                {step === 1 && (
                    <form onSubmit={handleNext} className="reg-form">
                        <FloatingInput id="name" label="Full name" name="name" value={formData.name} onChange={handleChange} required />
                        <div className="reg-field lifted">
                            <label className="reg-label" htmlFor="role">I am a...</label>
                            <select id="role" name="role" className="reg-input reg-select" value={formData.role} onChange={handleChange}>
                                {roles.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                        </div>
                        {formData.role === "Service Worker" && (
                            <div className="reg-field lifted">
                                <label className="reg-label" htmlFor="skill">Primary skill</label>
                                <select id="skill" name="skill" className="reg-input reg-select" value={formData.skill} onChange={handleChange}>
                                    {skills.map((s, i) => <option key={i} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                        {formData.role === "Service Worker" && (
                            <div className="reg-field lifted">
                                <label className="reg-label">Upload ID & TESDA Certificate</label>
                                <div className="reg-file-zone">
                                    <span className="reg-file-icon">📎</span>
                                    <span>Click to upload or drag & drop</span>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>JPG, PNG, PDF supported</span>
                                    <input type="file" className="reg-file-hidden" accept=".jpg,.jpeg,.png,.pdf" />
                                </div>
                            </div>
                        )}
                        <div className="reg-btn-row">
                            <button type="button" className="reg-btn-ghost" onClick={() => setStep(0)}>← Back</button>
                            <button type="submit" className="reg-btn">Next →</button>
                        </div>
                    </form>
                )}

                {/* STEP 2 — Review & Confirm */}
                {step === 2 && (
                    <form onSubmit={handleSubmit} className="reg-form">
                        <div className="reg-review">
                            <div className="reg-review-row"><span>Email</span><strong>{formData.email}</strong></div>
                            <div className="reg-review-row"><span>Name</span><strong>{formData.name}</strong></div>
                            <div className="reg-review-row"><span>Role</span><strong>{formData.role}</strong></div>
                            {formData.role === "Service Worker" && (
                                <div className="reg-review-row"><span>Skill</span><strong>{formData.skill}</strong></div>
                            )}
                            <div className="reg-review-row"><span>Password</span><strong>{"•".repeat(formData.password.length)}</strong></div>
                        </div>
                        <p className="reg-terms">
                            By creating an account you agree to our{" "}
                            <a href="#" className="reg-link">Terms of Service</a> and{" "}
                            <a href="#" className="reg-link">Privacy Policy</a>.
                        </p>
                        <div className="reg-btn-row">
                            <button type="button" className="reg-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                            <button type="submit" className="reg-btn" disabled={loading}>
                                {loading ? "Creating account..." : "Create Account"}
                            </button>
                        </div>
                    </form>
                )}

                <p className="reg-footer">
                    Already have an account?{" "}
                    <Link to="/login" className="reg-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default RegistrationForm;
