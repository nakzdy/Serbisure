import { useState, useRef } from "react";
import "./SettingsPage.css";

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
            <div className="settings-page">
                <div className="settings-card">
                    <h2>Settings</h2>
                    <p className="settings-subtitle">Update your account and app preferences</p>

                    {saveMessage && (
                        <div className="settings-success">
                            <i className="fa-solid fa-circle-check" style={{ marginRight: "8px" }}></i>
                            {saveMessage}
                        </div>
                    )}

                    <div className="settings-sections">

                        {/* Profile Picture Section */}
                        <div className="settings-section">
                            <h3>Profile Picture</h3>
                            <div className="settings-avatar-row">
                                <div className="settings-avatar">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" />
                                    ) : (
                                        <span className="settings-avatar-placeholder">
                                            <i className="fa-solid fa-user"></i>
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handlePictureChange}
                                    style={{ display: "none" }}
                                />
                                <button
                                    className="settings-change-pic"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    <i className="fa-solid fa-camera" style={{ marginRight: "6px", fontSize: "12px" }}></i>
                                    Change Picture
                                </button>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="settings-section">
                            <h3>Account Information</h3>
                            <div className="settings-field">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={localEmail}
                                    onChange={(e) => setLocalEmail(e.target.value)}
                                />
                            </div>
                            <div className="settings-field">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={localPassword}
                                    onChange={(e) => setLocalPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>

                        {/* App Preferences */}
                        <div className="settings-section">
                            <h3>App Preferences</h3>

                            {/* Dark Mode Toggle */}
                            <div className="settings-toggle-row">
                                <span className="settings-toggle-label">Appearance</span>
                                <div className="settings-toggle-right">
                                    <span className="settings-toggle-value">
                                        {settings?.darkMode ? "Dark Mode" : "Light Mode"}
                                    </span>
                                    <label className="settings-switch">
                                        <input
                                            type="checkbox"
                                            checked={settings?.darkMode || false}
                                            onChange={() => onUpdateSettings({ ...settings, darkMode: !settings.darkMode })}
                                        />
                                        <span className="settings-switch-track"></span>
                                        <span className="settings-switch-thumb"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Language Selector */}
                            <div className="settings-toggle-row">
                                <span className="settings-toggle-label">Language</span>
                                <div className="settings-toggle-right">
                                    <select
                                        value={settings?.language}
                                        onChange={(e) => onUpdateSettings({ ...settings, language: e.target.value })}
                                        style={{ width: "140px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--input-border)", background: "var(--card-bg-solid)", color: "var(--text)", fontSize: "13px", fontFamily: "inherit" }}
                                    >
                                        <option value="English">English</option>
                                        <option value="Tagalog">Tagalog</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Developer / Testing */}
                        <div className="settings-section settings-dev-section">
                            <div className="settings-dev-header">
                                <span className="settings-dev-label">DEVELOPER / TESTING</span>
                            </div>

                            {/* Use Mock Data Toggle */}
                            <div className="settings-dev-row">
                                <div className="settings-dev-icon mock-data-icon">
                                    <i className="fa-solid fa-rotate"></i>
                                </div>
                                <div className="settings-dev-info">
                                    <span className="settings-dev-title">Use Mock Data</span>
                                    <span className="settings-dev-desc">Show test bookings & requests</span>
                                </div>
                                <label className="settings-switch" id="toggle-mock-data">
                                    <input
                                        type="checkbox"
                                        checked={settings?.showMockData || false}
                                        onChange={() => onUpdateSettings({ ...settings, showMockData: !settings.showMockData })}
                                    />
                                    <span className="settings-switch-track"></span>
                                    <span className="settings-switch-thumb"></span>
                                </label>
                            </div>

                            {/* Mock Status Toggle — only visible when mock data is ON */}
                            {settings?.showMockData && (
                                <div className="settings-dev-row">
                                    <div className="settings-dev-icon mock-status-icon">
                                        <i className="fa-solid fa-circle-info"></i>
                                    </div>
                                    <div className="settings-dev-info">
                                        <span className="settings-dev-title">
                                            Mock Status: {settings?.mockStatusOpen ? "Open" : "Closed"}
                                        </span>
                                        <span className="settings-dev-desc">
                                            Requests show as {settings?.mockStatusOpen ? "Open" : "Closed"}
                                        </span>
                                    </div>
                                    <label className="settings-switch" id="toggle-mock-status">
                                        <input
                                            type="checkbox"
                                            checked={settings?.mockStatusOpen || false}
                                            onChange={() => onUpdateSettings({ ...settings, mockStatusOpen: !settings.mockStatusOpen })}
                                        />
                                        <span className="settings-switch-track"></span>
                                        <span className="settings-switch-thumb"></span>
                                    </label>
                                </div>
                            )}
                        </div>

                    </div>{/* /settings-sections */}

                    <button className="settings-save-btn" onClick={handleSave}>
                        Save All Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
