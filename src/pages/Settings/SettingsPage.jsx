import { useState, useRef } from "react";

function SettingsPage({ settings, onUpdateSettings }) {
    const [localEmail, setLocalEmail] = useState("user@example.com");
    const [localPassword, setLocalPassword] = useState("********");
    const [saveMessage, setSaveMessage] = useState("");
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleSave = () => {
        setSaveMessage("Changes saved successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
        onUpdateSettings({ ...settings }); // Trigger notification in App.jsx
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="glass-card" style={{ padding: "40px", maxWidth: "700px", width: "100%" }}>
                <h2 className="form-title">Settings</h2>
                <p className="form-subtitle">Update your account and app preferences</p>

                {saveMessage && (
                    <div style={{
                        padding: "12px",
                        background: "rgba(74, 222, 128, 0.15)",
                        color: "#4ade80",
                        borderRadius: "8px",
                        marginBottom: "20px",
                        fontSize: "14px",
                        textAlign: "center",
                        border: "1px solid rgba(74, 222, 128, 0.3)"
                    }}>
                        {saveMessage}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>

                    {/* Profile Picture Section */}
                    <div style={{ padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                        <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "var(--text)" }}>Profile Picture</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                            <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "50%",
                                background: avatarPreview ? "none" : "var(--accent)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "30px",
                                color: "#fff",
                                overflow: "hidden",
                                border: avatarPreview ? "2px solid var(--accent)" : "none"
                            }}>
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : <i className="fa-solid fa-user" style={{ fontSize: "32px", color: "var(--text-muted)" }}></i>}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handlePictureChange}
                                style={{ display: "none" }}
                            />
                            <button className="btn-primary" style={{ width: "auto", padding: "10px 20px" }} onClick={() => fileInputRef.current.click()}>
                                Change Picture
                            </button>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div style={{ padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                        <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "var(--text)" }}>Account Information</h3>
                        <div className="form-row" style={{ marginBottom: "15px" }}>
                            <label>Email Address</label>
                            <input type="email" value={localEmail} onChange={(e) => setLocalEmail(e.target.value)} />
                        </div>
                        <div className="form-row">
                            <label>New Password</label>
                            <input type="password" value={localPassword} onChange={(e) => setLocalPassword(e.target.value)} placeholder="Enter new password" />
                        </div>
                    </div>

                    {/* App Preferences */}
                    <div style={{ padding: "20px", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>
                        <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "var(--text)" }}>App Preferences</h3>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--card-border)" }}>
                            <span>Appearance</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ fontSize: "12px", color: settings?.darkMode ? "var(--accent)" : "var(--muted)" }}>
                                    {settings?.darkMode ? "Dark Mode" : "Light Mode"}
                                </span>
                                <div
                                    onClick={() => onUpdateSettings({ ...settings, darkMode: !settings.darkMode })}
                                    style={{
                                        width: "50px",
                                        height: "26px",
                                        background: settings?.darkMode ? "var(--accent)" : "rgba(0,0,0,0.1)",
                                        borderRadius: "13px",
                                        position: "relative",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        border: "1px solid var(--card-border)"
                                    }}
                                >
                                    <div style={{
                                        width: "20px",
                                        height: "20px",
                                        background: "#fff",
                                        borderRadius: "50%",
                                        position: "absolute",
                                        top: "2px",
                                        left: settings?.darkMode ? "26px" : "2px",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                                    }} />
                                </div>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
                            <span>Language</span>
                            <select
                                value={settings?.language}
                                onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value })}
                                style={{ width: "150px" }}
                            >
                                <option value="English">English</option>
                                <option value="Tagalog">Tagalog</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "30px" }}>
                    <button className="btn-primary" onClick={handleSave}>
                        Save All Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;

