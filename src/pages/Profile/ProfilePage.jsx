import { useState } from "react";

function ProfilePage({ user, onUpdateProfile }) {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        about: user.about || "Hello! I am a " + (user.role === "worker" ? "Service Worker" : "Homeowner") + " on SerbiSure.",
        skills: user.skills || (user.role === "worker" ? "Plumbing, Electrical, Carpentry" : ""),
        location: user.location || "Manila, Philippines"
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateProfile({
            ...user,
            name: formData.name,
            email: formData.email,
            about: formData.about,
            skills: formData.skills,
            location: formData.location
        });
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="page-wrapper" style={{ width: "100%", maxWidth: "800px" }}>
            {showSuccess && (
                <div style={{
                    background: "var(--status-pending)",
                    color: "var(--status-pending-text)",
                    padding: "14px 20px",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    border: "1px solid var(--status-pending-border)",
                    fontSize: "14px",
                    fontWeight: "500",
                    width: "100%",
                    textAlign: "center"
                }}>
                    <span><i className="fa-solid fa-check"></i> Profile updated successfully!</span>
                </div>
            )}

            <div style={{
                background: "var(--card-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: "16px",
                padding: "32px",
                width: "100%"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                    <div>
                        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text)", margin: "0 0 4px 0" }}>My Profile</h2>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Personal information for the SerbiSure community</p>
                    </div>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ width: "auto", padding: "10px 20px", margin: 0 }}>
                            Edit Profile
                        </button>
                    )}
                </div>

                <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                    {/* Left: Avatar & Role */}
                    <div style={{ flex: "0 0 160px", textAlign: "center" }}>
                        <div style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #6c5ce7, #4834d4)",
                            margin: "0 auto 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "48px",
                            boxShadow: "0 8px 24px rgba(108, 92, 231, 0.3)"
                        }}>
                            <i className="fa-solid fa-user" style={{ fontSize: "60px", color: "var(--text-muted)", opacity: 0.5 }}></i>
                        </div>
                        <span style={{
                            padding: "5px 14px",
                            borderRadius: "16px",
                            background: "var(--status-pending)",
                            color: "var(--status-pending-text)",
                            fontSize: "11px",
                            fontWeight: "600",
                            textTransform: "uppercase",
                            letterSpacing: "1px"
                        }}>
                            {user.role === "worker" ? "Service Provider" : "Homeowner"}
                        </span>
                    </div>

                    {/* Right: Details */}
                    <div style={{ flex: 1, minWidth: "240px" }}>
                        {isEditing ? (
                            <form onSubmit={handleSubmit} style={{
                                padding: 0, background: "none", border: "none",
                                boxShadow: "none", backdropFilter: "none", gap: "14px"
                            }}>
                                <div className="form-row">
                                    <label>Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <label>Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div className="form-row">
                                    <label>Location</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleChange} />
                                </div>
                                <div className="form-row">
                                    <label>About Me</label>
                                    <textarea name="about" value={formData.about} onChange={handleChange} rows="3"
                                        style={{ borderRadius: "10px", padding: "12px", background: "var(--input-bg)", color: "#fff", border: "1px solid var(--input-border)", fontFamily: "inherit", fontSize: "14px" }} />
                                </div>
                                {user.role === "worker" && (
                                    <div className="form-row">
                                        <label>Skills / Services</label>
                                        <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. Plumbing, Electrical" />
                                    </div>
                                )}
                                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 2 }}>Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} style={{
                                        flex: 1, padding: "12px", borderRadius: "12px",
                                        border: "1px solid var(--card-border)", background: "transparent",
                                        color: "var(--text)", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "inherit"
                                    }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div>
                                    <label style={{ display: "block", marginBottom: "4px" }}>Full Name</label>
                                    <p style={{ fontSize: "18px", fontWeight: "600", color: "var(--text)", margin: 0 }}>{user.name}</p>
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: "4px" }}>Email Address</label>
                                    <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: 0 }}>{user.email}</p>
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: "4px" }}>Location</label>
                                    <p style={{ fontSize: "15px", color: "var(--text-muted)", margin: 0 }}>{formData.location}</p>
                                </div>
                                <div>
                                    <label style={{ display: "block", marginBottom: "4px" }}>About Me</label>
                                    <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text)", margin: 0 }}>{formData.about}</p>
                                </div>
                                {user.role === "worker" && (
                                    <div>
                                        <label style={{ display: "block", marginBottom: "4px" }}>Skills & Services</label>
                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                                            {formData.skills.split(",").map((skill, i) => (
                                                <span key={i} style={{
                                                    padding: "4px 12px", background: "var(--status-pending)",
                                                    border: "1px solid var(--status-pending-border)", borderRadius: "12px",
                                                    fontSize: "12px", color: "var(--status-pending-text)"
                                                }}>{skill.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
