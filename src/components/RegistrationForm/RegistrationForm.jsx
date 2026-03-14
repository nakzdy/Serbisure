import { useState } from "react";
import { Link } from "react-router-dom";

function RegistrationForm({ title, subtitle, roles, skills, onRegister }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: roles[0],
        skill: skills[0]
    });
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const result = await onRegister(formData.email, formData.role, formData.name, formData.password, formData.skill);

        if (result.success) {
            setSubmitted(true);
        } else {
            const errorMessages = {
                "auth/email-already-in-use": "This email is already registered.",
                "auth/weak-password": "Password must be at least 6 characters.",
                "auth/invalid-email": "Please enter a valid email address.",
            };
            setError(errorMessages[result.error] || "Registration failed. Please try again.");
        }
        setLoading(false);
    }

    if (submitted) {
        return (
            <section>
                <div className="success-card">
                    <span className="success-icon"><i className="fa-solid fa-check"></i></span>
                    <h2 className="form-title">Registration Successful!</h2>
                    <p className="form-subtitle">
                        Welcome, {formData.name}! Your account has been created.
                    </p>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setSubmitted(false)}
                    >
                        Back to Registration
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section>
            <form onSubmit={handleSubmit}>
                <h2 className="form-title">{title}</h2>
                <p className="form-subtitle">{subtitle}</p>

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
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

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

                <div className="form-row">
                    <label>User Type:</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                        {roles.map((role, index) => (
                            <option key={index} value={role}>{role}</option>
                        ))}
                    </select>
                </div>

                {formData.role === "Service Worker" && (
                    <>
                        <div className="form-row">
                            <label>Skill Category:</label>
                            <select name="skill" value={formData.skill} onChange={handleChange}>
                                {skills.map((skill, index) => (
                                    <option key={index} value={skill}>{skill}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <label>Upload ID &amp; TESDA Certificate</label>
                            <div className="file-input">
                                <input type="file" required />
                            </div>
                        </div>
                    </>
                )}

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>

                <p className="muted-footer" style={{ marginTop: "10px", color: "var(--text)", fontSize: "14px" }}>
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        style={{ color: "var(--accent)", cursor: "pointer", fontWeight: "600", textDecoration: "none" }}
                    >
                        Log in here
                    </Link>
                </p>
            </form>
        </section>
    );
}

export default RegistrationForm;
